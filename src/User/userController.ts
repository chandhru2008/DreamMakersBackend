// users.controller.ts
import { Request, ResponseToolkit } from '@hapi/hapi';
import { getUserByIdFromDb, createUserInDb, geAlltUserFromDb, getUserByEmail } from './userService';
import { getCache, setCache } from '../lib/cache';
import { UserSchema } from './userSchema';
import { IUser } from '../model';
import argon2 from 'argon2';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../lib/token';
import {
  isRefreshTokenValid,
  revokeRefreshToken,
  storeRefreshToken,
} from '../lib/refreshTokenStore';

export const getUserById = async (request: Request, h: ResponseToolkit) => {

  const { userId } = request.query;

  console.log(userId);

  const user = await getUserByIdFromDb(String(userId));

  if (!user) {
    return h.response({ message: 'User not found' }).code(404);
  }

  return h.response(user).code(200);
};

export const getMe = async (request: Request, h: ResponseToolkit) => {
  // Hapi credentials usually contain the payload from your JWT
  const { userId } = request.auth.credentials;
  const cacheKey = `user_profile:${userId}`;

  try {
    // 1. Try to get data from Redis
    const cachedUser = await getCache(cacheKey);

    if (cachedUser) {
      // Parse it if your helper doesn't do it automatically
      return h.response(cachedUser).code(200);
    }

    // 2. Cache Miss - Go to Database
    const user = await getUserByIdFromDb(String(userId));

    if (!user) {
      return h.response({ message: 'User not found' }).code(404);
    }

    // 3. Prepare the data (CRITICAL: Always remove password)
    const { password, ...userResponse } = user;

    // 4. Save to Redis (Write-back)
    await setCache(cacheKey, JSON.stringify(userResponse), 300);

    return h.response(userResponse).code(200);

  } catch (error) {
    console.error('Cache or DB error:', error);

    // 5. Fallback logic: Ensure password is STILL removed here
    const user = await getUserByIdFromDb(String(userId));

    if (user) {
      const { password, ...userResponse } = user; // Safety first!
      return h.response(userResponse).code(200);
    }

    return h.response({ error: 'Internal Server Error' }).code(500);
  }
};

export const getAllUsers = async (request: Request, h: ResponseToolkit) => {
  try {
    const userId = request.params.id
    const users = await geAlltUserFromDb();
    return h.response(users).code(200);
  } catch (error) {
    console.error('Error fetching users:', error);
    return h.response({ error: 'Failed to fetch users' }).code(500);
  }
}

export const createUser = async (request: Request, h: ResponseToolkit) => {
  try {
    const payloadValidationResult = UserSchema.safeParse(request.payload);

    if (!payloadValidationResult.success) {
      return h.response({
        message: "Invalid payload",
        error: payloadValidationResult.error.issues,
      }).code(400);
    }

    const userData = payloadValidationResult.data;

    // 🔒 HASH THE PASSWORD HERE
    // 'userData.password' is the plain text from the user
    const hashedPassword = await argon2.hash(userData.password);

    // Replace the plain text password with the hashed one
    const userToSave = {
      ...userData,
      password: hashedPassword,
      createdAt: new Date().toISOString(), // Good practice to add this now
    };

    const createdUser = await createUserInDb(userToSave);

    const userId = createdUser.insertedId.toString();
    const accessToken = generateAccessToken({ userId });
    const { refreshToken, tokenId } = generateRefreshToken(userId);

    await storeRefreshToken(userId, tokenId);

    return h
      .response({ accessToken })
      .state('refresh_token', refreshToken, {
        isHttpOnly: true,
        isSecure: process.env.NODE_ENV === 'production',
        isSameSite: 'Strict',
        path: '/', // Set to '/' if you want logout to also be able to clear it
      })
      .code(201);

  } catch (error) {
    console.error('Error creating user:', error);
    return h.response({ error: 'Failed to create user' }).code(500);
  }
};

export const getUser = async (request: Request, h: ResponseToolkit) => {
  const { id } = request.params as { id: string };

  const cacheKey = `user:${id}`;

  // 1️⃣ Try cache
  const cachedUser = await getCache(cacheKey);
  if (cachedUser) {
    return h.response({
      source: 'cache',
      data: cachedUser,
    }).code(200);
  }

  // 2️⃣ Fetch from DB
  const user = await getUserByIdFromDb(id);

  // 3️⃣ Store in cache
  await setCache(cacheKey, user, 120); // 2 mins TTL

  return h.response({
    source: 'db',
    data: user,
  }).code(200);
};

export const login = async (request: Request, h: ResponseToolkit) => {
  const { email, password } = request.payload as IUser;

  const user = await getUserByEmail(email);

  // 1️⃣ User not found
  if (!user || !user._id) {
    return h.response({ message: 'Invalid email or password' }).code(401);
  }

  // 2️⃣ Plain-text password check (TEMP)
  if (password !== user.password) {
    return h.response({ message: 'Invalid email or password' }).code(401);
  }

  // 3️⃣ Token payload should be explicit
  const userId = user._id.toString();

  const accessToken = generateAccessToken({ userId });
  const { refreshToken, tokenId } = generateRefreshToken(userId);

  // 4️⃣ Store refresh token reference
  await storeRefreshToken(userId, tokenId);

  // 5️⃣ Return tokens
  return h
    .response({ accessToken }) // JS-readable
    .state('refresh_token', refreshToken, {
      isHttpOnly: true,
      isSecure: process.env.NODE_ENV === 'production',
      isSameSite: 'Strict',
      path: '/auth/refresh',
      ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
    })
    .code(200);
};


export const refreshToken = async (
  request: Request,
  h: ResponseToolkit
) => {
  const refreshToken = request.state.refresh_token;

  if (!refreshToken) {
    return h.response({ message: 'Missing refresh token' }).code(401);
  }

  const { userId, tokenId } = verifyRefreshToken(refreshToken);

  const valid = await isRefreshTokenValid(userId, tokenId);
  if (!valid) {
    return h.response({ message: 'Invalid refresh token' }).code(401);
  }

  await revokeRefreshToken(userId, tokenId);

  const newAccessToken = generateAccessToken({ userId });
  const {
    refreshToken: newRefreshToken,
    tokenId: newTokenId,
  } = generateRefreshToken(userId);

  await storeRefreshToken(userId, newTokenId);

  return h
    .response({ accessToken: newAccessToken })
    .state('refresh_token', newRefreshToken, {
      isHttpOnly: true,
      isSecure: process.env.NODE_ENV === 'production',
      isSameSite: 'Strict',
      path: '/auth/refresh',
      ttl: 7 * 24 * 60 * 60 * 1000,
    });
};

export const logout = async (request: Request, h: ResponseToolkit) => {
  // 1. Get the Refresh Token from the Cookie
  const refreshToken = request.state.refresh_token;

  // 2. Get the Access Token from the Authorization Header
  const authHeader = request.headers.authorization;
  const accessToken = authHeader ? authHeader.split(' ')[1] : null;

  // --- REVOKE REFRESH TOKEN ---
  if (refreshToken) {
    try {
      const { userId, tokenId } = verifyRefreshToken(refreshToken);
      // This removes the key from Redis so they can't refresh anymore
      await revokeRefreshToken(userId, tokenId);
    } catch (err) {
      // If refresh token is already expired or invalid, we just continue
    }
  }

  // --- BLACKLIST ACCESS TOKEN ---
  if (accessToken) {
    try {
      const decoded = request.auth.credentials as { exp: number; jti: string }; // Hapi already decoded this for us
      const now = Math.floor(Date.now() / 1000);
      const timeLeft = decoded.exp - now;

      if (timeLeft > 0) {
        // Store the jti in Redis with a TTL of 'timeLeft'
        // Format: blacklist:jti_value
        await setCache(`blacklist:${decoded.jti}`, 'true', timeLeft);
      }
    } catch (err) {
      // Token might already be expired
    }
  }

  return h
    .response({ message: 'Logged out successfully' })
    .unstate('refresh_token') // Clears the cookie
    .code(200);
};
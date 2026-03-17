import { Request, ResponseToolkit } from '@hapi/hapi';
import { getUserByIdFromDb, createUserInDb, geAlltUserFromDb, getUserByEmail } from './userService.js';
import { getCache, setCache } from '../lib/cache.js';
import { UserSchema } from './userSchema.js';
import argon2 from 'argon2';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../lib/token.js';
import { isRefreshTokenValid, revokeRefreshToken, storeRefreshToken } from '../lib/refreshTokenStore.js';

// Helper for consistent Cookie settings
const COOKIE_OPTIONS = {
  isHttpOnly: true,
  isSecure: process.env.NODE_ENV === 'production',
  isSameSite: 'Strict' as const,
  path: '/',
  ttl: 7 * 24 * 60 * 60 * 1000,
};

export const getMe = async (request: Request, h: ResponseToolkit) => {
  const { userId } = request.auth.credentials as { userId: string };
  const cacheKey = `user_profile:${userId}`;

  // 1. Check Cache
  const cachedUser = await getCache(cacheKey);
  if (cachedUser) return h.response(cachedUser).code(200);

  // 2. Database Fallback
  const user = await getUserByIdFromDb(userId);
  if (!user) return h.response({ message: 'User not found' }).code(404);

  // 3. Strip sensitive data & Cache
  const { password, ...userResponse } = user;
  await setCache(cacheKey, userResponse, 300);

  return h.response(userResponse).code(200);
};

export const createUser = async (request: Request, h: ResponseToolkit) => {
  try {
    const validation = UserSchema.safeParse(request.payload);
    if (!validation.success) {
      return h.response({ message: "Invalid payload", error: validation.error.issues }).code(400);
    }

    const hashedPassword = await argon2.hash(validation.data.password);
    const userToSave = {
      ...validation.data,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    const createdUser = await createUserInDb(userToSave);
    const userId = createdUser.insertedId.toString();

    // Generate tokens
    const accessToken = generateAccessToken({ userId });
    const { refreshToken, tokenId } = generateRefreshToken(userId);
    await storeRefreshToken(userId, tokenId);

    return h.response({ accessToken })
      .state('refresh_token', refreshToken, COOKIE_OPTIONS)
      .code(201);

  } catch (error: any) {
    if (error.message === 'DUPLICATE_EMAIL') {
      return h.response({ statusCode: 409, error: 'Conflict', message: 'Email already registered' }).code(409);
    }
    return h.response({ statusCode: 500, message: 'Internal Server Error' }).code(500);
  }
};

export const login = async (request: Request, h: ResponseToolkit) => {
  const { email, password } = request.payload as any;

  const user = await getUserByEmail(email.toLowerCase().trim());
  if (!user || !(await argon2.verify(user.password, password))) {
    // Generic message prevents user enumeration
    return h.response({ statusCode: 401, message: 'Invalid email or password' }).code(401);
  }

  const userId = user._id.toString();
  const accessToken = generateAccessToken({ userId });
  const { refreshToken, tokenId } = generateRefreshToken(userId);

  await storeRefreshToken(userId, tokenId);

  return h.response({ message: 'Login successful', accessToken })
    .state('refresh_token', refreshToken, COOKIE_OPTIONS)
    .code(200);
};

export const refreshToken = async (request: Request, h: ResponseToolkit) => {
  // 1. Get credentials directly from Hapi Auth (already verified by your strategy!)
  const { userId, tokenId } = request.auth.credentials as { userId: string; tokenId: string };

  try {
    // 2. Rotate tokens (Delete old, create new)
    await revokeRefreshToken(userId, tokenId);

    const newAccessToken = generateAccessToken({ userId });
    const { refreshToken: newRefreshToken, tokenId: newTokenId } = generateRefreshToken(userId);
    
    await storeRefreshToken(userId, newTokenId);

    return h.response({ accessToken: newAccessToken })
      .state('refresh_token', newRefreshToken, COOKIE_OPTIONS)
      .code(200);
  } catch (err) {
    // This catch is now only for unexpected database/redis errors
    return h.response({ message: 'Internal Server Error' }).code(500);
  }
};

export const logout = async (request: Request, h: ResponseToolkit) => {
  const refreshToken = request.state.refresh_token;
  const credentials = request.auth.credentials as { exp: number; jti: string };

  // 1. Revoke Refresh Token
  if (refreshToken) {
    try {
      const { userId, tokenId } = verifyRefreshToken(refreshToken);
      await revokeRefreshToken(userId, tokenId);
    } catch (err) { /* token invalid, ignore */ }
  }

  // 2. Blacklist Access Token
  if (credentials?.jti) {
    const timeLeft = credentials.exp - Math.floor(Date.now() / 1000);
    if (timeLeft > 0) {
      await setCache(`blacklist:${credentials.jti}`, 'true', timeLeft);
    }
  }

  return h.response({ message: 'Logged out successfully' })
    .unstate('refresh_token', { path: '/' }) // Ensure path matches COOKIE_OPTIONS
    .code(200);
};

export const getAllUsers = async (_request: Request, h: ResponseToolkit) => {
  try {
    const users = await geAlltUserFromDb();
    return h.response(users).code(200);
  } catch (error) {
    return h.response({ error: 'Failed to fetch users' }).code(500);
  }
};
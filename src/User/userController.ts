// users.controller.ts
import { Request, ResponseToolkit } from '@hapi/hapi';
import { getUserByIdFromDb, createUserInDb, geAlltUserFromDb } from './userService';
import { getCache, setCache } from '../lib/cache';
import { IUser } from '../model';
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

  const user = await getUserByIdFromDb(userId);

  if (!user) {
    return h.response({ message: 'User not found' }).code(404);
  }

  return h.response(user).code(200);
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
    const user = request.payload as IUser;
    const result = await createUserInDb(user);
    return h.response(result).code(201);
  } catch (error) {
    console.error('Error creating user:', error);
    return h.response({ error: 'Failed to create user' }).code(500);
  }
}

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
  const { userId } = request.payload as { userId: string };

  // TODO: validate credentials with DB

  const accessToken = generateAccessToken({ userId });

  const { refreshToken, tokenId } = generateRefreshToken(userId);

  await storeRefreshToken(userId, tokenId);

  return h.response({
    accessToken,
    refreshToken,
  }).code(200);
};

export const refreshToken = async (
  request: Request,
  h: ResponseToolkit
) => {
  const { refreshToken } = request.payload as { refreshToken: string };

  const { userId, tokenId } = verifyRefreshToken(refreshToken);

  const valid = await isRefreshTokenValid(userId, tokenId);
  if (!valid) {
    return h.response({ message: 'Invalid refresh token' }).code(401);
  }

  // 🔄 Rotate token
  await revokeRefreshToken(userId, tokenId);

  const newAccessToken = generateAccessToken({ userId });
  const { refreshToken: newRefreshToken, tokenId: newTokenId } =
    generateRefreshToken(userId);

  await storeRefreshToken(userId, newTokenId);

  return h.response({
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  }).code(200);
};

export const logout = async (request: Request, h: ResponseToolkit) => {
  const { refreshToken } = request.payload as { refreshToken: string };

  const { userId, tokenId } = verifyRefreshToken(refreshToken);

  await revokeRefreshToken(userId, tokenId);

  return h.response({ message: 'Logged out' }).code(200);
};


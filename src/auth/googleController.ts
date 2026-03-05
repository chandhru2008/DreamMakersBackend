// src/auth/googleController.ts
import { Request, ResponseToolkit } from '@hapi/hapi';
import { verifyGoogleIdToken } from './googleService.ts';
import { getUserByEmail, createUserInDb } from '../user/userService.js';
import {
  generateAccessToken,
  generateRefreshToken,
} from '../lib/token.ts';
import { storeRefreshToken } from '../lib/refreshTokenStore.ts';

export const googleLogin = async (request: Request, h: ResponseToolkit) => {
  const { idToken } = request.payload as { idToken?: string };

  if (!idToken) {
    return h.response({ message: 'idToken is required' }).code(400);
  }

  // 1️⃣ Verify Google token
  const googleUser = await verifyGoogleIdToken(idToken);
  const { email, name, googleId } = googleUser;

  // 2️⃣ Find or create user
  let user = await getUserByEmail(email);

  if (!user) {
    user = await createUserInDb({
      email,
      name,
      provider: 'google',
      googleId,
    });
  }

  if (!user?._id) {
    return h.response({ message: 'User creation failed' }).code(500);
  }

  const userId = user._id.toString();

  // 3️⃣ Generate tokens
  const accessToken = generateAccessToken({ userId });
  const { refreshToken, tokenId } = generateRefreshToken(userId);

  // 4️⃣ Store refresh token reference
  await storeRefreshToken(userId, tokenId);

  // 5️⃣ Send response
  return h
    .response({ accessToken })
    .state('refresh_token', refreshToken, {
      isHttpOnly: true,
      isSecure: process.env.NODE_ENV === 'production',
      isSameSite: 'Strict',
      path: '/auth/refresh',
      ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
    })
    .code(200);
};
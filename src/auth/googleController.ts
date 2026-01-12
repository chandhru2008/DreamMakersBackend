// src/auth/googleController.ts
import { Request, ResponseToolkit } from '@hapi/hapi';
import { verifyGoogleIdToken } from './googleService';
import { getUserByEmail, createUserInDb } from '../user/userService';
import {
    generateAccessToken,
    generateRefreshToken,
} from '../lib/token';
import { storeRefreshToken } from '../lib/refreshTokenStore';

export const googleLogin = async (request: Request, h: ResponseToolkit) => {
    const { idToken } = request.payload as { idToken: string };

    if (!idToken) {
        return h.response({ message: 'idToken is required' }).code(400);
    }

    const googleUser = await verifyGoogleIdToken(idToken);

    let user = await getUserByEmail(googleUser.email);

    if (!user) {
        const insertResult = await createUserInDb({
            _id: undefined,
            email: googleUser.email,
            name: googleUser.name,
            provider: 'google',
            googleId: googleUser.googleId,
        });
        user = await getUserByEmail(googleUser.email);
    }

    const userId = user?._id.toString();

    const accessToken = generateAccessToken({ userId });
    const { refreshToken, tokenId } = generateRefreshToken(userId!);

    await storeRefreshToken(userId!, tokenId);

    return h
        .response({ accessToken })
        .state('refresh_token', refreshToken, {
            isHttpOnly: true,
            isSecure: process.env.NODE_ENV === 'production',
            isSameSite: 'Strict',
            path: '/auth/refresh',
            ttl: 7 * 24 * 60 * 60 * 1000,
        })
        .code(200);
};

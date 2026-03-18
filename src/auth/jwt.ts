import { Server } from '@hapi/hapi';
import Jwt from '@hapi/jwt';
import { getCache } from '../lib/cache.js';
import { isRefreshTokenValid } from '../lib/refreshTokenStore.js';

export const setupJwtAuth = async (server: Server) => {
  await server.register(Jwt);

  // --- Strategy 1: Access Token (Standard API Auth) ---
  server.auth.strategy('jwt-access', 'jwt', {
    keys: process.env.ACCESS_TOKEN_SECRET!,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      nbf: true,
      exp: true,
    },
    validate: async (artifacts : any) => {
      const { jti, userId } = artifacts.decoded.payload;

      // Check Redis Blacklist
      const isRevoked = await getCache(`blacklist:${jti}`);
      if (isRevoked) return { isValid: false };

      return { isValid: true, credentials: { userId, jti } };
    },
  });

  // --- Strategy 2: Refresh Token (Specifically for the /refresh route) ---
  server.auth.strategy('jwt-refresh', 'jwt', {
    keys: process.env.REFRESH_TOKEN_SECRET!,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      nbf: true,
      exp: true,
    },
    validate: async (artifacts: {
      decoded: { payload: { userId: any; tokenId: any } };
    }) => {
      const { userId, tokenId } = artifacts.decoded.payload;

      // Use your custom logic to check if this tokenId is still valid in Redis
      const valid = await isRefreshTokenValid(userId, tokenId);
      if (!valid) return { isValid: false };

      return { isValid: true, credentials: { userId, tokenId } };
    },
  });

  // Default to access token for all routes
  server.auth.default('jwt-access');
};

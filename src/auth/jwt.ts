import { Server } from '@hapi/hapi';
import Jwt from '@hapi/jwt';
import { getCache } from '../lib/cache';


export const setupJwtAuth = async (server: Server) => {
  await server.register(Jwt);

  server.auth.strategy('jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_SECRET!,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      nbf: true,
      exp: true,
    },
    validate: async (artifacts) => {
      console.log(artifacts)
      const { jti, userId } = artifacts.decoded.payload;

      // 1. Check Redis for the Blacklist
      const isRevoked = await getCache(`blacklist:${jti}`);

      if (isRevoked) {
        return { isValid: false }; // Request blocked!
      }

      // 2. If not revoked, let them in
      return {
        isValid: true,
        credentials: { userId, jti }
      };
    }
  });

  server.auth.default('jwt'); // optional
};

import { Server } from '@hapi/hapi';
import Jwt from '@hapi/jwt';

export const setupJwtAuth = async (server: Server) => {
  await server.register(Jwt);

  server.auth.strategy('jwt', 'jwt', {
    keys: process.env.JWT_SECRET!,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      nbf: true,
      exp: true,
    },
    validate: async (artifacts) => {
      return {
        isValid: true,
        credentials: artifacts.decoded.payload,
      };
    },
  });

  server.auth.default('jwt'); // optional
};

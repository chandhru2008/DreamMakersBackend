// src/auth/googleRoutes.ts
import { ServerRoute } from '@hapi/hapi';
import { googleLogin } from './googleController';

export const googleRoutes: ServerRoute[] = [
  {
    method: 'POST',
    path: '/auth/google',
    handler: googleLogin,
  },
];

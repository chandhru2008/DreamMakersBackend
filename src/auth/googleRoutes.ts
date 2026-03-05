// src/auth/googleRoutes.ts
import { ServerRoute } from '@hapi/hapi';
import { googleLogin } from './googleController.ts';

export const googleRoutes: ServerRoute[] = [
  {
    method: 'POST',
    path: '/auth/google',
    handler: googleLogin,
    options : {
      auth: false
    }
  },
];


// users.route.ts
import { ServerRoute } from '@hapi/hapi';
import { getUsers } from './userController';

export const userRoutes: ServerRoute[] = [
  {
    method: 'GET',
    path: '/users',
    handler: getUsers,
  },
];

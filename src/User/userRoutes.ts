
// users.route.ts
import { ServerRoute } from '@hapi/hapi';
import { getUserById, getAllUsers, createUser } from './userController';

export const userRoutes: ServerRoute[] = [
  {
    method: 'GET',
    path: '/me',
    handler: getUserById,
  },
  {
    method : 'GET',
    path : '/allUsers',
    handler : getAllUsers
  },
  {
    method: 'POST',
    path: '/register',
    handler: createUser,
  }
];

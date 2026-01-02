
// users.route.ts
import { ServerRoute } from '@hapi/hapi';
import { getUserById, getAllUsers, createUser, getUser, login, refreshToken, logout  } from './userController';

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
  },
    {
    method: 'GET',
    path: '/users/{id}',
    handler: getUser,
  },
  {
  method: 'POST',
  path: '/login',
  handler: login,
},

  {
  method: 'POST',
  path: '/refresh',
  handler: refreshToken,
},
{
  method: 'POST',
  path: '/logout',
  handler: logout,
},
];

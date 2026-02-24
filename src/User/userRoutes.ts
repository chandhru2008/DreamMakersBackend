
// users.route.ts
import { ServerRoute } from '@hapi/hapi';
import { getAllUsers, createUser, getUser, login, refreshToken, logout, getMe } from './userController';

export const userRoutes: ServerRoute[] = [
  {
    method: 'GET',
    path: '/me',
    handler: getMe,
  },
  {
    method: 'GET',
    path: '/allUsers',
    handler: getAllUsers
  },
  {
    method: 'POST',
    path: '/register',
    handler: createUser,
    options: {
      auth: false
    }
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
    options: {
      auth: 'jwt-refresh' // This route specifically requires the refresh token cookie
    }
  },
  {
    method: 'POST',
    path: '/logout',
    handler: logout,
  },
];

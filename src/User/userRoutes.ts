
// users.route.ts
import { ServerRoute } from '@hapi/hapi';
import { getUsers , createUser} from './userController';

export const userRoutes: ServerRoute[] = [
  {
    method: 'GET',
    path: '/users',
    handler: getUsers,
  }, {
    method: 'POST',
    path: '/register',
    handler: createUser,
  }
];

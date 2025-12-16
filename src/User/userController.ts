// users.controller.ts
import { Request, ResponseToolkit } from '@hapi/hapi';

export const getUsers = (request: Request, h: ResponseToolkit) => {
  return [{ id: 1, name: 'Chandhru' }];
};

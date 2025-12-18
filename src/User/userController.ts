// users.controller.ts
import { Request, ResponseToolkit } from '@hapi/hapi';
import { getUsersFromDb, createUserInDb } from './userService';
import { IUser } from '../model';

export const getUsers = async (request: Request, h: ResponseToolkit) => {
  try {
    const users = await getUsersFromDb();
    return h.response(users).code(200);
  } catch (error) {
    console.error('Error fetching users:', error);
    return h.response({ error: 'Failed to fetch users' }).code(500);
  }
};

export const createUser = async (request: Request, h: ResponseToolkit) => {
  try {
    const user = request.payload as IUser;
    const result = await createUserInDb(user);
    return h.response(result).code(201);
  } catch (error) {
    console.error('Error creating user:', error);
    return h.response({ error: 'Failed to create user' }).code(500);
  }
}
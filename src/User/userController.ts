// users.controller.ts
import { Request, ResponseToolkit } from '@hapi/hapi';
import { getUserByIdFromDb, createUserInDb, geAlltUserFromDb } from './userService';
import { IUser } from '../model';

export const getUserById = async (request : Request, h : ResponseToolkit) => {
  const { userId } = request.query;

  console.log(userId);

  const user = await getUserByIdFromDb(userId);

  if (!user) {
    return h.response({ message: 'User not found' }).code(404);
  }

  return h.response(user).code(200);
};
export const getAllUsers = async (request: Request, h: ResponseToolkit) => {
  try {
    const userId = request.params.id
    const users = await geAlltUserFromDb();
    return h.response(users).code(200);
  } catch (error) {
    console.error('Error fetching users:', error);
    return h.response({ error: 'Failed to fetch users' }).code(500);
  }
}

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
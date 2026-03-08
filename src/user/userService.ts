import { getDb } from "../db/mongo.js";
import { ObjectId } from 'mongodb';

export const geAlltUserFromDb = async () => {
  const db = getDb();
  return db.collection('Users').find().toArray();
};

export const getUserByIdFromDb = async (userId: string) => {
  const db = getDb();

  return db.collection('Users').findOne({
    _id: new ObjectId(userId),
  });
};

export const getUserByEmail = async (email: string) => {
  const db = getDb();
  return db.collection('Users').findOne({ email });
};


export const createUserInDb = async (user: any) => {
  const db = getDb();
  try {
    const normalizedEmail = user.email.toLowerCase();

    user = {
      ...user,
      email: normalizedEmail
    };
    return await db.collection('Users').insertOne(user);
  } catch (error: any) {
    if (error.code === 11000) {
      // We throw a specific string so the handler can identify it easily
      throw new Error('DUPLICATE_EMAIL');
    }
    throw error;
  }
};
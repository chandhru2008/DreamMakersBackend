import { getDb } from "../db/mongo";
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

export const createUserInDb = async (user: any) => {
  const db = getDb();
  return db.collection('Users').insertOne(user);
};

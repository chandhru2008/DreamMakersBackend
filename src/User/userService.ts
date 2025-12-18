import { getDb } from "../db/mongo";

export const getUsersFromDb = async () => {
  const db = getDb();
  return db.collection('Users').find().toArray();
};

export const createUserInDb = async (user: any) => {
  const db = getDb();
  return db.collection('Users').insertOne(user);
};

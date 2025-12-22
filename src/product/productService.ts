import { ObjectId } from 'mongodb';
import { getDb } from '../db/mongo'
import { IProduct } from '../model.js';

const COLLECTION = 'products';

/** Create product */
export const createProduct = async (product: IProduct) => {
  const db = getDb();

  const result = await db.collection<IProduct>(COLLECTION).insertOne({
    ...product,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return { _id: result.insertedId, ...product };
};

/** Get all products */
export const getAllProducts = async () => {
  const db = getDb();
  return db.collection<IProduct>(COLLECTION).find({}).toArray();
};

/** Get product by ID */
export const getProductById = async (id: string) => {
  const db = getDb();
  return db.collection<IProduct>(COLLECTION).findOne({
    _id: new ObjectId(id),
  });
};

/** Update product */
export const updateProduct = async (id: string, data: Partial<IProduct>) => {
  const db = getDb();

  await db.collection<IProduct>(COLLECTION).updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        ...data,
        updatedAt: new Date(),
      },
    }
  );

  return getProductById(id);
};

/** Delete product */
export const deleteProduct = async (id: string) => {
  const db = getDb();
  return db.collection<IProduct>(COLLECTION).deleteOne({
    _id: new ObjectId(id),
  });
};

import { ObjectId } from 'mongodb';
import { getDb } from '../db/mongo.js';
import { IWishlist } from '../model.js';

export const addProductToWishlist = async (
  userId: string,
  productId: string
) => {
  const db = getDb();

  await db.collection<IWishlist>('wishlists').updateOne(
    { userId: userId },
    {
      $addToSet: { products: productId },
      $setOnInsert: { createdAt: new Date() },
      $set: { updatedAt: new Date() },
    },
    { upsert: true }
  );
};

export const removeProductFromWishlist = async (
  userId: string,
  productId: string
) => {
  const db = getDb();

  await db.collection<IWishlist>('wishlists').updateOne(
    { userId: userId },
    {
      $pull: { products: productId },
      $set: { updatedAt: new Date() },
    }
  );
};

export const fetchWishlist = async (userId: string) => {
  const db = getDb();

  return db.collection('wishlists').findOne({
    userId: new ObjectId(userId),
  });
};

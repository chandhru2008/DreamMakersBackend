import { ObjectId } from 'mongodb';
import { getDb } from '../db/mongo';

export const addProductToWishlist = async (
  userId: string,
  productId: string
) => {
  const db = getDb();

  await db.collection('wishlists').updateOne(
    { userId: new ObjectId(userId) },
    {
      $addToSet: { products: new ObjectId(productId) },
      $setOnInsert: { createdAt: new Date() },
      $set: { updatedAt: new Date() }
    },
    { upsert: true }
  );
};

export const removeProductFromWishlist = async (
  userId: string,
  productId: string
) => {
  const db = getDb();

  await db.collection('wishlists').updateOne(
    { userId: new ObjectId(userId) },
    {
      $pull: { products: new ObjectId(productId) },
      $set: { updatedAt: new Date() }
    }
  );
};


export const fetchWishlist = async (userId: string) => {
  const db = getDb();

  return db.collection('wishlists').findOne({
    userId: new ObjectId(userId),
  });
};

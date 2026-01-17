// src/order/orderService.ts
import { ObjectId } from 'mongodb';
import { getDb } from '../db/mongo';
import { CreateOrderPayload, Order } from './orderTypes';

const ORDER_COLLECTION = 'Orders';

/**
 * Create order
 */
export const createOrder = async (
  userId: string,
  payload: CreateOrderPayload
): Promise<Order> => {
  const db = getDb();

  // TODO: calculate totalAmount from product service
  const totalAmount = 1000;

  const order = {
    userId,
    products: payload.products,
    totalAmount,
    status: 'CREATED',
    createdAt: new Date(),
  };

  const result = await db.collection(ORDER_COLLECTION).insertOne(order);

  return {
      ...order,
      _id: result.insertedId.toString(),
  } as unknown as Order;
};

/**
 * Get order by id
 */
export const getOrderById = async (orderId: string): Promise<Order | null> => {
  const db = getDb();

  return db.collection(ORDER_COLLECTION).findOne({
      _id: new ObjectId(orderId),
  }) as unknown as Order | null;
};

/**
 * Get orders for user
 */
export const getOrdersByUser = async (userId: string): Promise<Order[]> => {
  const db = getDb();

  return db
      .collection(ORDER_COLLECTION)
      .find({ userId })
      .toArray() as unknown as Order[];
};

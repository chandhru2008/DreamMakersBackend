// src/order/orderTypes.ts
import { IProduct } from '../model';

export interface CreateOrderPayload {
  products: {
    productId: string;
    quantity: number;
  }[];
  address: string;
}

import { ObjectId } from 'mongodb';

export interface Order {
  _id?: ObjectId | string;
  userId: string;
  products: IProduct[];
  totalAmount: number;
  status: string;
  createdAt: Date;
}
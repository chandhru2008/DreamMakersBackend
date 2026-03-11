// src/order/orderTypes.ts
import { IProduct } from '../model.js';

export interface CreateOrderPayload {
  products: {
    productId: string;
    quantity: number;
  }[];
  address: string;
}

import { ObjectId } from 'mongodb';


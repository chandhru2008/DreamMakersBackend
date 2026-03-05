// src/order/orderTypes.ts
import { IProduct } from '../model.ts';

export interface CreateOrderPayload {
  products: {
    productId: string;
    quantity: number;
  }[];
  address: string;
}

import { ObjectId } from 'mongodb';


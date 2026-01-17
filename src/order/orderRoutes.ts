// src/order/orderRoutes.ts
import { ServerRoute } from '@hapi/hapi';
import {
  createOrderController,
  getOrderByIdController,
  getMyOrdersController,
} from './orderController';

export const orderRoutes: ServerRoute[] = [
  {
    method: 'POST',
    path: '/orders',
    handler: createOrderController,
    options: {
      auth: 'jwt', // protected
    },
  },
  {
    method: 'GET',
    path: '/orders/{orderId}',
    handler: getOrderByIdController,
    options: {
      auth: 'jwt',
    },
  },
  {
    method: 'GET',
    path: '/orders/me',
    handler: getMyOrdersController,
    options: {
      auth: 'jwt',
    },
  },
];

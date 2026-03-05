// src/order/orderRoutes.ts
import { ServerRoute } from '@hapi/hapi';
import {
  createOrderController,
  getOrderByIdController,
  getMyOrdersController,
} from './orderController.ts';

export const orderRoutes: ServerRoute[] = [
  {
    method: 'POST',
    path: '/orders',
    handler: createOrderController,
  },
  {
    method: 'GET',
    path: '/orders/{orderId}',
    handler: getOrderByIdController,
  },
  {
    method: 'GET',
    path: '/orders/me',
    handler: getMyOrdersController,
  },
];

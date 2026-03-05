// src/order/orderController.ts
import { Request, ResponseToolkit } from '@hapi/hapi';
import {
    createOrder,
    getOrderById,
    getOrdersByUser,
} from './orderService.ts';
import { CreateOrderPayload } from './orderTypes.ts';

/**
 * Create order
 */
export const createOrderController = async (
    request: Request,
    h: ResponseToolkit
) => {
    const userId = String(request.auth.credentials.userId);
    const payload = request.payload as CreateOrderPayload;

    if (!userId || userId === 'undefined') {
        return h.response({ message: 'Unauthorized' }).code(401);
    }

    const order = await createOrder(userId, payload);

    return h.response(order).code(201);
};

/**
 * Get order by id
 */
export const getOrderByIdController = async (
    request: Request,
    h: ResponseToolkit
) => {
    const { orderId } = request.params as { orderId: string };

    const order = await getOrderById(orderId);

    if (!order) {
        return h.response({ message: 'Order not found' }).code(404);
    }

    return h.response(order).code(200);
};

/**
 * Get logged-in user's orders
 */
export const getMyOrdersController = async (
    request: Request,
    h: ResponseToolkit
) => {
    const userId = String(request.auth.credentials.userId);

    if(!userId || userId === 'undefined') {
        return h.response({ message: 'Unauthorized' }).code(401);
    }

    const orders = await getOrdersByUser(userId);

    return h.response(orders).code(200);
};

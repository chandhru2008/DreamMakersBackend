import { Request, ResponseToolkit } from '@hapi/hapi';
import {
  addProductToWishlist,
  removeProductFromWishlist,
  fetchWishlist
} from './wishlistService.js';

export const addToWishlist = async (request: Request, h: ResponseToolkit) => {
  const userId = request.auth.credentials._id as string;
  const payload = request.payload as { productId?: unknown };
  const productId = typeof payload.productId === 'string' ? payload.productId : '';

  if (!userId) {
    return h.response({ message: 'User not found' });
  }

  await addProductToWishlist(userId, productId);

  return h.response({ message: 'Product added to wishlist' }).code(200);
};

export const removeFromWishlist = async (request: Request, h: ResponseToolkit) => {
  const userId = request.auth.credentials._id as string;
  const { productId } = request.params as { productId: string };

  if (!userId) {
    return h.response({ message: 'User not found' });
  }

  await removeProductFromWishlist(userId, productId);

  return h.response({ message: 'Product removed from wishlist' }).code(200);
};

export const getWishlist = async (request: Request, h: ResponseToolkit) => {
  const userId = request.auth.credentials._id as string;

  if (userId) {
    return h.response({ message: 'User not found' });
  }

  const wishlist = await fetchWishlist(userId);

  if (!wishlist) {
    return h.response({ message: 'Wishlist not found' }).code(404);
  }

  return h.response(wishlist).code(200);
};

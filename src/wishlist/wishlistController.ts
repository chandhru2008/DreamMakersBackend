import { Request, ResponseToolkit } from '@hapi/hapi';
import {
  addProductToWishlist,
  removeProductFromWishlist,
  fetchWishlist
} from './wishlistService';

export const addToWishlist = async (request: Request, h: ResponseToolkit) => {
  const userId = request.auth.credentials._id;
  const payload = request.payload as { productId?: unknown };
  const productId = typeof payload.productId === 'string' ? payload.productId : '';

  await addProductToWishlist(userId, productId);

  return h.response({ message: 'Product added to wishlist' }).code(200);
};

export const removeFromWishlist = async (request: Request, h: ResponseToolkit) => {
  const userId = request.auth.credentials._id;
  const { productId } = request.params as { productId: string };

  await removeProductFromWishlist(userId, productId);

  return h.response({ message: 'Product removed from wishlist' }).code(200);
};

export const getWishlist = async (request: Request, h: ResponseToolkit) => {
  const userId = request.auth.credentials._id;

  const wishlist = await fetchWishlist(userId);

  return h.response(wishlist).code(200);
};

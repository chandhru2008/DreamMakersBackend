import { ServerRoute } from '@hapi/hapi';
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist
} from './wishlistController';

export const wishlistRoutes : ServerRoute[] = [
  {
    method: 'POST',
    path: '/wishlist',
    options: { auth: 'jwt' },
    handler: addToWishlist
  },
  {
    method: 'DELETE',
    path: '/wishlist/{productId}',
    options: { auth: 'jwt' },
    handler: removeFromWishlist
  },
  {
    method: 'GET',
    path: '/wishlist',
    options: { auth: 'jwt' },
    handler: getWishlist
  }
];

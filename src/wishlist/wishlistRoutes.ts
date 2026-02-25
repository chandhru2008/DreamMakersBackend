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
    handler: addToWishlist
  },
  {
    method: 'DELETE',
    path: '/wishlist/{productId}',
    handler: removeFromWishlist
  },
  {
    method: 'GET',
    path: '/wishlist',
    handler: getWishlist
  }
];

import { ServerRoute } from '@hapi/hapi';
import * as ProductController from './productController'

export const productRoutes : ServerRoute[] = [
  {
    method: 'POST',
    path: '/products',
    handler: ProductController.createProduct,
  },
  {
    method: 'GET',
    path: '/products',
    handler: ProductController.getProducts,
  },
  {
    method: 'GET',
    path: '/products/{id}',
    handler: ProductController.getProduct,
  },
  {
    method: 'PUT',
    path: '/products/{id}',
    handler: ProductController.updateProduct,
  },
  {
    method: 'DELETE',
    path: '/products/{id}',
    handler: ProductController.deleteProduct,
  },
];

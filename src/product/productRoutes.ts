import { ServerRoute } from '@hapi/hapi';
import * as ProductController from './productController'

export const productRoutes: ServerRoute[] = [
  {
    method: 'POST',
    path: '/products',
    handler: ProductController.createProduct,
  },
  {
    method: 'GET',
    path: '/products',
    handler: ProductController.getProducts,
    options: {
      auth: false
    }
  },
  {
    method: 'GET',
    path: '/products/{id}',
    handler: ProductController.getProduct,
    options : {
      auth : false
    }
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

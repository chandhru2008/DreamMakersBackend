import { IProduct } from '../model.js';
import { PaginationSchema } from './productSchema.js';
import * as ProductService from './productService.js';
import { Request, ResponseToolkit } from '@hapi/hapi';

/** POST /products */
export const createProduct = async (request: Request, h: ResponseToolkit) => {
  const productDetails = request.payload as IProduct;
  const product = await ProductService.createProduct(productDetails);
  return h.response(product).code(201);
};

/** GET /products */
export const getProducts = async (request: Request, h: ResponseToolkit) => {
  // 1. Validate the query parameters safely
  const validation = PaginationSchema.safeParse(request.query);

  // 2. If validation fails, return 400 immediately
  if (!validation.success) {
    return h
      .response({
        message: 'Invalid pagination parameters',
        errors: validation.error.issues,
      })
      .code(400)
      .takeover();
    // .takeover() ensures Hapi stops processing and sends this response
  }

  // 3. Destructure the typed data from the successful validation
  const { skip, take } = validation.data;

  // 4. Pass the guaranteed numbers to your service
  return ProductService.getAllProducts(skip, take);
};

/** GET /products/{id} */
export const getProduct = async (request: Request, h: ResponseToolkit) => {
  const { id } = request.params;

  const product = await ProductService.getProductById(id);

  if (!product) {
    return h.response({ message: 'Product not found' }).code(404);
  }

  return product;
};

/** PUT /products/{id} */
export const updateProduct = async (request: Request, h: ResponseToolkit) => {
  const { id } = request.params;

  const updatedProductDetails = request.payload as IProduct;

  const updated = await ProductService.updateProduct(id, updatedProductDetails);

  if (!updated) {
    return h.response({ message: 'Product not found' }).code(404);
  }

  return updated;
};

/** DELETE /products/{id} */
export const deleteProduct = async (request: Request, h: ResponseToolkit) => {
  const { id } = request.params;

  await ProductService.deleteProduct(id);
  return h.response().code(204);
};

import { IProduct } from '../model';
import * as ProductService from './productService'
import { Request, ResponseToolkit } from '@hapi/hapi';


/** POST /products */
export const createProduct = async (request: Request, h: ResponseToolkit) => {
    const productDetails = request.payload as IProduct
    const product = await ProductService.createProduct(productDetails);
    return h.response(product).code(201);
};

/** GET /products */
export const getProducts = async () => {
    return ProductService.getAllProducts();
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

    const updatedProductDetails = request.payload as IProduct

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

export interface CreateOrderPayload {
  products: {
    productId: string;
    quantity: number;
  }[];
  address: string;
}


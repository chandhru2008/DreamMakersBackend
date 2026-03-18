interface IBaseConfig {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUser extends IBaseConfig {
  email: string;
  password: string;
}

export enum productCategory {
  PANTS = 1,
  SHIRTS,
  TSHIRTS,
}

export interface IProduct extends IBaseConfig {
  description: string;
  price: number;
  category: productCategory;
}

export interface IOrder {
  id?: string;
  userId: string;
  products: IProduct[];
  totalAmount: number;
  status: string;
  createdAt: Date;
}

export interface IWishlist {
  _id?: string;
  userId: string;
  products: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

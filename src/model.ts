interface IBaseConfig {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IUser extends IBaseConfig {
    email: string;
    password: string;
    dummy : productCategory
}

export enum productCategory {
    PANTS = 1,
    SHIRTS,
    TSHIRTS,
}

interface IProduct extends IBaseConfig {
    description: string;
    price: number;
    category: productCategory;
}

export type UserRole = 'CUSTOMER' | 'SELLER' | 'ADMIN';
export type OrderStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';
export const ProductCategoriesList = ['ELECTRONICS', 'CLOTHING', 'FOOD'] as const;
export type ProductCategory = typeof ProductCategoriesList[number];
export type PaymentMethod = 'CREDIT_CARD' | 'PAYPAL';

export interface IUser {
  id: string;
  email: string;
  name: string;
  password: string;
  role: UserRole;
}

export interface IUserCreate {
  email: string;
  name: string;
  password: string;
  role: UserRole;
}

export interface IUserUpdate {
  id: string;
  email?: string;
  name?: string;
  password?: string;
  role?: UserRole;
}

export interface IProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: ProductCategory;
  userId: string
}

export interface IProductCreate {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: ProductCategory;
  userId: string
}

export interface IProductUpdate {
  id: string;
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  category?: ProductCategory;
  userId: string
}

export interface IOrder {
  id: string;
  userId: string;
  status: OrderStatus;
  total: number;
  items: IOrderItem[];
}

export interface IOrderItem {
  productId: string;
  quantity: number;
  price: number;
}

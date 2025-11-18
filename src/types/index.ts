export type UserRole = 'CUSTOMER' | 'SELLER' | 'ADMIN';
export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type ProductCategory = 'ELECTRONICS' | 'CLOTHING' | 'FOOD';
export type PaymentMethod = 'CREDIT_CARD' | 'PAYPAL' ;

export interface IUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface IProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: ProductCategory;
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
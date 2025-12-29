/**
 * Types et interfaces pour la gestion du panier
 */

export interface ICartItem {
  productId: string;
  quantity: number;
  price: number; // Prix unitaire au moment de l'ajout
}

export interface ICart {
  items: ICartItem[];
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartValidationResult {
  isValid: boolean;
  errors: CartValidationError[];
}

export interface CartValidationError {
  productId: string;
  message: string;
  type: 'OUT_OF_STOCK' | 'PRICE_CHANGED' | 'PRODUCT_NOT_FOUND';
}

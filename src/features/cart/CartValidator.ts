import { ProductService } from "../catalog/ProductService.js";
import type { ICart, ICartItem, CartValidationResult, CartValidationError } from "../../types/CartTypes.js";
import { AppLogger } from "../../AppLogger.js";

/**
 * Valide le panier en vérifiant la disponibilité du stock et la cohérence des prix
 */
export class CartValidator {
  private productService: ProductService;

  constructor() {
    this.productService = ProductService.instance;
  }

  /**
   * Valide tous les articles du panier
   */
  public async validateCart(cart: ICart): Promise<CartValidationResult> {
    const errors: CartValidationError[] = [];

    for (const item of cart.items) {
      const product = await this.productService.getProductById(item.productId);

      // Vérifier si le produit existe
      if (!product) {
        errors.push({
          productId: item.productId,
          message: `Product not found`,
          type: 'PRODUCT_NOT_FOUND'
        });
        continue;
      }

      // Vérifier le stock disponible
      if (product.stock < item.quantity) {
        errors.push({
          productId: item.productId,
          message: `Insufficient stock. Available: ${product.stock}, requested: ${item.quantity}`,
          type: 'OUT_OF_STOCK'
        });
      }

      // Vérifier si le prix a changé
      if (product.price !== item.price) {
        errors.push({
          productId: item.productId,
          message: `Price changed. Cart price: ${item.price}, current price: ${product.price}`,
          type: 'PRICE_CHANGED'
        });
      }
    }

    const isValid = errors.length === 0;
    if (!isValid) {
      AppLogger.warn(`⚠️ Cart validation failed with ${errors.length} error(s)`);
    } else {
      AppLogger.debug('✅ Cart validation successful');
    }

    return {
      isValid,
      errors
    };
  }
}

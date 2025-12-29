import { SessionService } from "../auth/SessionService.js";
import { ProductService } from "../catalog/ProductService.js";
import { CartValidator } from "./CartValidator.js";
import type { ICart, ICartItem, CartValidationResult } from "../../types/CartTypes.js";
import { AppLogger } from "../../AppLogger.js";

/**
 * Service de gestion du panier (Singleton)
 * Gère le panier dans la session utilisateur
 */
export class CartService {
  private static singleInstance: CartService | null = null;
  private sessionService: SessionService;
  private productService: ProductService;
  private validator: CartValidator;

  private constructor() {
    this.sessionService = SessionService.instance;
    this.productService = ProductService.instance;
    this.validator = new CartValidator();
  }

  public static get instance(): CartService {
    if (!CartService.singleInstance) {
      CartService.singleInstance = new CartService();
      AppLogger.debug('✅ CartService instance created');
    }
    return CartService.singleInstance;
  }

  /**
   * Récupère le panier actuel depuis la session
   */
  public getCart(): ICart {
    const existingCart = this.sessionService.getCart();
    
    if (existingCart) {
      return existingCart;
    }

    // Créer un nouveau panier si aucun n'existe
    const newCart: ICart = {
      items: [],
      total: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return newCart;
  }

  /**
   * Ajoute un article au panier ou augmente sa quantité
   */
  public async addItem(productId: string, quantity: number): Promise<ICart> {
    if (quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }

    // Vérifier que le produit existe
    const product = await this.productService.getProductById(productId);
    if (!product) {
      throw new Error(`Product with id ${productId} not found`);
    }

    // Vérifier le stock
    if (product.stock < quantity) {
      throw new Error(`Insufficient stock. Available: ${product.stock}, requested: ${quantity}`);
    }

    const cart = this.getCart();
    const existingItemIndex = cart.items.findIndex(item => item.productId === productId);

    if (existingItemIndex >= 0) {
      // Augmenter la quantité
      const existingItem = cart.items[existingItemIndex];
      if (!existingItem) {
        throw new Error('Item not found in cart');
      }
      
      const newQuantity = existingItem.quantity + quantity;
      
      if (product.stock < newQuantity) {
        throw new Error(`Insufficient stock. Available: ${product.stock}, requested total: ${newQuantity}`);
      }

      existingItem.quantity = newQuantity;
      AppLogger.info(`✅ Updated quantity for product ${productId} to ${newQuantity}`);
    } else {
      // Ajouter un nouvel article
      const newItem: ICartItem = {
        productId,
        quantity,
        price: product.price
      };
      cart.items.push(newItem);
      AppLogger.info(`✅ Added product ${productId} to cart (quantity: ${quantity})`);
    }

    cart.total = this.calculateTotal(cart);
    cart.updatedAt = new Date().toISOString();
    this.sessionService.updateCart(cart);

    return cart;
  }

  /**
   * Retire un article du panier
   */
  public async removeItem(productId: string): Promise<ICart> {
    const cart = this.getCart();
    const initialLength = cart.items.length;

    cart.items = cart.items.filter(item => item.productId !== productId);

    if (cart.items.length === initialLength) {
      throw new Error(`Product ${productId} not found in cart`);
    }

    cart.total = this.calculateTotal(cart);
    cart.updatedAt = new Date().toISOString();
    this.sessionService.updateCart(cart);

    AppLogger.info(`✅ Removed product ${productId} from cart`);
    return cart;
  }

  /**
   * Met à jour la quantité d'un article
   */
  public async updateItemQuantity(productId: string, quantity: number): Promise<ICart> {
    if (quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }

    const cart = this.getCart();
    const itemIndex = cart.items.findIndex(item => item.productId === productId);

    if (itemIndex === -1) {
      throw new Error(`Product ${productId} not found in cart`);
    }

    // Vérifier le stock
    const product = await this.productService.getProductById(productId);
    if (!product) {
      throw new Error(`Product with id ${productId} not found`);
    }

    if (product.stock < quantity) {
      throw new Error(`Insufficient stock. Available: ${product.stock}, requested: ${quantity}`);
    }

    const item = cart.items[itemIndex];
    if (!item) {
      throw new Error(`Item not found in cart`);
    }

    item.quantity = quantity;
    cart.total = this.calculateTotal(cart);
    cart.updatedAt = new Date().toISOString();
    this.sessionService.updateCart(cart);

    AppLogger.info(`✅ Updated quantity for product ${productId} to ${quantity}`);
    return cart;
  }

  /**
   * Vide le panier
   */
  public clearCart(): void {
    this.sessionService.clearCart();
    AppLogger.info('✅ Cart cleared');
  }

  /**
   * Calcule le total du panier
   */
  public calculateTotal(cart?: ICart): number {
    const currentCart = cart ?? this.getCart();
    const total = currentCart.items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    return Math.round(total * 100) / 100; // Arrondir à 2 décimales
  }

  /**
   * Valide le panier (stock, prix, existence des produits)
   */
  public async validateCart(): Promise<CartValidationResult> {
    const cart = this.getCart();
    return await this.validator.validateCart(cart);
  }
}

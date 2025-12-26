import { PrismaClientSingleton } from "../../prisma/client.js";
import { SessionService } from "../auth/SessionService.js";
import { CartService } from "../cart/CartService.js";
import { PaymentService } from "../payment/PaymentService.js";
import { ProductService } from "../catalog/ProductService.js";
import type { IPaymentObserver } from "../payment/IPaymentObserver.js";
import type { IPaymentResult, IPaymentError, IPaymentDetails } from "../../types/PaymentTypes.js";
import type { PaymentMethod } from "../../types/index.js";
import type { Order } from "@prisma/client";
import { AppLogger } from "../../AppLogger.js";

/**
 * Service de gestion des commandes (Singleton)
 * Implémente IPaymentObserver pour recevoir les notifications de paiement
 */
export class OrderService implements IPaymentObserver {
  private static singleInstance: OrderService | null = null;
  private sessionService: SessionService;
  private cartService: CartService;
  private paymentService: PaymentService;
  private productService: ProductService;
  
  // Variables pour stocker le contexte de la commande en cours
  private currentOrderContext: {
    shippingAddress: string;
    paymentMethod: PaymentMethod;
    resolve: (order: Order) => void;
    reject: (error: Error) => void;
  } | null = null;

  private constructor() {
    this.sessionService = SessionService.instance;
    this.cartService = CartService.instance;
    this.paymentService = PaymentService.instance;
    this.productService = ProductService.instance;
  }

  public static get instance(): OrderService {
    if (!OrderService.singleInstance) {
      OrderService.singleInstance = new OrderService();
      AppLogger.debug('✅ OrderService instance created');
    }
    return OrderService.singleInstance;
  }

  /**
   * Crée une commande à partir du panier
   * S'abonne au PaymentService pour recevoir les notifications de paiement
   */
  public async createOrderFromCart(
    paymentMethod: PaymentMethod,
    paymentDetails: IPaymentDetails,
    shippingAddress: string
  ): Promise<Order> {
    // Vérifier qu'un utilisateur est connecté
    const session = this.sessionService.getSession();
    if (!session) {
      throw new Error('User must be logged in to create an order');
    }

    // Valider le panier
    const validationResult = await this.cartService.validateCart();
    if (!validationResult.isValid) {
      const errorMessages = validationResult.errors.map(e => e.message).join(', ');
      throw new Error(`Cart validation failed: ${errorMessages}`);
    }

    const cart = this.cartService.getCart();
    if (cart.items.length === 0) {
      throw new Error('Cart is empty');
    }

    const total = this.cartService.calculateTotal(cart);

    // Sélectionner la méthode de paiement
    this.paymentService.selectPaymentMethod(paymentMethod);

    // S'abonner au service de paiement
    this.paymentService.subscribe(this);
    AppLogger.info(`📦 Creating order for user ${session.userId}, total: $${total}`);

    // Créer une promesse qui sera résolue par les callbacks de l'observer
    return new Promise<Order>((resolve, reject) => {
      // Stocker le contexte de la commande
      this.currentOrderContext = {
        shippingAddress,
        paymentMethod,
        resolve,
        reject
      };

      // Déclencher le paiement (les callbacks seront appelés de manière asynchrone)
      this.paymentService.processPayment(total, paymentDetails).catch((error) => {
        // En cas d'erreur avant même que le paiement soit traité
        this.paymentService.unsubscribe(this);
        this.currentOrderContext = null;
        reject(error);
      });
    });
  }

  /**
   * Callback appelé lorsque le paiement réussit (Observer pattern)
   */
  public async onPaymentSuccess(result: IPaymentResult): Promise<void> {
    if (!this.currentOrderContext) {
      AppLogger.error('❌ onPaymentSuccess called without order context');
      return;
    }

    try {
      const session = this.sessionService.getSession();
      if (!session) {
        throw new Error('Session lost during payment processing');
      }

      const cart = this.cartService.getCart();
      const prisma = PrismaClientSingleton.getInstance();

      AppLogger.info(`✅ Payment successful, creating order in database...`);

      // Créer la commande en DB avec une transaction
      const order = await prisma.$transaction(async (tx) => {
        // Créer l'order
        const newOrder = await tx.order.create({
          data: {
            userId: session.userId,
            status: 'PENDING', // Commence en PENDING pour permettre l'annulation
            total: result.amount,
            shippingAddress: this.currentOrderContext!.shippingAddress,
            paymentMethod: this.currentOrderContext!.paymentMethod,
            items: {
              create: cart.items.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price
              }))
            }
          },
          include: {
            items: true
          }
        });

        // Mettre à jour le stock de chaque produit
        for (const item of cart.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity
              }
            }
          });
        }

        return newOrder;
      });

      // Vider le panier
      this.cartService.clearCart();

      AppLogger.info(`✅ Order created successfully: ${order.id}`);

      // Se désabonner du service de paiement
      this.paymentService.unsubscribe(this);

      // Résoudre la promesse
      this.currentOrderContext.resolve(order);
      this.currentOrderContext = null;

    } catch (error) {
      AppLogger.error(`❌ Error creating order: ${error}`);
      this.paymentService.unsubscribe(this);
      this.currentOrderContext?.reject(error instanceof Error ? error : new Error(String(error)));
      this.currentOrderContext = null;
    }
  }

  /**
   * Callback appelé lorsque le paiement échoue (Observer pattern)
   */
  public async onPaymentFailure(error: IPaymentError): Promise<void> {
    AppLogger.error(`❌ Payment failed: ${error.message}`);

    // Se désabonner du service de paiement
    this.paymentService.unsubscribe(this);

    if (this.currentOrderContext) {
      this.currentOrderContext.reject(new Error(`Payment failed: ${error.message}`));
      this.currentOrderContext = null;
    }
  }

  /**
   * Récupère une commande par son ID
   */
  public async getOrderById(orderId: string): Promise<Order | null> {
    const prisma = PrismaClientSingleton.getInstance();
    return await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });
  }

  /**
   * Récupère toutes les commandes d'un utilisateur
   */
  public async getUserOrders(userId: string): Promise<Order[]> {
    const prisma = PrismaClientSingleton.getInstance();
    return await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  /**
   * Annule une commande (uniquement si status = PENDING)
   */
  public async cancelOrder(orderId: string): Promise<Order> {
    const prisma = PrismaClientSingleton.getInstance();

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    });

    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    if (order.status !== 'PENDING') {
      throw new Error(`Cannot cancel order with status ${order.status}`);
    }

    // Mettre à jour le statut et restaurer le stock
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Restaurer le stock
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity
            }
          }
        });
      }

      // Mettre à jour le statut
      return await tx.order.update({
        where: { id: orderId },
        data: { status: 'CANCELLED' },
        include: { items: true }
      });
    });

    AppLogger.info(`✅ Order ${orderId} cancelled`);
    return updatedOrder;
  }
}

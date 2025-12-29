import type { IPaymentAdapter } from "./IPaymentAdapter.js";
import type { IPaymentObserver } from "./IPaymentObserver.js";
import type { IPaymentDetails, IPaymentResult, IPaymentError } from "../../types/PaymentTypes.js";
import type { PaymentMethod } from "../../types/index.js";
import { PayPalAdapter } from "./PayPalAdapter.js";
import { CreditCardAdapter } from "./CreditCardAdapter.js";
import { AppLogger } from "../../AppLogger.js";

/**
 * Service de paiement (Singleton)
 * Utilise le pattern Adapter pour choisir la méthode de paiement
 * Utilise le pattern Observer pour notifier les observers des résultats
 */
export class PaymentService {
  private static singleInstance: PaymentService | null = null;
  private observers: IPaymentObserver[] = [];
  private adapters: Map<PaymentMethod, IPaymentAdapter>;
  private selectedAdapter: IPaymentAdapter | null = null;

  private constructor() {
    // Initialiser les adapters disponibles
    this.adapters = new Map<PaymentMethod, IPaymentAdapter>();
    this.adapters.set('PAYPAL', new PayPalAdapter());
    this.adapters.set('CREDIT_CARD', new CreditCardAdapter());
  }

  public static get instance(): PaymentService {
    if (!PaymentService.singleInstance) {
      PaymentService.singleInstance = new PaymentService();
      AppLogger.debug('✅ PaymentService instance created');
    }
    return PaymentService.singleInstance;
  }

  /**
   * Sélectionne la méthode de paiement
   */
  public selectPaymentMethod(method: PaymentMethod): void {
    const adapter = this.adapters.get(method);
    if (!adapter) {
      throw new Error(`Payment method ${method} not supported`);
    }
    this.selectedAdapter = adapter;
    AppLogger.info(`💳 Payment method selected: ${method}`);
  }

  /**
   * Traite un paiement
   */
  public async processPayment(amount: number, details: IPaymentDetails): Promise<IPaymentResult> {
    if (!this.selectedAdapter) {
      throw new Error('No payment method selected');
    }

    if (amount <= 0) {
      const error: IPaymentError = {
        message: 'Amount must be greater than 0',
        code: 'INVALID_AMOUNT',
        timestamp: new Date().toISOString()
      };
      await this.notifyFailure(error);
      throw new Error(error.message);
    }

    try {
      const result = await this.selectedAdapter.processPayment(amount, details);
      
      if (result.status === 'SUCCESS') {
        await this.notifySuccess(result);
      } else {
        const error: IPaymentError = {
          message: result.message,
          code: 'PAYMENT_FAILED',
          timestamp: result.timestamp
        };
        await this.notifyFailure(error);
      }

      return result;
    } catch (error) {
      const paymentError: IPaymentError = {
        message: error instanceof Error ? error.message : 'Unknown payment error',
        code: 'PAYMENT_ERROR',
        timestamp: new Date().toISOString()
      };
      await this.notifyFailure(paymentError);
      throw error;
    }
  }

  /**
   * Rembourse une transaction
   */
  public async refund(transactionId: string): Promise<boolean> {
    if (!this.selectedAdapter) {
      throw new Error('No payment method selected');
    }

    return await this.selectedAdapter.refund(transactionId);
  }

  /**
   * Ajoute un observer
   */
  public subscribe(observer: IPaymentObserver): void {
    if (!this.observers.includes(observer)) {
      this.observers.push(observer);
      AppLogger.debug(`✅ Observer subscribed to PaymentService`);
    }
  }

  /**
   * Retire un observer
   */
  public unsubscribe(observer: IPaymentObserver): void {
    const index = this.observers.indexOf(observer);
    if (index >= 0) {
      this.observers.splice(index, 1);
      AppLogger.debug(`✅ Observer unsubscribed from PaymentService`);
    }
  }

  /**
   * Notifie tous les observers du succès du paiement
   */
  private async notifySuccess(result: IPaymentResult): Promise<void> {
    AppLogger.info(`📢 Notifying ${this.observers.length} observer(s) of payment success`);
    for (const observer of this.observers) {
      await observer.onPaymentSuccess(result);
    }
  }

  /**
   * Notifie tous les observers de l'échec du paiement
   */
  private async notifyFailure(error: IPaymentError): Promise<void> {
    AppLogger.warn(`📢 Notifying ${this.observers.length} observer(s) of payment failure`);
    for (const observer of this.observers) {
      await observer.onPaymentFailure(error);
    }
  }
}

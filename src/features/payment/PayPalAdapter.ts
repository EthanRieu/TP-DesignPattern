import type { IPaymentAdapter } from "./IPaymentAdapter.js";
import type { IPaymentDetails, IPaymentResult } from "../../types/PaymentTypes.js";
import { AppLogger } from "../../AppLogger.js";

/**
 * Adapter PayPal - Simulation de paiement PayPal
 */
export class PayPalAdapter implements IPaymentAdapter {
  
  public async processPayment(amount: number, details: IPaymentDetails): Promise<IPaymentResult> {
    AppLogger.info(`💳 Processing PayPal payment for $${amount}...`);

    // Validation simple de l'email
    if (!details.email || !details.email.includes('@')) {
      throw new Error('Invalid PayPal email');
    }

    // Simulation d'un délai de traitement
    await this.simulateDelay(1000);

    // Génération d'un ID de transaction simulé
    const transactionId = `PAYPAL-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    const result: IPaymentResult = {
      status: 'SUCCESS',
      transactionId,
      amount,
      message: `Payment successful via PayPal (${details.email})`,
      timestamp: new Date().toISOString()
    };

    AppLogger.info(`✅ PayPal payment successful: ${transactionId}`);
    return result;
  }

  public async refund(transactionId: string): Promise<boolean> {
    AppLogger.info(`💰 Processing PayPal refund for transaction ${transactionId}...`);
    await this.simulateDelay(800);
    AppLogger.info(`✅ PayPal refund successful`);
    return true;
  }

  private async simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

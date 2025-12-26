import type { IPaymentAdapter } from "./IPaymentAdapter.js";
import type { IPaymentDetails, IPaymentResult } from "../../types/PaymentTypes.js";
import { AppLogger } from "../../AppLogger.js";

/**
 * Adapter Carte Bancaire - Simulation de paiement par carte
 */
export class CreditCardAdapter implements IPaymentAdapter {

  public async processPayment(amount: number, details: IPaymentDetails): Promise<IPaymentResult> {
    AppLogger.info(`💳 Processing credit card payment for $${amount}...`);

    // Validation basique des détails de la carte
    this.validateCardDetails(details);

    // Simulation d'un délai de traitement
    await this.simulateDelay(1500);

    // Génération d'un ID de transaction simulé
    const transactionId = `CC-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    const maskedCardNumber = this.maskCardNumber(details.cardNumber!);

    const result: IPaymentResult = {
      status: 'SUCCESS',
      transactionId,
      amount,
      message: `Payment successful via Credit Card (${maskedCardNumber})`,
      timestamp: new Date().toISOString()
    };

    AppLogger.info(`✅ Credit card payment successful: ${transactionId}`);
    return result;
  }

  public async refund(transactionId: string): Promise<boolean> {
    AppLogger.info(`💰 Processing credit card refund for transaction ${transactionId}...`);
    await this.simulateDelay(1000);
    AppLogger.info(`✅ Credit card refund successful`);
    return true;
  }

  /**
   * Validation basique des détails de carte (pour simulation)
   */
  private validateCardDetails(details: IPaymentDetails): void {
    if (!details.cardNumber || details.cardNumber.length < 13) {
      throw new Error('Invalid card number');
    }

    if (!details.cardholderName || details.cardholderName.trim().length === 0) {
      throw new Error('Cardholder name is required');
    }

    if (!details.expirationDate || !this.isValidExpirationDate(details.expirationDate)) {
      throw new Error('Invalid or expired card');
    }

    if (!details.cvv || details.cvv.length < 3) {
      throw new Error('Invalid CVV');
    }
  }

  /**
   * Vérifie si la date d'expiration est valide (format MM/YY)
   */
  private isValidExpirationDate(expiration: string): boolean {
    const [month, year] = expiration.split('/');
    if (!month || !year) return false;

    const expMonth = parseInt(month, 10);
    const expYear = parseInt(`20${year}`, 10);

    if (expMonth < 1 || expMonth > 12) return false;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (expYear < currentYear) return false;
    if (expYear === currentYear && expMonth < currentMonth) return false;

    return true;
  }

  /**
   * Masque le numéro de carte pour l'affichage
   */
  private maskCardNumber(cardNumber: string): string {
    const last4 = cardNumber.slice(-4);
    return `**** **** **** ${last4}`;
  }

  private async simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

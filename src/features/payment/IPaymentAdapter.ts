import type { IPaymentDetails, IPaymentResult } from "../../types/PaymentTypes.js";

/**
 * Interface commune pour tous les adaptateurs de paiement (Adapter Pattern)
 */
export interface IPaymentAdapter {
  /**
   * Traite un paiement
   */
  processPayment(amount: number, details: IPaymentDetails): Promise<IPaymentResult>;

  /**
   * Rembourse une transaction
   */
  refund(transactionId: string): Promise<boolean>;
}

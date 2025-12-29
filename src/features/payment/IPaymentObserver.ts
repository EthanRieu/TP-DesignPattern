import type { IPaymentResult, IPaymentError } from "../../types/PaymentTypes.js";

/**
 * Interface Observer pour être notifié des événements de paiement (Observer Pattern)
 */
export interface IPaymentObserver {
  /**
   * Appelé lorsqu'un paiement réussit
   */
  onPaymentSuccess(result: IPaymentResult): Promise<void>;

  /**
   * Appelé lorsqu'un paiement échoue
   */
  onPaymentFailure(error: IPaymentError): Promise<void>;
}

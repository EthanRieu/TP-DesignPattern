/**
 * Types et interfaces pour la gestion des paiements
 */

export type PaymentStatus = 'SUCCESS' | 'FAILED' | 'PENDING' | 'REFUNDED';

export interface IPaymentDetails {
  // Pour PayPal
  email?: string;
  
  // Pour carte bancaire
  cardNumber?: string;
  cardholderName?: string;
  expirationDate?: string;
  cvv?: string;
}

export interface IPaymentResult {
  status: PaymentStatus;
  transactionId: string;
  amount: number;
  message: string;
  timestamp: string;
}

export interface IPaymentError {
  message: string;
  code: string;
  timestamp: string;
}

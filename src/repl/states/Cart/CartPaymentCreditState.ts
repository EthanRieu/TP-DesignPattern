import type {State} from "../../State.js";
import type {Interface} from "node:readline";
import {OrderService} from "../../../features/orders/OrderService.js";
import {readChar, questionAsync} from "../../utils.js";
import {HomeState} from "../index.js";
import {SessionService} from "../../../features/auth/SessionService.js";
import {CartService} from "../../../features/cart/CartService.js";

export class CartPaymentCreditState implements State {
  public static instance: CartPaymentCreditState = new CartPaymentCreditState();
  
  private delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  private sessionService: SessionService;
  private orderService: OrderService;
  private cartService: CartService;
  
  private constructor() {
    this.sessionService = SessionService.instance;
    this.orderService = OrderService.instance;
    this.cartService = CartService.instance;
  }

  async printAndRead(rl: Interface): Promise<State> {
    rl.write("💳 Credit Card Payment\n\n");

    // Vérifier le panier
    const cart = this.cartService.getCart();
    if (cart.items.length === 0) {
      rl.write("❌ Your cart is empty!\n\n");
      rl.write("Press anything to go back to the home page.\n");
      await readChar();
      return HomeState.instance;
    }

    // Demander les informations de carte
    const cardNumber = await questionAsync(rl, "Enter card number: ");
    const cardholderName = await questionAsync(rl, "Enter cardholder name: ");
    const expirationDate = await questionAsync(rl, "Enter expiration date (MM/YY): ");
    const cvv = await questionAsync(rl, "Enter CVV: ");
    
    // Demander l'adresse de livraison
    const shippingAddress = await questionAsync(rl, "Enter your shipping address: ");

    rl.write("\n🔄 Processing credit card payment. Please wait...\n\n");
    await this.delay(2000);

    try {
      const order = await this.orderService.createOrderFromCart(
        'CREDIT_CARD',
        {
          cardNumber: cardNumber.trim(),
          cardholderName: cardholderName.trim(),
          expirationDate: expirationDate.trim(),
          cvv: cvv.trim()
        },
        shippingAddress.trim()
      );

      rl.write("✅ Payment was successful!\n");
      rl.write(`📦 Order created: ${order.id}\n`);
      rl.write(`💰 Total: $${order.total.toFixed(2)}\n\n`);
      rl.write("🎉 Your cart has been cleared.\n\n");
      
    } catch (error) {
      rl.write("❌ Payment failed!\n");
      rl.write(`Error: ${error instanceof Error ? error.message : String(error)}\n\n`);
    }

    rl.write("Press anything to go back to the home page.\n");
    await readChar();
    return HomeState.instance;
  }
}
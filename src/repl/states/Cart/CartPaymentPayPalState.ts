import type {State} from "../../State.js";
import type {Interface} from "node:readline";
import {OrderService} from "../../../features/orders/OrderService.js";
import {delay, readChar, questionAsync} from "../../utils.js";
import {HomeState} from "../index.js";
import {SessionService} from "../../../features/auth/SessionService.js";
import {CartService} from "../../../features/cart/CartService.js";

export class CartPaymentPayPalState implements State {
  public static instance: CartPaymentPayPalState = new CartPaymentPayPalState();
  
  private sessionService: SessionService;
  private orderService: OrderService;
  private cartService: CartService;
  
  private constructor() {
    this.sessionService = SessionService.instance;
    this.orderService = OrderService.instance;
    this.cartService = CartService.instance;
  }

  async printAndRead(rl: Interface): Promise<State> {
    rl.write("💳 PayPal Payment\n\n");

    // Vérifier le panier
    const cart = this.cartService.getCart();
    if (cart.items.length === 0) {
      rl.write("❌ Your cart is empty!\n\n");
      rl.write("Press anything to go back to the home page.\n");
      await readChar();
      return HomeState.instance;
    }

    // Demander l'email PayPal
    const email = await questionAsync(rl, "Enter your PayPal email: ");
    
    // Demander l'adresse de livraison
    const shippingAddress = await questionAsync(rl, "Enter your shipping address: ");

    rl.write("\n🔄 Processing PayPal payment. Please wait...\n\n");
    await delay(1500);

    try {
      const order = await this.orderService.createOrderFromCart(
        'PAYPAL',
        { email: email.trim() },
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
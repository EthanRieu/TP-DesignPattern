import type {State} from "../../State.js";
import type {Interface} from "node:readline";
import {AuthService} from "../../../features/auth/AuthService.js";
import {
  AccountMyProductsDeleteState,
  AccountMyProductsEditState, AccountMyProductsGetState, AccountState, CartPaymentCreditState,
  CartPaymentPayPalState, CartState, HomeState
} from "../index.js";
import {readChar, singleCharQuestion} from "../../utils.js";
import {SessionService} from "../../../features/auth/SessionService.js";

export class CartPaymentState implements State {
  public static instance: CartPaymentState = new CartPaymentState();

  private isInvalidChoice = false;
  private authService: AuthService;
  private sessionService: SessionService;
  private constructor() {
    this.authService = AuthService.instance;
    this.sessionService = SessionService.instance;
  }

  async printAndRead(rl: Interface): Promise<State> {
    const session = this.sessionService.getSession();
    if (!session) {
      rl.write("Error: Couldn't retrieve authentication session.\n\n");
      rl.write("Press anything to go back to the cart page.\n");
      await readChar();
      return CartState.instance;
    }

    const user = await this.authService.getUserById(this.sessionService.getSession()!.userId);
    if (!user) {
      rl.write("Error: Couldn't retrieve user.\n\n");
      rl.write("Press anything to go back to the cart page.\n");
      await readChar();
      return CartState.instance;
    }

    rl.write("Cart payment page:\n\n");

    rl.write("Choose payment method:\n");
    rl.write("1 - Credit card\n");
    rl.write("2 - PayPal\n");
    rl.write("3 - Go back to cart\n\n");

    if (this.isInvalidChoice) {
      rl.write("Invalid choice, pick from the options above.\n\n");
      this.isInvalidChoice = false;
    }

    const choice = await singleCharQuestion(rl, "Choice: ");

    // TODO: Implémenter les states
    switch (choice) {
      case "1":
        return CartPaymentCreditState.instance;
      case "2":
        return CartPaymentPayPalState.instance;
      case "3":
        return CartState.instance;
      default:
        this.isInvalidChoice = true;
        return CartPaymentState.instance;
    }
  }
}
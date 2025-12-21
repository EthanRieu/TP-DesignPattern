import type {State} from "../../State.js";
import type {Interface} from "node:readline";
import {AuthService} from "../../../features/auth/AuthService.js";
import {
  CartPaymentCreditState,
  CartPaymentPayPalState,
  CartState,
  type Choice,
  defaultErrorMessage,
  promptForChoices
} from "../index.js";
import {readChar} from "../../utils.js";
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

    rl.write("Choose your payment method:\n");
    const choices: Choice[] = [
      {
        choiceCharacter: '1',
        description: 'Credit card',
        state: CartPaymentCreditState.instance
      },
      {
        choiceCharacter: '2',
        description: `PayPal`,
        state: CartPaymentPayPalState.instance
      },
      {
        choiceCharacter: '3',
        description: 'Go back to cart',
        state: CartState.instance
      },
    ];

    const newState = await promptForChoices(rl, choices, this.isInvalidChoice ? defaultErrorMessage: undefined);
    this.isInvalidChoice = newState === undefined;
    return newState ? newState : CartPaymentState.instance;
  }
}
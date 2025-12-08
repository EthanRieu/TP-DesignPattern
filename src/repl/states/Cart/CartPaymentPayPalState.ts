import type {State} from "../../State.js";
import type {Interface} from "node:readline";
import {AuthService} from "../../../features/auth/AuthService.js";
import {delay, readChar} from "../../utils.js";
import {AccountState} from "../index.js";
import {SessionService} from "../../../features/auth/SessionService.js";

export class CartPaymentPayPalState implements State {
  public static instance: CartPaymentPayPalState = new CartPaymentPayPalState();
  private authService: AuthService;
  private sessionService: SessionService;
  private constructor() {
    this.authService = AuthService.instance;
    this.sessionService = SessionService.instance;
  }

  async printAndRead(rl: Interface): Promise<State> {
    rl.write("Redirecting to PayPal. Please wait\n\n");

    await delay(2000);

    rl.write("Payment was successful!\n");
    rl.write("TODO: empty cart\n");

    rl.write("Press anything to go back to the account page.\n");
    await readChar();
    return AccountState.instance;
  }
}
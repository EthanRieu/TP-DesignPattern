import type {State} from "../../State.js";
import type {Interface} from "node:readline";
import {AuthService} from "../../../features/auth/AuthService.js";
import {readChar} from "../../utils.js";
import {HomeState} from "../index.js";
import {SessionService} from "../../../features/auth/SessionService.js";

export class CartPaymentCreditState implements State {
  public static instance: CartPaymentCreditState = new CartPaymentCreditState();
  private delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
  private authService: AuthService;
  private sessionService: SessionService;
  private constructor() {
    this.authService = AuthService.instance;
    this.sessionService = SessionService.instance;
  }

  async printAndRead(rl: Interface): Promise<State> {
    rl.write("Paying via credit card. Please wait\n\n");

    await this.delay(2000);

    rl.write("Payment was successful!\n");
    rl.write("TODO: empty cart\n");

    rl.write("Press anything to go back to the home page.\n");
    await readChar();
    return HomeState.instance;
  }
}
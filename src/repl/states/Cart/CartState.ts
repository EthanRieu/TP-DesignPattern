import type {State} from "../../State.js";
import type {Interface} from "node:readline";
import {AuthService} from "../../../features/auth/AuthService.js";
import {
  AccountState,
  CartPaymentState,
  type Choice,
  defaultErrorMessage, HomeState,
  promptForChoices
} from "../index.js";
import {readChar} from "../../utils.js";
import {SessionService} from "../../../features/auth/SessionService.js";

export class CartState implements State {
  public static instance: CartState = new CartState();

  private isInvalidChoice = false;
  private authService: AuthService;
  private sessionService: SessionService;
  private constructor() {
    this.authService = AuthService.instance;
    this.sessionService = SessionService.instance;
  }

  async printAndRead(rl: Interface): Promise<State> {
    if (!this.sessionService.isLoggedIn()) {
      rl.write("You need to be logged in before accessing your cart.\n\n");
      rl.write("Press anything to continue to the Account page.\n");
      await readChar();
      return AccountState.instance;
    }

    const session = this.sessionService.getSession();
    if (!session) {
      rl.write("Error: Couldn't retrieve authentication session.\n\n");
      rl.write("Press anything to go back to the Account page.\n");
      await readChar();
      return AccountState.instance;
    }

    const user = await this.authService.getUserById(this.sessionService.getSession()!.userId);
    if (!user) {
      rl.write("Error: Couldn't retrieve user.\n\n");
      rl.write("Press anything to go back to the Account page.\n");
      await readChar();
      return AccountState.instance;
    }

    if (user.role !== "CUSTOMER") {
      rl.write("Only customers are able to interact with their cart.\n\n");
      rl.write("Press anything to go back to the Account page.\n");
      await readChar();
      return AccountState.instance;
    }

    rl.write("Cart page:\n");

    rl.write("TODO: print cart\n")

    const choices: Choice[] = [
      {
        choiceCharacter: '1',
        description: 'Continue to payment',
        state: CartPaymentState.instance
      },
      {
        choiceCharacter: '2',
        description: 'Go back to home',
        state: HomeState.instance
      },
    ];

    const newState = await promptForChoices(rl, choices, this.isInvalidChoice ? defaultErrorMessage: undefined);
    this.isInvalidChoice = newState === undefined;
    return newState ? newState : CartState.instance;
  }
}
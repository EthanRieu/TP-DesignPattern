import type {State} from "../../State.js";
import type {Interface} from "node:readline";
import {AuthService} from "../../../features/auth/AuthService.js";
import {AccountState, HomeState} from "../index.js";
import {readChar} from "../../utils.js";
import {SessionService} from "../../../features/auth/SessionService.js";

export class CartState implements State {
  public static instance: CartState = new CartState();

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
      await readChar(rl);
      return AccountState.instance;
    }

    const session = this.sessionService.getSession();
    if (!session) {
      rl.write("Error: Couldn't retrieve authentication session.\n\n");
      rl.write("Press anything to go back to the Account page.\n");
      await readChar(rl);
      return AccountState.instance;
    }

    const user = await this.authService.getUserById(this.sessionService.getSession()!.userId);
    if (!user) {
      rl.write("Error: Couldn't retrieve user.\n\n");
      rl.write("Press anything to go back to the Account page.\n");
      await readChar(rl);
      return AccountState.instance;
    }

    if (user.role !== "CUSTOMER") {
      rl.write("Only customers are able to interact with their cart.\n\n");
      rl.write("Press anything to go back to the Account page.\n");
      await readChar(rl);
      return AccountState.instance;
    }

    rl.write("TODO\n");
    await readChar(rl);

    return AccountState.instance;
  }
}
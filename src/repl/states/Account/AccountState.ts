import type {Interface} from "node:readline";
import {questionAsync, singleCharQuestion} from "../../utils.js";
import {
  AccountCreateState,
  AccountMyOrdersState,
  AccountMyProductsState,
  AccountSignInOutState,
  HomeState,
} from "../index.js";
import {SessionService} from "../../../features/auth/SessionService.js";
import type {State} from "../../State.js";

export class AccountState implements State {
  public static instance: AccountState = new AccountState();

  private isInvalidChoice = false;
  private sessionService: SessionService;
  private constructor() {
    this.sessionService = SessionService.instance;
  }

  async printAndRead(rl: Interface): Promise<State> {
    const signInOutText = this.sessionService.isLoggedIn() ? "Sign out" : "Sign in";

    rl.write("Account page:\n")
    rl.write("1 - Create account\n");
    rl.write(`2 - ${signInOutText}\n`);
    rl.write("3 - My products\n");
    rl.write("4 - My orders\n");
    rl.write("5 - Back to home page\n\n");

    if (this.isInvalidChoice) {
      rl.write("Invalid choice, pick from the options above.\n\n");
      this.isInvalidChoice = false;
    }

    const choice = await singleCharQuestion(rl, "Choice: ");

    switch (choice) {
      case "1":
        return AccountCreateState.instance;
      case "2":
        return AccountSignInOutState.instance;
      case "3":
        return AccountMyProductsState.instance;
      case "4":
        return AccountMyOrdersState.instance;
      case "5":
        return HomeState.instance;
      default:
        this.isInvalidChoice = true;
        return AccountState.instance;
    }
  }
}
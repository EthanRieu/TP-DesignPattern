import type {State} from "../../../State.js";
import type {Interface} from "node:readline";
import {AuthService} from "../../../../features/auth/AuthService.js";
import {consoleTable, readChar, singleCharQuestion} from "../../../utils.js";
import {
  AccountMyOrdersDeleteState,
  AccountMyOrdersEditState,
  AccountMyOrdersGetState,
  AccountState
} from "../../index.js";
import {SessionService} from "../../../../features/auth/SessionService.js";

export class AccountMyOrdersState implements State {
  public static instance: AccountMyOrdersState = new AccountMyOrdersState();

  private isInvalidChoice = false;
  private authService: AuthService;
  private sessionService: SessionService;
  private constructor() {
    this.authService = AuthService.instance;
    this.sessionService = SessionService.instance;
  }

  async printAndRead(rl: Interface): Promise<State> {
    if (!this.sessionService.isLoggedIn()) {
      rl.write("You need to be logged in before accessing your orders.\n\n");
      rl.write("Press anything to go back to the Account page.\n");
      await readChar();
      return AccountState.instance;
    }

    rl.write("My orders page:\n")

    // TODO: récupérer les commandes depuis la DB
    const orders = [
      {
        id: 1,
        total: 49.99,
        itemCount: 1,
        shippingAddress: "Une rue fictive - 51100 Reims"
      },
      {
        id: 2,
        total: 499.99,
        itemCount: 2,
        shippingAddress: "Une allée fictive - 51000 Châlons-en-Champagne"
      }
    ];

    consoleTable(orders, "id");

    rl.write("1 - Get order details\n");
    rl.write("2 - Edit order\n");
    rl.write("3 - Delete order\n");
    rl.write("4 - Back to account page\n\n");

    if (this.isInvalidChoice) {
      rl.write("Invalid choice, pick from the options above.\n\n");
      this.isInvalidChoice = false;
    }

    const choice = await singleCharQuestion(rl, "Choice: ");

    // TODO: Implémenter les states
    switch (choice) {
      case "1":
        return AccountMyOrdersGetState.instance;
      case "2":
        return AccountMyOrdersEditState.instance;
      case "3":
        return AccountMyOrdersDeleteState.instance;
      case "4":
        return AccountState.instance;
      default:
        this.isInvalidChoice = true;
        return AccountMyOrdersState.instance;
    }
  }
}
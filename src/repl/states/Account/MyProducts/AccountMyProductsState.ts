import type {State} from "../../../State.js";
import type {Interface} from "node:readline";
import {AuthService} from "../../../../features/auth/AuthService.js";
import {consoleTable, readChar, singleCharQuestion} from "../../../utils.js";
import {
  AccountCreateState, AccountMyOrdersState, AccountMyProductsDeleteState, AccountMyProductsEditState,
  AccountMyProductsGetState, AccountSignInOutState, AccountState, HomeState
} from "../../index.js";
import {SessionService} from "../../../../features/auth/SessionService.js";

export class AccountMyProductsState implements State {
  public static instance: AccountMyProductsState = new AccountMyProductsState();

  private isInvalidChoice = false;
  private authService: AuthService;
  private sessionService: SessionService;
  private constructor() {
    this.authService = AuthService.instance;
    this.sessionService = SessionService.instance;
  }

  async printAndRead(rl: Interface): Promise<State> {
    if (!this.sessionService.isLoggedIn()) {
      rl.write("You need to be logged in before accessing your products.\n\n");
      rl.write("Press anything to go back to the Account page.\n");
      await readChar();
      return AccountState.instance;
    }

    rl.write("My products page:\n")

    // TODO: récupérer les produits depuis la DB
    const products = [
      {
        name: "Café en grains bio",
        price: 12.99,
        stock: 200
      },
      {
        name: "iPhone 15 Pro",
        price: 1199.99,
        stock: 50
      }
    ];

    consoleTable(products, "name");

    rl.write("1 - Get product details\n");
    rl.write("2 - Edit product\n");
    rl.write("3 - Delete product\n");
    rl.write("4 - Back to account page\n\n");

    if (this.isInvalidChoice) {
      rl.write("Invalid choice, pick from the options above.\n\n");
      this.isInvalidChoice = false;
    }

    const choice = await singleCharQuestion(rl, "Choice: ");

    // TODO: Implémenter les states
    switch (choice) {
      case "1":
        return AccountMyProductsGetState.instance;
      case "2":
        return AccountMyProductsEditState.instance;
      case "3":
        return AccountMyProductsDeleteState.instance;
      case "4":
        return AccountState.instance;
      default:
        this.isInvalidChoice = true;
        return AccountMyProductsState.instance;
    }
  }
}
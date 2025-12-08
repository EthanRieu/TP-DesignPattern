import type {State} from "../../../State.js";
import type {Interface} from "node:readline";
import {AuthService} from "../../../../features/auth/AuthService.js";
import {consoleTable, readChar} from "../../../utils.js";
import {
  AccountMyProductsDeleteState,
  AccountMyProductsEditState,
  AccountMyProductsGetState,
  AccountState,
  type Choice,
  defaultErrorMessage,
  HomeState,
  promptForChoices
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

    const choices: Choice[] = [
      {
        choiceCharacter: '1',
        description: 'Get product details',
        state: AccountMyProductsGetState.instance
      },
      {
        choiceCharacter: '2',
        description: 'Edit product',
        state: AccountMyProductsEditState.instance
      },
      {
        choiceCharacter: '3',
        description: 'Delete product',
        state: AccountMyProductsDeleteState.instance
      },
      {
        choiceCharacter: '4',
        description: 'Back to account page',
        state: AccountState.instance
      },
    ];

    const newState = await promptForChoices(rl, choices, this.isInvalidChoice ? defaultErrorMessage: undefined);
    this.isInvalidChoice = newState === undefined;
    return newState ? newState : AccountMyProductsState.instance;
  }
}
import type {State} from "../../../State.js";
import type {Interface} from "node:readline";
import {AuthService} from "../../../../features/auth/AuthService.js";
import {consoleTable, readChar} from "../../../utils.js";
import {
  AccountMyOrdersDeleteState,
  AccountMyOrdersEditState,
  AccountMyOrdersGetState,
  AccountState,
  type Choice,
  defaultErrorMessage,
  promptForChoices
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

    const choices: Choice[] = [
      {
        choiceCharacter: '1',
        description: 'Get order details',
        state: AccountMyOrdersGetState.instance
      },
      {
        choiceCharacter: '2',
        description: 'Edit order',
        state: AccountMyOrdersEditState.instance
      },
      {
        choiceCharacter: '3',
        description: 'Delete order',
        state: AccountMyOrdersDeleteState.instance
      },
      {
        choiceCharacter: '4',
        description: 'Back to account page',
        state: AccountState.instance
      },
    ];

    const newState = await promptForChoices(rl, choices, this.isInvalidChoice ? defaultErrorMessage: undefined);
    this.isInvalidChoice = newState === undefined;
    return newState ? newState : AccountMyOrdersState.instance;
  }
}
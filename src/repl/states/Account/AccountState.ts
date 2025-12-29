import type {Interface} from "node:readline";
import {
  AccountCreateState,
  AccountMyOrdersState,
  AccountMyProductsState,
  AccountSignInOutState,
  type Choice,
  defaultErrorMessage,
  HomeState,
  promptForChoices,
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
    const choices: Choice[] = [
      {
        choiceCharacter: '1',
        description: 'Create account',
        state: AccountCreateState.instance
      },
      {
        choiceCharacter: '2',
        description: `${signInOutText}`,
        state: AccountSignInOutState.instance
      },
      {
        choiceCharacter: '3',
        description: 'My products',
        state: AccountMyProductsState.instance
      },
      {
        choiceCharacter: '4',
        description: 'My orders',
        state: AccountMyOrdersState.instance
      },
      {
        choiceCharacter: '5',
        description: 'Back to home page',
        state: HomeState.instance
      },
    ];

    const newState = await promptForChoices(rl, choices, this.isInvalidChoice ? defaultErrorMessage: undefined);
    this.isInvalidChoice = newState === undefined;
    return newState ? newState : AccountState.instance;
  }
}
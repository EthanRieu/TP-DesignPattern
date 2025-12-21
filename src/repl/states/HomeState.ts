import type {State} from "../State.js";
import type {Interface} from "node:readline";
import {ExitState} from "./ExitState.js";
import {
  AccountState,
  CartState,
  CatalogState,
  type Choice,
  defaultErrorMessage,
  promptForChoices
} from "./index.js";

export class HomeState implements State {
  public static instance: HomeState = new HomeState();
  private isInvalidChoice = false;
  private isFirstTime = true;
  private constructor() {}

  async printAndRead(rl: Interface): Promise<State> {
    if (this.isFirstTime) {
      rl.write("Welcome to the ordering application!\n\n");
      this.isFirstTime = false;
    }

    rl.write("Home page: \n");
    const choices: Choice[] = [
      {
        choiceCharacter: '1',
        description: 'Account',
        state: AccountState.instance
      },
      {
        choiceCharacter: '2',
        description: 'Cart',
        state: CartState.instance
      },
      {
        choiceCharacter: '3',
        description: 'Catalog',
        state: CatalogState.instance
      },
      {
        choiceCharacter: '4',
        description: 'Exit',
        state: ExitState.instance
      },
    ];

    const newState = await promptForChoices(rl, choices, this.isInvalidChoice ? defaultErrorMessage: undefined);
    this.isInvalidChoice = newState === undefined;
    return newState ? newState : HomeState.instance;
  }
}
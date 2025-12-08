import type {State} from "../State.js";
import type {Interface} from "node:readline";
import {questionAsync, singleCharQuestion} from "../utils.js";
import {ExitState} from "./ExitState.js";
import {AccountState, CartState, CatalogState} from "./index.js";

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
    rl.write("1 - Account\n");
    rl.write("2 - Cart\n");
    rl.write("3 - Catalog\n");
    rl.write("4 - Exit\n\n");

    if (this.isInvalidChoice) {
      rl.write("Invalid choice, pick from the options above.\n\n");
      this.isInvalidChoice = false;
    }

    const choice = await singleCharQuestion(rl, "Choice: ");

    switch (choice) {
      case "1":
        return AccountState.instance;
      case "2":
        return CartState.instance;
      case "3":
        return CatalogState.instance;
      case "4":
        return ExitState.instance;
      default:
        this.isInvalidChoice = true;
        return HomeState.instance;
    }
  }
}
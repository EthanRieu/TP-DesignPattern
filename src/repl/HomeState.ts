import type {State} from "./state.js";
import type {Interface} from "node:readline";
import {questionAsync} from "./utils.js";
import {ExitState} from "./ExitState.js";

export class HomeState implements State {
  public static instance: HomeState = new HomeState();
  private constructor() {}

  async printAndRead(rl: Interface): Promise<State> {
    rl.write("Home page: \n");
    rl.write("1 - Account\n");
    rl.write("2 - Cart\n");
    rl.write("3 - Catalog\n");
    rl.write("4 - Exit\n\n");

    const choice = await questionAsync(rl, "Choice: ");
    return choice === "4" ? ExitState.instance : HomeState.instance;
  }

}
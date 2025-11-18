import type {State} from "./state.js";
import type {Interface} from "node:readline";

export class ExitState implements State {
  public static instance: ExitState = new ExitState();
  private constructor() {}

  async printAndRead(rl: Interface): Promise<State> {
    console.log("Exiting...")
    return ExitState.instance;
  }

}
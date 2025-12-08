import type {State} from "../State.js";
import type {Interface} from "node:readline";

export class ExitState implements State {
  public static instance: ExitState = new ExitState();
  private constructor() {}

  async printAndRead(rl: Interface): Promise<State> {
    rl.write("Exiting...\n")
    return ExitState.instance;
  }
}
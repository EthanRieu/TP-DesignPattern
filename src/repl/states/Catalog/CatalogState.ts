import type {State} from "../../State.js";
import type {Interface} from "node:readline";
import {readChar} from "../../utils.js";
import {HomeState} from "../HomeState.js";

export class CatalogState implements State {
  public static instance: CatalogState = new CatalogState();

  private constructor() {}

  async printAndRead(rl: Interface): Promise<State> {
    rl.write("TODO\n");
    await readChar();
    return HomeState.instance;
  }
}
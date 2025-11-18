import type {Interface} from "node:readline";

export abstract class State {
  abstract printAndRead(rl: Interface): Promise<State>;
}
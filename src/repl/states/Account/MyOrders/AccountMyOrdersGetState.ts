import type {State} from "../../../State.js";
import type {Interface} from "node:readline";
import {readChar} from "../../../utils.js";
import {AccountMyOrdersState} from "./AccountMyOrdersState.js";
import {getOrderByIdOrCancelAsync} from "./utils.js";

export class AccountMyOrdersGetState implements State {
  public static instance: AccountMyOrdersGetState = new AccountMyOrdersGetState();

  private isInvalidChoice = false;
  private constructor() {}

  async printAndRead(rl: Interface): Promise<State> {
    rl.write("Order details page: \n")

    const orderOrCancel = await getOrderByIdOrCancelAsync(rl);
    if (!orderOrCancel) {
      return AccountMyOrdersState.instance
    }

    rl.write("TODO: print order details\n")

    rl.write("Press anything to go back to the orders page.\n");
    await readChar();

    return AccountMyOrdersState.instance;
  }
}
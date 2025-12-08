import type {State} from "../../../State.js";
import type {Interface} from "node:readline";
import {readChar} from "../../../utils.js";
import {AccountMyOrdersState} from "./AccountMyOrdersState.js";
import {getOrderByIdOrCancelAsync} from "./utils.js";

export class AccountMyOrdersEditState implements State {
  public static instance: AccountMyOrdersEditState = new AccountMyOrdersEditState();

  private constructor() {}

  async printAndRead(rl: Interface): Promise<State> {
    rl.write("Order edit page: \n")

    const orderOrCancel = await getOrderByIdOrCancelAsync(rl);
    if (!orderOrCancel) {
      return AccountMyOrdersState.instance;
    }

    rl.write("TODO: print order details\n")

    // foreach field : ask for field edit, if blank, keep the current one
    // after foreach : ask to confirm edit, if anything other than y, don't edit

    return AccountMyOrdersState.instance;
  }
}
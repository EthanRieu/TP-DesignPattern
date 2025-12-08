import type {State} from "../../../State.js";
import type {Interface} from "node:readline";
import {readChar} from "../../../utils.js";
import {AccountMyOrdersState} from "./AccountMyOrdersState.js";
import {getOrderByIdOrCancelAsync} from "./utils.js";

export class AccountMyOrdersDeleteState implements State {
  public static instance: AccountMyOrdersDeleteState = new AccountMyOrdersDeleteState();

  private constructor() {}

  async printAndRead(rl: Interface): Promise<State> {
    rl.write("Order delete page: \n")

    const orderOrCancel = await getOrderByIdOrCancelAsync(rl);
    if (!orderOrCancel) {
      return AccountMyOrdersState.instance;
    }

    rl.write("TODO: print order details\n")
    rl.write("Confirm logging out by typing 'Y' (anything else will cancel the operation).\n\n");
    rl.write("> ");

    const confirmation = await readChar();

    if (confirmation.toLowerCase() === "y") {
      // delete order
      rl.write("\n\n");
      rl.write("Successfully deleted order. Press anything to go back to the orders page.\n\n");
      await readChar();
    }

    return AccountMyOrdersState.instance;
  }
}
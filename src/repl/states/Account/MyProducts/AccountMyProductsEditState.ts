import type {State} from "../../../State.js";
import type {Interface} from "node:readline";
import {readChar} from "../../../utils.js";
import {AccountMyProductsState} from "./AccountMyProductsState.js";
import {getProductByIdOrCancelAsync} from "./utils.js";

export class AccountMyProductsEditState implements State {
  public static instance: AccountMyProductsEditState = new AccountMyProductsEditState();

  private constructor() {}

  async printAndRead(rl: Interface): Promise<State> {
    rl.write("Product edit page: \n")

    const productOrCancel = await getProductByIdOrCancelAsync(rl);
    if (!productOrCancel) {
      return AccountMyProductsState.instance;
    }

    rl.write("TODO: print product details\n")

    // foreach field : ask for field edit, if blank, keep the current one
    // after foreach : ask to confirm edit, if anything other than y, don't edit

    return AccountMyProductsState.instance;
  }
}
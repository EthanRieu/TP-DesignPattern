import type {State} from "../../../State.js";
import type {Interface} from "node:readline";
import {readChar} from "../../../utils.js";
import {AccountMyProductsState} from "./AccountMyProductsState.js";
import {getProductByIdOrCancelAsync} from "./utils.js";

export class AccountMyProductsGetState implements State {
  public static instance: AccountMyProductsGetState = new AccountMyProductsGetState();

  private constructor() {}

  async printAndRead(rl: Interface): Promise<State> {
    rl.write("Product details page: \n")

    const productOrCancel = await getProductByIdOrCancelAsync(rl);
    if (!productOrCancel) {
      return AccountMyProductsState.instance;
    }

    rl.write("TODO: print product details\n")

    rl.write("Press anything to go back to the products page.\n");
    await readChar();

    return AccountMyProductsState.instance;
  }
}
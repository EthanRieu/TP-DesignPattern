import type {State} from "../../../State.js";
import type {Interface} from "node:readline";
import {readChar} from "../../../utils.js";
import {AccountMyProductsState} from "./AccountMyProductsState.js";
import {getProductByIdOrCancelAsync} from "./utils.js";

export class AccountMyProductsDeleteState implements State {
  public static instance: AccountMyProductsDeleteState = new AccountMyProductsDeleteState();

  private constructor() {}

  async printAndRead(rl: Interface): Promise<State> {
    rl.write("Product delete page: \n")

    const productOrCancel = await getProductByIdOrCancelAsync(rl);
    if (!productOrCancel) {
      return AccountMyProductsState.instance;
    }

    rl.write("TODO: print product details\n")
    rl.write("Confirm logging out by typing 'Y' (anything else will cancel the operation).\n\n");
    rl.write("> ");

    const confirmation = await readChar();

    if (confirmation.toLowerCase() === "y") {
      // delete product
      rl.write("\n\n");
      rl.write("Successfully deleted product. Press anything to go back to the products page.\n\n");
      await readChar();
    }

    return AccountMyProductsState.instance;
  }
}
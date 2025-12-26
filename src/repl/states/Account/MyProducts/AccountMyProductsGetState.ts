import type {State} from "../../../State.js";
import type {Interface} from "node:readline";
import {readChar} from "../../../utils.js";
import {AccountMyProductsState} from "./AccountMyProductsState.js";
import {getProductByIdOrCancelAsync} from "./utils.js";

export class AccountMyProductsGetState implements State {
  public static instance: AccountMyProductsGetState = new AccountMyProductsGetState();

  private constructor() {}

  async printAndRead(rl: Interface): Promise<State> {
    rl.write("Product details page: \n");

    const productOrCancel = await getProductByIdOrCancelAsync(rl);
    if (!productOrCancel) {
      return AccountMyProductsState.instance;
    }

    const product = productOrCancel;

    // Afficher les détails complets du produit
    rl.write("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    rl.write("📦 PRODUCT DETAILS\n");
    rl.write("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n");
    
    rl.write(`ID:          ${product.id}\n`);
    rl.write(`Name:        ${product.name}\n`);
    rl.write(`Description: ${product.description}\n`);
    rl.write(`Price:       $${product.price}\n`);
    rl.write(`Stock:       ${product.stock}\n`);
    rl.write(`Category:    ${product.category}\n`);
    rl.write(`Seller ID:   ${product.userId}\n`);
    
    rl.write("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n");

    rl.write("Press anything to go back to the products page.\n");
    await readChar();

    return AccountMyProductsState.instance;
  }
}
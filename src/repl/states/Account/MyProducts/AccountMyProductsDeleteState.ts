import type {State} from "../../../State.js";
import type {Interface} from "node:readline";
import {readChar} from "../../../utils.js";
import {AccountMyProductsState} from "./AccountMyProductsState.js";
import {getProductByIdOrCancelAsync} from "./utils.js";
import {ProductService} from "../../../../features/catalog/ProductService.js";

export class AccountMyProductsDeleteState implements State {
  public static instance: AccountMyProductsDeleteState = new AccountMyProductsDeleteState();

  private productService: ProductService;

  private constructor() {
    this.productService = ProductService.instance;
  }

  async printAndRead(rl: Interface): Promise<State> {
    rl.write("Delete Product page: \n");

    const productOrCancel = await getProductByIdOrCancelAsync(rl);
    if (!productOrCancel) {
      return AccountMyProductsState.instance;
    }

    const product = productOrCancel;

    // Afficher les détails du produit
    rl.write("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    rl.write("⚠️  DELETE PRODUCT\n");
    rl.write("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n");
    
    rl.write(`Product ID:   ${product.id}\n`);
    rl.write(`Name:         ${product.name}\n`);
    rl.write(`Description:  ${product.description}\n`);
    rl.write(`Price:        $${product.price}\n`);
    rl.write(`Stock:        ${product.stock}\n`);
    rl.write(`Category:     ${product.category}\n\n`);

    rl.write("Confirm deletion by typing 'Y' (anything else will cancel the operation).\n\n");
    rl.write("> ");

    const confirmation = await readChar();

    if (confirmation.toLowerCase() === "y") {
      try {
        await this.productService.deleteProduct(product.id);
        rl.write("\n\n");
        rl.write("✅ Successfully deleted product.\n\n");
      } catch (error) {
        rl.write("\n\n");
        rl.write(`❌ Error deleting product: ${error instanceof Error ? error.message : String(error)}\n\n`);
      }
    } else {
      rl.write("\n\n");
      rl.write("❌ Deletion cancelled.\n\n");
    }

    rl.write("Press anything to go back to the products page.\n");
    await readChar();

    return AccountMyProductsState.instance;
  }
}
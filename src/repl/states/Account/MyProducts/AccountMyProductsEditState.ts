import type {State} from "../../../State.js";
import type {Interface} from "node:readline";
import {questionAsync, readChar} from "../../../utils.js";
import {AccountMyProductsState} from "./AccountMyProductsState.js";
import {getProductByIdOrCancelAsync} from "./utils.js";
import {ProductService} from "../../../../features/catalog/ProductService.js";
import type {ProductCategory} from "../../../../types/index.js";

export class AccountMyProductsEditState implements State {
  public static instance: AccountMyProductsEditState = new AccountMyProductsEditState();

  private productService: ProductService;

  private constructor() {
    this.productService = ProductService.instance;
  }

  async printAndRead(rl: Interface): Promise<State> {
    rl.write("Edit Product page: \n");

    const productOrCancel = await getProductByIdOrCancelAsync(rl);
    if (!productOrCancel) {
      return AccountMyProductsState.instance;
    }

    const product = productOrCancel;

    // Afficher les détails actuels du produit
    rl.write("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    rl.write("✏️  EDIT PRODUCT\n");
    rl.write("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n");
    
    rl.write("Current values (leave blank to keep current value):\n\n");

    // Demander les nouveaux champs (laisser vide pour garder l'ancienne valeur)
    const newName = await questionAsync(rl, `Name (${product.name}): `);
    const newDescription = await questionAsync(rl, `Description (${product.description}): `);
    const newPriceStr = await questionAsync(rl, `Price ($${product.price}): `);
    const newStockStr = await questionAsync(rl, `Stock (${product.stock}): `);
    const newCategory = await questionAsync(rl, `Category (${product.category}): `);

    // Préparer les données mises à jour
    const updateData: any = {};
    
    if (newName.trim() !== "") updateData.name = newName.trim();
    if (newDescription.trim() !== "") updateData.description = newDescription.trim();
    if (newPriceStr.trim() !== "") {
      const price = parseFloat(newPriceStr.trim());
      if (!isNaN(price) && price > 0) {
        updateData.price = price;
      }
    }
    if (newStockStr.trim() !== "") {
      const stock = parseInt(newStockStr.trim());
      if (!isNaN(stock) && stock >= 0) {
        updateData.stock = stock;
      }
    }
    if (newCategory.trim() !== "") {
      const category = newCategory.trim().toUpperCase() as ProductCategory;
      if (['ELECTRONICS', 'CLOTHING', 'FOOD'].includes(category)) {
        updateData.category = category;
      }
    }

    // Afficher un résumé des changements
    if (Object.keys(updateData).length === 0) {
      rl.write("\n❌ No changes were made.\n\n");
      rl.write("Press anything to go back to the products page.\n");
      await readChar();
      return AccountMyProductsState.instance;
    }

    rl.write("\n📝 Changes to be made:\n");
    for (const [key, value] of Object.entries(updateData)) {
      rl.write(`   ${key}: ${value}\n`);
    }
    rl.write("\nConfirm edit by typing 'Y' (anything else will cancel the operation).\n\n");
    rl.write("> ");

    const confirmation = await readChar();

    if (confirmation.toLowerCase() === "y") {
      try {
        await this.productService.updateProduct(product.id, updateData);
        rl.write("\n\n");
        rl.write("✅ Successfully updated product.\n\n");
      } catch (error) {
        rl.write("\n\n");
        rl.write(`❌ Error updating product: ${error instanceof Error ? error.message : String(error)}\n\n`);
      }
    } else {
      rl.write("\n\n");
      rl.write("❌ Edit cancelled.\n\n");
    }

    rl.write("Press anything to go back to the products page.\n");
    await readChar();

    return AccountMyProductsState.instance;
  }
}
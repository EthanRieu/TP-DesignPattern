import type {State} from "../../../State.js";
import type {Interface} from "node:readline";
import {AccountMyProductsState} from "./AccountMyProductsState.js";
import {capitalize, consoleTable, questionAsync, readChar, singleCharQuestion} from "../../../utils.js";
import {AccountState} from "../AccountState.js";
import {ProductService} from "../../../../features/catalog/ProductService.js";
import {AuthService} from "../../../../features/auth/AuthService.js";
import {SessionService} from "../../../../features/auth/SessionService.js";
import {ProductUpdateBuilder} from "../../../../features/catalog/ProductUpdateBuilder.js";
import {ProductCategoriesList} from "../../../../types/index.js";

export class AccountMyProductsEditState implements State {
  public static instance: AccountMyProductsEditState = new AccountMyProductsEditState();

  private productService: ProductService;
  private authService: AuthService;
  private sessionService: SessionService;
  private constructor() {
    this.productService = ProductService.instance;
    this.authService = AuthService.instance;
    this.sessionService = SessionService.instance;
  }

  async printAndRead(rl: Interface): Promise<State> {
    if (!this.sessionService.isLoggedIn()) {
      rl.write("You need to be logged in to edit your products\n");
      rl.write("Press anything to go back to the Account page.\n");
      await readChar();
      return AccountMyProductsState.instance;
    }

    const user = await this.authService.getUserById(this.sessionService.getSession()!.userId);
    if (!user) {
      rl.write("Could not get user information. Try logging out and logging back in\n");
      rl.write("Press anything to go back to the Account page.\n");
      await readChar();
      return AccountMyProductsState.instance;
    }

    if (user.role === "CUSTOMER") {
      rl.write("You cannot edit products as a customer\n");
      rl.write("Press anything to go back to the Account page.\n");
      await readChar();
      return AccountMyProductsState.instance;
    }

    rl.write("Edit products page:\n")

    const userProducts = await this.productService.getProductsByUser(user.id);
    if (userProducts.length === 0) {
      rl.write("You do not have any registered products.\n");
      rl.write("Start by creating new products in the Catalog.\n");
      rl.write("\nPress anything to go back to the Account page.\n");
      await readChar();
      return AccountState.instance;
    }

    const displayedProducts = userProducts.map((product, index) => {
      const { id, userId, ...productWithoutIds } = product;
      return {
        ...productWithoutIds,
        category: capitalize(product.category),
        index: index + 1
      }
    });
    consoleTable(displayedProducts, 'index');

    rl.write("\n\nEnter the product index to edit. Leave the field blank to cancel\n");
    let productIndex: number;
    while (true) {
      const rawProductIndex = await questionAsync(rl, "> ");
      if (rawProductIndex === "") {
        return AccountMyProductsState.instance;
      }

      productIndex = Number(rawProductIndex);
      if (!isNaN(productIndex) && Number.isInteger(productIndex) && productIndex > 0 && productIndex - 1 < userProducts.length) {
        break;
      }
      rl.write("Invalid product index provided.\n\n");
    }

    const product = userProducts[productIndex - 1]!;

    rl.write(`Editing '${product.name}'. Leave any field blank to keep the current value.\n\n`);
    rl.write("You will be prompted to verify the information at the end\n");

    const updateBuilder = new ProductUpdateBuilder(product.id);

    rl.write(`Current name: ${product.name}\n`);
    const name = await questionAsync(rl, "New name: ");
    if (name !== "") {
      updateBuilder.setName(name);
    }

    rl.write(`Current description: ${product.description}\n`);
    const description = await questionAsync(rl, "New description: ");
    if (description !== "") {
      updateBuilder.setDescription(description);
    }

    rl.write(`Current price: ${product.price}\n`);
    while (true) {
      const rawProductPrice = await questionAsync(rl, "New price: ");
      if (rawProductPrice === "") {
        break;
      }

      const price = Number(rawProductPrice);
      if (!isNaN(price) && price > 0.00) {
        updateBuilder.setPrice(price);
        break;
      }
      rl.write("Invalid product price provided.\n\n");
    }

    rl.write(`Current stock: ${product.stock}\n`);
    while (true) {
      const rawProductStock = await questionAsync(rl, "New stock: ");
      if (rawProductStock === "") {
        break;
      }

      const stock = Number(rawProductStock);
      if (!isNaN(stock) && Number.isInteger(stock) && stock > 0) {
        updateBuilder.setStock(stock);
        break;
      }
      rl.write("Invalid product stock provided.\n\n");
    }

    rl.write(`Current category: ${capitalize(product.category)}\n`);
    rl.write("Select the product's new category:\n\n");
    for (let i = 0; i < ProductCategoriesList.length; i++) {
      rl.write(`${i + 1} - ${capitalize(ProductCategoriesList[i]!)}\n`);
    }
    rl.write("0 - Don't change the product's category\n");

    while (true) {
      const choice = await singleCharQuestion(rl, "> ");
      if (choice === "0") {
        break;
      }
      const choiceIndex = Number(choice);
      if (!isNaN(choiceIndex) && Number.isInteger(choiceIndex) && choiceIndex - 1 < ProductCategoriesList.length) {
        updateBuilder.setCategory(ProductCategoriesList[choiceIndex - 1]!);
        break;
      }

      rl.write("\nInvalid category picked.\n");
    }

    rl.write(`\n\nAre you sure you want to update '${product.name}'? Press 'Y' to confirm or anything else to cancel.\n`);
    if ((await readChar()).toUpperCase() !== "Y") {
      return AccountMyProductsState.instance;
    }

    rl.write("\n");

    try {
      await this.productService.updateProduct(product.id, updateBuilder.build());
      rl.write(`'${product.name}' has been updated.\n`)
    } catch {
      rl.write(`'${product.name}' could not be updated.\n`)
    }

    rl.write("Press anything to go back to your products.\n");
    await readChar();
    return AccountMyProductsState.instance;
  }
}
import type {State} from "../../../State.js";
import type {Interface} from "node:readline";
import {AuthService} from "../../../../features/auth/AuthService.js";
import {capitalize, consoleTable, questionAsync, readChar} from "../../../utils.js";
import {
  AccountMyProductsEditState,
  AccountState,
  type Choice,
  defaultErrorMessage,
  promptForChoices
} from "../../index.js";
import {SessionService} from "../../../../features/auth/SessionService.js";
import {ProductService} from "../../../../features/catalog/ProductService.js";

export class AccountMyProductsState implements State {
  public static instance: AccountMyProductsState = new AccountMyProductsState();

  private isInvalidChoice = false;
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
      rl.write("You need to be logged in to manage your products\n");
      rl.write("Press anything to go back to the Account page.\n");
      await readChar();
      return AccountState.instance;
    }

    const user = await this.authService.getUserById(this.sessionService.getSession()!.userId);
    if (!user) {
      rl.write("Could not get user information. Try logging out and logging back in\n");
      rl.write("Press anything to go back to the Account page.\n");
      await readChar();
      return AccountState.instance;
    }

    if (user.role === "CUSTOMER") {
      rl.write("You cannot manage products as a customer\n");
      rl.write("Press anything to go back to the Account page.\n");
      await readChar();
      return AccountState.instance;
    }

    rl.write("My products page:\n")

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

    const choices: Choice[] = [
      {
        choiceCharacter: '1',
        description: 'Update product',
        state: AccountMyProductsEditState.instance
      },
      {
        choiceCharacter: '2',
        description: 'Delete product',
        state: AccountMyProductsState.instance
      },
      {
        choiceCharacter: '3',
        description: 'Back to account page',
        state: AccountState.instance
      },
    ];

    const newState = await promptForChoices(rl, choices, this.isInvalidChoice ? defaultErrorMessage: undefined);
    this.isInvalidChoice = newState === undefined;

    if (newState !== AccountMyProductsState.instance) {
      return newState ? newState : AccountMyProductsState.instance;
    }

    rl.write("\n\nEnter the product index to delete. Leave the field blank to cancel\n");
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

    rl.write(`\n\nAre you sure you want to delete '${product.name}'? Press 'Y' to confirm or anything else to cancel.\n`);
    if ((await readChar()).toUpperCase() !== "Y") {
      return AccountMyProductsState.instance;
    }

    rl.write("\n");
    try {
      await this.productService.deleteProduct(product.id);
      rl.write(`'${product.name}' has been deleted.\n`)
    } catch {
      rl.write(`'${product.name}' could not be deleted.\n`)
    }

    rl.write("Press anything to go back to your products.\n");
    await readChar();
    return AccountMyProductsState.instance;
  }
}
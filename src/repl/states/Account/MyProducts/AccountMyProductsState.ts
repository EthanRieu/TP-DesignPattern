import type {State} from "../../../State.js";
import type {Interface} from "node:readline";
import {AuthService} from "../../../../features/auth/AuthService.js";
import {ProductService} from "../../../../features/catalog/ProductService.js";
import {consoleTable, readChar} from "../../../utils.js";
import {
  AccountMyProductsEditState,
  AccountState,
  type Choice,
  defaultErrorMessage,
  promptForChoices
} from "../../index.js";
import {SessionService} from "../../../../features/auth/SessionService.js";
import {AccountMyProductsDeleteState, AccountMyProductsGetState} from "./index.js"

export class AccountMyProductsState implements State {
  public static instance: AccountMyProductsState = new AccountMyProductsState();

  private isInvalidChoice = false;
  private authService: AuthService;
  private sessionService: SessionService;
  private productService: ProductService;
  
  private constructor() {
    this.authService = AuthService.instance;
    this.sessionService = SessionService.instance;
    this.productService = ProductService.instance;
  }

  async printAndRead(rl: Interface): Promise<State> {
    if (!this.sessionService.isLoggedIn()) {
      rl.write("You need to be logged in before accessing your products.\n\n");
      rl.write("Press anything to go back to the Account page.\n");
      await readChar();
      return AccountState.instance;
    }

    rl.write("My products page:\n");

    const session = this.sessionService.getSession();
    if (!session) {
      rl.write("Error: Could not retrieve session.\n\n");
      rl.write("Press anything to go back to the Account page.\n");
      await readChar();
      return AccountState.instance;
    }

    // Récupérer les produits de l'utilisateur connecté
    const userProducts = await this.productService.getUserProducts(session.userId);
    
    if (userProducts.length === 0) {
      rl.write("\n📦 You have no products yet.\n\n");
      rl.write("Press anything to go back to the Account page.\n");
      await readChar();
      return AccountState.instance;
    }

    // Formater pour l'affichage
    const products = userProducts.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      stock: p.stock,
      category: p.category
    }));

    consoleTable(products, "id");

    const choices: Choice[] = [
      {
        choiceCharacter: '1',
        description: 'Get product details',
        state: AccountMyProductsGetState.instance
      },
      {
        choiceCharacter: '2',
        description: 'Edit product',
        state: AccountMyProductsEditState.instance
      },
      {
        choiceCharacter: '3',
        description: 'Delete product',
        state: AccountMyProductsDeleteState.instance
      },
      {
        choiceCharacter: '4',
        description: 'Back to account page',
        state: AccountState.instance
      },
    ];

    const newState = await promptForChoices(rl, choices, this.isInvalidChoice ? defaultErrorMessage: undefined);
    this.isInvalidChoice = newState === undefined;
    return newState ? newState : AccountMyProductsState.instance;
  }
}
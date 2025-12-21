import type {State} from "../../State.js";
import type {Interface} from "node:readline";
import {capitalize, consoleTable, questionAsync, readChar} from "../../utils.js";
import {HomeState} from "../HomeState.js";
import {ProductService} from "../../../features/catalog/ProductService.js";
import {type Choice, defaultErrorMessage, promptForChoices} from "../utils.js";
import type {ProductCategory} from "../../../types/index.js";
import type {Product} from "@prisma/client";
import {CatalogFilterState} from "./CatalogFilterState.js";
import {CatalogCreateProductState} from "./CatalogCreateProductState.js";
import {mapProductsToDisplayedProducts} from "./utils.js";
import {AuthService} from "../../../features/auth/AuthService.js";

export class CatalogState implements State {
  public static instance: CatalogState = new CatalogState();

  private filter: ProductCategory | undefined;
  private isInvalidChoice = false;
  private authService: AuthService;
  private productService: ProductService;
  private constructor() {
    this.productService = ProductService.instance;
    this.authService = AuthService.instance;
  }

  async printAndRead(rl: Interface): Promise<State> {
    let products: Product[];
    if (this.filter) {
      products = await this.productService.getFilteredProducts(this.filter);
    }
    else {
      products = await this.productService.getAllProducts();
    }

    const filterText = this.filter ? ` (only ${this.filter.toString()} products)` : "";

    rl.write(`Products list:${filterText}\n`);

    const displayedProducts = await mapProductsToDisplayedProducts(products, this.authService);
    consoleTable(displayedProducts, "index");

    const choices: Choice[] = [
      {
        choiceCharacter: '1',
        description: 'Filter products',
        state: CatalogFilterState.instance
      },
      {
        choiceCharacter: '2',
        description: 'Create a product',
        state: CatalogCreateProductState.instance
      },
      {
        choiceCharacter: '3',
        description: 'Add product to cart',
        state: CatalogState.instance,
      },
      {
        choiceCharacter: '4',
        description: 'Return to home page',
        state: HomeState.instance
      },
    ];

    const newState = await promptForChoices(rl, choices, this.isInvalidChoice ? defaultErrorMessage: undefined);
    this.isInvalidChoice = newState === undefined;

    if (newState !== CatalogState.instance) {
      return newState ? newState : CatalogState.instance;
    }

    rl.write("\n\nEnter the product index to add to the cart. Leave the field blank to cancel\n");
    let productIndex: number;
    while (true) {
      const rawProductIndex = await questionAsync(rl, "> ");
      if (rawProductIndex === "") {
        return CatalogState.instance;
      }

      productIndex = Number(rawProductIndex);
      if (!isNaN(productIndex) && Number.isInteger(productIndex) && productIndex > 0 && productIndex - 1 < products.length) {
        break;
      }
      rl.write("Invalid product index provided.\n\n");
    }

    const product = products[productIndex - 1]!;

    rl.write("\n\nEnter the quantity wanted. Leave the field blank to cancel\n");
    let productQty: number;
    while (true) {
      const rawProductQty = await questionAsync(rl, "> ");
      if (rawProductQty === "") {
        return CatalogState.instance;
      }

      productQty = Number(rawProductQty);
      if (!isNaN(productQty) && Number.isInteger(productQty) && productQty > 0 && productQty <= product.stock) {
        break;
      }
      rl.write("Invalid product quantity provided.\n\n");
    }

    rl.write(`${productQty} '${product.name}' ${productQty === 1 ? "has": "have"} been added to your cart.\n`)
    rl.write("Press anything to continue shopping.\n");

    rl.write("\n\nTODO: actually add the product(s) to the cart.\n");
    await readChar();
    return CatalogState.instance;
  }

  setFilter(filter?: ProductCategory) {
    this.filter = filter;
  }
}
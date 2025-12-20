import type {State} from "../../State.js";
import type {Interface} from "node:readline";
import {capitalize, consoleTable} from "../../utils.js";
import {ProductService} from "../../../features/catalog/ProductService.js";
import {type Choice, defaultErrorMessage, promptForChoices} from "../utils.js";
import {ProductCategoriesList} from "../../../types/index.js";
import {CatalogState} from "./CatalogState.js";

export class CatalogFilterState implements State {
  public static instance: CatalogFilterState = new CatalogFilterState();

  private isInvalidChoice = false;
  private productService: ProductService;
  private constructor() {
    this.productService = ProductService.instance;
  }

  async printAndRead(rl: Interface): Promise<State> {
    const products = await this.productService.getAllProducts();

    rl.write("Products list:\n");

    consoleTable(products.map((product, index) => {
      const { id, ...productWithoutId } = product;
      return {
        ...productWithoutId,
        category: capitalize(product.category),
        index: index + 1,
      }
    }), "index");

    rl.write("Filter by category:\n");
    const choices: Choice[] = ProductCategoriesList.map((category, index) => {
      return {
        choiceCharacter: `${index + 1}`,
        state: CatalogState.instance,
        description: capitalize(category),
        callback: () => {
          CatalogState.instance.setFilter(category);
        }
      }
    });
    choices.push({
      choiceCharacter: `0`,
      state: CatalogState.instance,
      description: "Reset the filter",
      callback: () => {
        CatalogState.instance.setFilter();
      }
    })

    const newState = await promptForChoices(rl, choices, this.isInvalidChoice ? defaultErrorMessage: undefined);
    this.isInvalidChoice = newState === undefined;
    return newState ? newState : CatalogFilterState.instance;
  }
}
import type {State} from "../../State.js";
import type {Interface} from "node:readline";
import {capitalize, questionAsync, readChar, singleCharQuestion} from "../../utils.js";
import {SessionService} from "../../../features/auth/SessionService.js";
import {CatalogState} from "./CatalogState.js";
import {AuthService} from "../../../features/auth/AuthService.js";
import {ProductCategoriesList, type ProductCategory} from "../../../types/index.js";
import {
  ClothingFactory,
  ElectronicsFactory,
  FoodFactory,
  type IProductFactory
} from "../../../features/catalog/ProductFactory.js";

export class CatalogCreateProductState implements State {
  public static instance: CatalogCreateProductState = new CatalogCreateProductState();

  private authService: AuthService;
  private sessionService: SessionService;
  private constructor() {
    this.authService = AuthService.instance;
    this.sessionService = SessionService.instance;
  }

  async printAndRead(rl: Interface): Promise<State> {
    if (!this.sessionService.isLoggedIn()) {
      rl.write("You need to be logged in to create a product\n");
      rl.write("Press anything to go back to the Catalog.\n");
      await readChar();
      return CatalogState.instance;
    }

    const user = await this.authService.getUserById(this.sessionService.getSession()!.userId);
    if (!user) {
      rl.write("Could not get user information. Try logging out and logging back in\n");
      rl.write("Press anything to go back to the Catalog.\n");
      await readChar();
      return CatalogState.instance;
    }

    if (user.role === "CUSTOMER") {
      rl.write("You cannot create products as a customer\n");
      rl.write("Press anything to go back to the Catalog.\n");
      await readChar();
      return CatalogState.instance;
    }

    rl.write(`Creating a product. Leave any field blank to go back.\n\n`);

    const name = await questionAsync(rl, "Name: ");
    if (name === "") {
      return CatalogState.instance;
    }

    const description = await questionAsync(rl, "Description: ");
    if (description === "") {
      return CatalogState.instance;
    }

    let price: number
    while (true) {
      const rawProductPrice = await questionAsync(rl, "Price: ");
      if (rawProductPrice === "") {
        return CatalogState.instance;
      }

      price = Number(rawProductPrice);
      if (!isNaN(price) && price > 0.00) {
        break;
      }
      rl.write("Invalid product price provided.\n\n");
    }

    let stock: number
    while (true) {
      const rawProductStock = await questionAsync(rl, "Stock: ");
      if (rawProductStock === "") {
        return CatalogState.instance;
      }

      stock = Number(rawProductStock);
      if (!isNaN(stock) && Number.isInteger(stock) && stock > 0) {
        break;
      }
      rl.write("Invalid product stock provided.\n\n");
    }

    rl.write("Select the product's category:\n\n")
    for (let i = 0; i < ProductCategoriesList.length; i++) {
      rl.write(`${i + 1} - ${capitalize(ProductCategoriesList[i]!)}\n`);
    }
    rl.write("0 - Cancel product creation\n");

    let category: ProductCategory;
    while (true) {
      const choice = await singleCharQuestion(rl, "> ");
      if (choice === "0") {
        return CatalogState.instance;
      }
      const choiceIndex = Number(choice);
      if (!isNaN(choiceIndex) && Number.isInteger(choiceIndex) && choiceIndex - 1 < ProductCategoriesList.length) {
        category = ProductCategoriesList[choiceIndex - 1]!;
        break;
      }

      rl.write("\nInvalid category picked.\n");
    }

    let factory: IProductFactory

    switch (category) {
      case "ELECTRONICS":
        factory = ElectronicsFactory.instance
        break;
      case "CLOTHING":
        factory = ClothingFactory.instance
        break;
      case "FOOD":
        factory = FoodFactory.instance
        break;
    }

    rl.write("\n");

    try {
      const result = await factory.createProduct(name, description, price, stock, user.id);
      rl.write("Product successfully created!\n");
    }
    catch (error) {
      rl.write(`Error during product creation: ${error}\n`);
    }

    rl.write("Press anything to go back to the Catalog.\n");
    await readChar();
    return CatalogState.instance;
  }
}
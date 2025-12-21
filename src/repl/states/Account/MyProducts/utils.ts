import {questionAsync} from "../../../utils.js";
import type {Interface} from "node:readline";
import type {IOrder} from "../../../../types/index.js";

export async function getProductByIdOrCancelAsync(rl: Interface): Promise<IOrder | false> {
  rl.write("Provide the product ID to continue. Leave the field blank to go back.\n\n")

  let productId: string;
  while (true) {
    productId = await questionAsync(rl, "Product ID: ");
    if (productId === "") {
      return false;
    }

    if (true) {
      rl.write("TODO: validate and get product by ID\n")
      // return the product
      return false;
    }

    rl.write("Invalid product ID provided.\n\n");
  }
}
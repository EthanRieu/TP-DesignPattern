import {questionAsync} from "../../../utils.js";
import type {Interface} from "node:readline";
import type {Product} from "@prisma/client";
import {ProductService} from "../../../../features/catalog/ProductService.js";

export async function getProductByIdOrCancelAsync(rl: Interface): Promise<Product | false> {
  rl.write("Provide the product ID to continue. Leave the field blank to go back.\n\n");
  
  const productService = ProductService.instance;

  let productId: string;
  while (true) {
    productId = await questionAsync(rl, "Product ID: ");
    if (productId === "") {
      return false;
    }

    // Valider et récupérer le produit par ID
    try {
      const product = await productService.getProductById(productId.trim());
      
      if (product) {
        return product;
      } else {
        rl.write("❌ Product not found. Please try again.\n\n");
      }
    } catch (error) {
      rl.write(`❌ Error: ${error instanceof Error ? error.message : String(error)}\n\n`);
    }
  }
}
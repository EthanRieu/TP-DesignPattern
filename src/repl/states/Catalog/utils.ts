import type {Product} from "@prisma/client";
import {capitalize} from "../../utils.js";
import type {AuthService} from "../../../features/auth/AuthService.js";

export async function mapProductsToDisplayedProducts(products: Product[], authService: AuthService) {
  const promises = products.map(async (product, index) => {
    const { id, userId, ...productWithoutId } = product;
    let seller: string;
    try {
      const user = await authService.getUserById(userId);
      seller = user ? user.name : "Unknown";
    } catch {
      seller = "Unknown";
    }

    return {
      ...productWithoutId,
      category: capitalize(product.category),
      index: index + 1,
      seller
    }
  });

  return await Promise.all(promises);
}
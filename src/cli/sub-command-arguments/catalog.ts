import type { ProductCategory } from '../../types/index.js';
import type { SubCommandArguments } from "./sub-command-arguments.js";
import type {
  ArgumentConfig,
  OptionalPropertyOptions,
} from 'ts-command-line-args';

export interface GetProductsArguments extends SubCommandArguments {}

export const GetProductsArgumentsConfig = {};

export interface GetProductByIdArguments extends SubCommandArguments {
  id: string;
}

export const GetProductByIdArgumentsConfig = {
  id: String,
};

export interface GetFilteredProductsArguments extends SubCommandArguments {
  category: ProductCategory;
}

export const GetFilteredProductsArgumentsConfig = {
  category: { type: parseProductCategory, optional: false as const },
};

export interface CreateProductArguments extends SubCommandArguments {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: ProductCategory;
}

export const CreateProductArgumentsConfig = {
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: { type: parseProductCategory, optional: false as const },
};

export interface UpdateProductArguments extends SubCommandArguments {
  id: string;
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  category?: ProductCategory;
}

function parseProductCategory(value: string): ProductCategory {
  if (value === 'FOOD' || value === 'ELECTRONICS' || value === 'CLOTHING') {
    return value as ProductCategory;
  }
  throw new Error(
    `Invalid category: ${value}. Must be one of: FOOD, ELECTRONICS, CLOTHING`,
  );
}

export const UpdateProductArgumentsConfig = {
  id: { type: String, optional: false as const },
  name: { type: String, optional: true as const },
  description: { type: String, optional: true as const },
  price: { type: Number, optional: true as const },
  stock: { type: Number, optional: true as const },
  category: { type: parseProductCategory, optional: true as const },
};

export interface DeleteProductArguments extends SubCommandArguments {
  id: string;
}

export const DeleteProductArgumentsConfig = {
  id: String,
};

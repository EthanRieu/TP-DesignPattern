import type {IProductUpdate, ProductCategory} from "../../types/index.js";

export class ProductUpdateBuilder {
  private readonly productUpdate: IProductUpdate;
  constructor(private readonly productId: string) {
    this.productUpdate = { id: productId };
  }

  setName(name: string): this {
    this.productUpdate.name = name;
    return this;
  }

  setDescription(description: string): this {
    this.productUpdate.description = description;
    return this;
  }

  setPrice(price: number): this {
    this.productUpdate.price = price;
    return this;
  }

  setStock(stock: number): this {
    this.productUpdate.stock = stock;
    return this;
  }

  setCategory(category: ProductCategory): this {
    this.productUpdate.category = category;
    return this;
  }

  build(): IProductUpdate {
    return this.productUpdate;
  }
}
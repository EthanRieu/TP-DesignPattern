import type { Product } from "@prisma/client";
import { ProductService } from "./ProductService.js";

export interface IProductFactory {
    createProduct(name: string, description: string, price: number, stock: number): Promise<Product>;
}

export class ElectronicsFactory implements IProductFactory {
    private productService = ProductService.instance;

    public async createProduct(name: string, description: string, price: number, stock: number): Promise<Product> {
        return this.productService.createProduct({
            name,
            description,
            price,
            stock,
            category: 'ELECTRONICS'
        });
    }
}

export class ClothingFactory implements IProductFactory {
    private productService = ProductService.instance;

    public async createProduct(name: string, description: string, price: number, stock: number): Promise<Product> {
        return this.productService.createProduct({
            name,
            description,
            price,
            stock,
            category: 'CLOTHING'
        });
    }
}

export class FoodFactory implements IProductFactory {
    private productService = ProductService.instance;

    public async createProduct(name: string, description: string, price: number, stock: number): Promise<Product> {
        return this.productService.createProduct({
            name,
            description,
            price,
            stock,
            category: 'FOOD'
        });
    }
}
import type { Product } from "@prisma/client";
import { ProductService } from "./ProductService.js";

export interface IProductFactory {
    createProduct(name: string, description: string, price: number, stock: number, userId: string): Promise<Product>;
}

export class ElectronicsFactory implements IProductFactory {
    public static instance = new ElectronicsFactory();
    private constructor() {}

    private productService = ProductService.instance;

    public async createProduct(name: string, description: string, price: number, stock: number, userId: string): Promise<Product> {
        return this.productService.createProduct({
            name,
            description,
            price,
            stock,
            category: 'ELECTRONICS',
            userId
        });
    }
}

export class ClothingFactory implements IProductFactory {
    public static instance = new ClothingFactory();
    private constructor() {}

    private productService = ProductService.instance;

    public async createProduct(name: string, description: string, price: number, stock: number, userId: string): Promise<Product> {
        return this.productService.createProduct({
            name,
            description,
            price,
            stock,
            category: 'CLOTHING',
            userId
        });
    }
}

export class FoodFactory implements IProductFactory {
    public static instance = new FoodFactory();
    private constructor() {}

    private productService = ProductService.instance;

    public async createProduct(name: string, description: string, price: number, stock: number, userId: string): Promise<Product> {
        return this.productService.createProduct({
            name,
            description,
            price,
            stock,
            category: 'FOOD',
            userId
        });
    }
}
import type { Product } from "@prisma/client";
import type { ProductCategory } from "../../types/index.js";
import { PrismaClientSingleton } from "../../prisma/client.js";
import type { IProductCreate } from "../../types/index.js";

export class ProductService {
    private static singleInstance: ProductService | null = null;

    public static get instance(): ProductService {
        if (!ProductService.singleInstance) {
            ProductService.singleInstance = new ProductService();
        }
        return ProductService.singleInstance;
    }

    private constructor() {}

    public async createProduct(productData: IProductCreate): Promise<Product> {
        const prisma = PrismaClientSingleton.getInstance();
        const product = await prisma.product.create({
            data: productData,
        });
        console.log(`✅ ProductService: Created product ${product.name}`);
        return product;
    }

    public async getProductById(id: string): Promise<Product | null> {
        const prisma = PrismaClientSingleton.getInstance();
        return await prisma.product.findUnique({
            where: { id },
        });
    }

    public async getAllProducts(): Promise<Product[]> {
        const prisma = PrismaClientSingleton.getInstance();
        return await prisma.product.findMany();
    }

    public async getFilteredProducts(category: ProductCategory): Promise<Product[]> {
        const prisma = PrismaClientSingleton.getInstance();
        return await prisma.product.findMany({
            where: { category },
        });
    }

    public async updateProduct(id: string, data: Partial<IProductCreate>): Promise<Product> {
        const prisma = PrismaClientSingleton.getInstance();
        const product = await prisma.product.update({
            where: { id },
            data,
        });
        console.log(`✅ ProductService: Updated product ${product.name}`);
        return product;
    }

    public async deleteProduct(id: string): Promise<Product> {
        const prisma = PrismaClientSingleton.getInstance();
        const product = await prisma.product.delete({
            where: { id },
        });
        console.log(`✅ ProductService: Deleted product ${product.name}`);
        return product;
    }
}

import { configDotenv } from "dotenv";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from '@prisma/client';

configDotenv();

export class PrismaClientSingleton {
  private static instance: PrismaClient | null = null;

  private constructor() {}

  public static getInstance(): PrismaClient {
    if (!PrismaClientSingleton.instance) {
      const sqliteAdapter = new PrismaBetterSqlite3({
        url: process.env.DATABASE_URL,
      });

      PrismaClientSingleton.instance = new PrismaClient({
        log: ['query', 'info', 'warn', 'error'],
        adapter: sqliteAdapter,
      });
      console.log('✅ PrismaClientSingleton instance created');
    }
    return PrismaClientSingleton.instance;
  }

  public static async disconnect(): Promise<void> {
    if (PrismaClientSingleton.instance) {
      await PrismaClientSingleton.instance.$disconnect();
      PrismaClientSingleton.instance = null;
      console.log('🔌 PrismaClientSingleton instance disconnected');
    }
  }
}

export default PrismaClientSingleton.getInstance();

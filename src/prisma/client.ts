import { PrismaClient } from '@prisma/client';

export class PrismaClientSingleton {
  private static instance: PrismaClient | null = null;

  private constructor() {}

  public static getInstance(): PrismaClient {
    if (!PrismaClientSingleton.instance) {
      PrismaClientSingleton.instance = new PrismaClient({
        log: ['query', 'info', 'warn', 'error'],
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

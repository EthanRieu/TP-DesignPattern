import type { User } from '@prisma/client';
import { PrismaClientSingleton } from '../../prisma/client.js';

export class AuthService {
  private static instance: AuthService | null = null;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
      console.log('✅ AuthService instance created');
    }
    return AuthService.instance;
  }

  public static async getUsers(): Promise<User[]> {
    const prisma = PrismaClientSingleton.getInstance();
    return prisma.user.findMany();
  }

  public static async getUserById(id: string): Promise<User | null> {
    const prisma = PrismaClientSingleton.getInstance();
    return prisma.user.findUnique({
      where: { id },
    });
  }

  public static async getUserByEmail(email: string): Promise<User | null> {
    const prisma = PrismaClientSingleton.getInstance();
    return prisma.user.findUnique({
      where: { email },
    });
  }
}

import type { User } from '@prisma/client';
import { PrismaClientSingleton } from '../../prisma/client.js';
import type { IUser, IUserCreate } from '../../types/index.js';
import * as bcrypt from 'bcrypt';

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

  public static async createUser(user: IUserCreate): Promise<User> {
    const prisma = PrismaClientSingleton.getInstance();
    try {
      const newUser = await prisma.user.create({
        data: user,
      });
      console.log(`✅ User ${user.email} created successfully`);
      return newUser;
    } catch (error) {
      console.error(`❌ Error creating user:`, error);
      throw error;
    }
  }

  public static async updateUser(user: IUser): Promise<User> {
    const prisma = PrismaClientSingleton.getInstance();
    try {
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: user,
      });
      console.log(`✅ User ${user.email} updated successfully`);
      return updatedUser;
    } catch (error) {
      console.error(`❌ Error updating user:`, error);
      throw error;
    }
  }

  public static async deleteUser(id: string): Promise<void> {
    const prisma = PrismaClientSingleton.getInstance();
    try {
      await prisma.user.delete({
        where: { id },
      });
      console.log(`✅ User ${id} deleted successfully`);
    } catch (error) {
      console.error(`❌ Error deleting user ${id}:`, error);
      throw error;
    }
  }

  public static async login(email: string, password: string): Promise<User | null> {
    const prisma = PrismaClientSingleton.getInstance();
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return null;
    }
    if (!await bcrypt.compare(password, user.password)) {
      throw new Error('Invalid password');
    }
    console.log(`✅ User ${user.email} logged in successfully`);
    return user;
  }
}

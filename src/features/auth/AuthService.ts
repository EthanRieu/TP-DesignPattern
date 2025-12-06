import type { User } from '@prisma/client';
import { PrismaClientSingleton } from '../../prisma/client.js';
import type { IUser, IUserCreate, IUserUpdate } from '../../types/index.js';
import * as bcrypt from 'bcrypt';
import { SessionService } from './SessionService.js';

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
      const hashedPassword = await bcrypt.hash(user.password, 10);

      const userWithHashedPassword = {
        ...user,
        password: hashedPassword,
      };

      const newUser = await prisma.user.create({
        data: userWithHashedPassword,
      });
      console.log(`✅ User ${user.email} created successfully`);
      return newUser;
    } catch (error) {
      console.error(`❌ Error creating user:`, error);
      throw error;
    }
  }

  public static async updateUser(userUpdate: IUserUpdate): Promise<User> {
    const prisma = PrismaClientSingleton.getInstance();
    try {
      // Récupérer l'utilisateur existant
      const existingUser = await prisma.user.findUnique({
        where: { id: userUpdate.id },
      });

      if (!existingUser) {
        throw new Error(`User with id ${userUpdate.id} not found`);
      }

      // Construire l'objet de mise à jour avec seulement les champs fournis
      const updateData: Partial<IUser> = {};

      if (userUpdate.email !== undefined) {
        updateData.email = userUpdate.email;
      }
      if (userUpdate.name !== undefined) {
        updateData.name = userUpdate.name;
      }
      if (userUpdate.password !== undefined) {
        // Hasher le mot de passe si fourni
        updateData.password = await bcrypt.hash(userUpdate.password, 10);
      }
      if (userUpdate.role !== undefined) {
        updateData.role = userUpdate.role;
      }

      const updatedUser = await prisma.user.update({
        where: { id: userUpdate.id },
        data: updateData,
      });
      console.log(`✅ User ${updatedUser.email} updated successfully`);
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

  public static async login(
    email: string,
    password: string,
  ): Promise<User | null> {
    const prisma = PrismaClientSingleton.getInstance();
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return null;
    }
    if (!(await bcrypt.compare(password, user.password))) {
      throw new Error('Invalid password');
    }
    // Sauvegarder la session
    SessionService.saveSession(user.email, user.id);
    console.log(`✅ User ${user.email} logged in successfully`);
    return user;
  }

  public static async logout(email: string): Promise<void> {
    const session = SessionService.getSession();
    if (!session) {
      throw new Error('No active session found');
    }
    if (session.email !== email) {
      throw new Error('Session email does not match');
    }
    // Supprimer la session
    SessionService.deleteSession();
    console.log(`✅ User ${email} logged out successfully`);
  }
}

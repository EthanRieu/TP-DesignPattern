import type { User } from '@prisma/client';
import { PrismaClientSingleton } from '../../prisma/client.js';
import type { IUser, IUserCreate, IUserUpdate } from '../../types/index.js';
import * as bcrypt from 'bcrypt';
import { SessionService } from './SessionService.js';
import { UserFactory } from './UserFactory.js';
import { AppLogger } from "../../AppLogger.js";

export class AuthService {
  private static singleInstance: AuthService | null = null;
  public static get instance(): AuthService {
    if (!AuthService.singleInstance) {
      AuthService.singleInstance = new AuthService();
      AppLogger.debug('✅ AuthService instance created');
    }
    return AuthService.singleInstance;
  }

  private sessionService: SessionService;

  private constructor() {
    this.sessionService = SessionService.instance;
  }

  public async getUsers(): Promise<User[]> {
    const prisma = PrismaClientSingleton.getInstance();
    return prisma.user.findMany();
  }

  public async getUserById(id: string): Promise<User | null> {
    const prisma = PrismaClientSingleton.getInstance();
    return prisma.user.findUnique({
      where: { id },
    });
  }

  public async createUser(user: IUserCreate): Promise<User> {
    try {
      return await UserFactory.createUser(user);
    } catch (error) {
      AppLogger.error(`❌ Error creating user:`, error);
      throw error;
    }
  }

  public async updateUser(userUpdate: IUserUpdate): Promise<User> {
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
      AppLogger.info(`✅ User ${updatedUser.email} updated successfully`);
      return updatedUser;
    } catch (error) {
      AppLogger.error(`❌ Error updating user:`, error);
      throw error;
    }
  }

  public async deleteUser(id: string): Promise<void> {
    const prisma = PrismaClientSingleton.getInstance();
    try {
      await prisma.user.delete({
        where: { id },
      });
      AppLogger.info(`✅ User ${id} deleted successfully`);
    } catch (error) {
      AppLogger.error(`❌ Error deleting user ${id}:`, error);
      throw error;
    }
  }

  public async login(
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
    this.sessionService.saveSession(user.email, user.id);
    AppLogger.info(`✅ User ${user.email} logged in successfully`);
    return user;
  }

  public async logout(email: string): Promise<void> {
    const session = this.sessionService.getSession();
    if (!session) {
      throw new Error('No active session found');
    }
    if (session.email !== email) {
      throw new Error('Session email does not match');
    }
    // Supprimer la session
    this.sessionService.deleteSession();
    AppLogger.info(`✅ User ${email} logged out successfully`);
  }
}

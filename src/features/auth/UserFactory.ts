import type { User } from '@prisma/client';
import { PrismaClientSingleton } from '../../prisma/client.js';
import type { IUserCreate, UserRole } from '../../types/index.js';
import * as bcrypt from 'bcrypt';
import { AppLogger } from "../../AppLogger.js";

/**
 * Interface abstraite pour la Factory Method
 * Définit le contrat pour la création d'utilisateurs
 */
export interface IUserFactory {
  createUser(userData: IUserCreate): Promise<User>;
}

/**
 * Factory concrète pour créer des utilisateurs CUSTOMER
 */
export class CustomerFactory implements IUserFactory {
  public async createUser(userData: IUserCreate): Promise<User> {
    const prisma = PrismaClientSingleton.getInstance();
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const userWithHashedPassword = {
      ...userData,
      password: hashedPassword,
    };

    const newUser = await prisma.user.create({
      data: userWithHashedPassword,
    });
    AppLogger.info(`✅ Customer ${userData.email} created successfully`);
    return newUser;
  }
}

/**
 * Factory concrète pour créer des utilisateurs SELLER
 */
export class SellerFactory implements IUserFactory {
  public async createUser(userData: IUserCreate): Promise<User> {
    const prisma = PrismaClientSingleton.getInstance();
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const userWithHashedPassword = {
      ...userData,
      password: hashedPassword,
    };

    const newUser = await prisma.user.create({
      data: userWithHashedPassword,
    });
    AppLogger.info(`✅ Seller ${userData.email} created successfully`);
    return newUser;
  }
}

/**
 * Factory concrète pour créer des utilisateurs ADMIN
 */
export class AdminFactory implements IUserFactory {
  public async createUser(userData: IUserCreate): Promise<User> {
    const prisma = PrismaClientSingleton.getInstance();
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const userWithHashedPassword = {
      ...userData,
      password: hashedPassword,
    };

    const newUser = await prisma.user.create({
      data: userWithHashedPassword,
    });
    AppLogger.info(`✅ Admin ${userData.email} created successfully`);
    return newUser;
  }
}

/**
 * Factory principale qui utilise le pattern Factory Method
 * Sélectionne la factory appropriée selon le rôle de l'utilisateur
 */
export class UserFactory {
  /**
   * Méthode factory qui crée la factory appropriée selon le rôle
   */
  private static getFactory(role: UserRole): IUserFactory {
    switch (role) {
      case 'CUSTOMER':
        return new CustomerFactory();
      case 'SELLER':
        return new SellerFactory();
      case 'ADMIN':
        return new AdminFactory();
      default:
        throw new Error(`Unknown user role: ${role}`);
    }
  }

  /**
   * Méthode publique pour créer un utilisateur
   * Utilise la factory appropriée selon le rôle
   */
  public static async createUser(userData: IUserCreate): Promise<User> {
    const factory = UserFactory.getFactory(userData.role);
    return factory.createUser(userData);
  }
}

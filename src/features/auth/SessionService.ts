import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Logger } from "winston";
import { AppLogger } from "../../AppLogger.js";
import type { ICart } from "../../types/CartTypes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SESSION_FILE = path.join(__dirname, '../../../.session');

export interface SessionData {
  email: string;
  userId: string;
  loggedInAt: string;
  cart?: ICart;
}

export class SessionService {
  private static singleInstance: SessionService | null = null;
  private constructor() {}

  public static get instance(): SessionService {
    if (!SessionService.singleInstance) {
      SessionService.singleInstance = new SessionService();
      AppLogger.debug('✅ SessionService instance created');
    }
    return SessionService.singleInstance;
  }

  public saveSession(email: string, userId: string): void {
    const sessionData: SessionData = {
      email,
      userId,
      loggedInAt: new Date().toISOString(),
    };
    fs.writeFileSync(SESSION_FILE, JSON.stringify(sessionData, null, 2));
  }

  public getSession(): SessionData | null {
    try {
      if (fs.existsSync(SESSION_FILE)) {
        const data = fs.readFileSync(SESSION_FILE, 'utf-8');
        return JSON.parse(data) as SessionData;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  public deleteSession(): void {
    try {
      if (fs.existsSync(SESSION_FILE)) {
        fs.unlinkSync(SESSION_FILE);
      }
    } catch (error) {
      // Ignore errors if file doesn't exist
    }
  }

  public isLoggedIn(): boolean {
    return this.getSession() !== null;
  }

  public updateCart(cart: ICart): void {
    const session = this.getSession();
    if (!session) {
      throw new Error('No active session. User must be logged in to update cart.');
    }
    session.cart = cart;
    fs.writeFileSync(SESSION_FILE, JSON.stringify(session, null, 2));
    AppLogger.debug('✅ Cart updated in session');
  }

  public getCart(): ICart | null {
    const session = this.getSession();
    return session?.cart ?? null;
  }

  public clearCart(): void {
    const session = this.getSession();
    if (session) {
      delete session.cart;
      fs.writeFileSync(SESSION_FILE, JSON.stringify(session, null, 2));
      AppLogger.debug('✅ Cart cleared from session');
    }
  }
}


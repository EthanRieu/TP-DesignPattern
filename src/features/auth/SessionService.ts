import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SESSION_FILE = path.join(__dirname, '../../../.session');

export interface SessionData {
  email: string;
  userId: string;
  loggedInAt: string;
}

export class SessionService {
  private static singleInstance: SessionService | null = null;

  public static get instance(): SessionService {
    if (!SessionService.singleInstance) {
      SessionService.singleInstance = new SessionService();
      console.log('✅ SessionService instance created');
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
}


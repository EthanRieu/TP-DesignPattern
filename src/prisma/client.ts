import { configDotenv } from "dotenv";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { Prisma, PrismaClient } from '@prisma/client';
import { AppLogger } from "../AppLogger.js";

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
        log: [
          {
            level: "query",
            emit: "event",
          },
          {
            level: "info",
            emit: "event",
          },
          {
            level: "warn",
            emit: "event",
          },
          {
            level: "error",
            emit: "event",
          },
        ],
        adapter: sqliteAdapter,
      });
      PrismaClientSingleton.instance.$on('query' as never, (e: Prisma.QueryEvent) => {this.eventFileLogger(e, "query")});
      PrismaClientSingleton.instance.$on('info' as never, (e: Prisma.QueryEvent) => {this.eventFileLogger(e, "info")});
      PrismaClientSingleton.instance.$on('warn' as never, (e: Prisma.QueryEvent) => {this.eventFileLogger(e, "warn")});
      PrismaClientSingleton.instance.$on('error' as never, (e: Prisma.QueryEvent) => {this.eventFileLogger(e, "error")});

      AppLogger.info("✅ PrismaClientSingleton instance created");
    }
    return PrismaClientSingleton.instance;
  }

  public static async disconnect(): Promise<void> {
    if (PrismaClientSingleton.instance) {
      await PrismaClientSingleton.instance.$disconnect();
      PrismaClientSingleton.instance = null;
      AppLogger.info('🔌 PrismaClientSingleton instance disconnected');
    }
  }

  private static eventFileLogger(event: Prisma.LogEvent | Prisma.QueryEvent, eventType: "query" | "info" | "warn" | "error") {
    if (eventType === "query") {
      const queryEvent = event as Prisma.QueryEvent;

      AppLogger.log("debug", `QUERY:
      ${queryEvent.query}
      PARAMS: ${queryEvent.params}
      TARGET: ${queryEvent.target}
      DURATION: ${queryEvent.duration}`);
      return;
    }

    const logEvent = event as Prisma.LogEvent;
    AppLogger.log(eventType, `${logEvent.message} - TARGET: ${logEvent.target}`);
    return;
  }
}

export default PrismaClientSingleton.getInstance();

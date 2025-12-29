import {createLogger, format, Logger, transports} from "winston";

export class AppLogger {
  private static loggerInstance: Logger = this.initLogger("console");

  private static initLogger(type: "console" | "file") {
    if (type === "console") {
      this.loggerInstance = createLogger({
        level: "info",
        format: format.simple(),
        transports: [new transports.Console({ level: "info" })]
      });
    } else {
      this.loggerInstance = createLogger({
        level: "debug",
        format: format.simple(),
        transports: [new transports.File({ filename: "prisma.log", level: "debug" })]
      });
    }

    return this.loggerInstance;
  }

  public static reinitializeLogger(type: "console" | "file") {
    this.initLogger(type);
  }

  public static log(level: string, message: string, ...meta: any[]) {
    this.loggerInstance.log(level, message, meta)
  }

  public static debug(message: string, ...meta: any[]) {
    this.loggerInstance.debug(message, meta)
  }

  public static info(message: string, ...meta: any[]) {
    this.loggerInstance.info(message, meta)
  }

  public static warn(message: string, ...meta: any[]) {
    this.loggerInstance.warn(message, meta)
  }

  public static error(message: string, ...meta: any[]) {
    this.loggerInstance.error(message, meta)
  }
}

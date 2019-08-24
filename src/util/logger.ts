import { EnvironmentType } from "../model/EnvironmentType";
import winston = require("winston");

/**
 * Configuration for winston
 */

const filename = "logs/messenger-cartoon-bot.log";
const errorFilename = "logs/messenger-cartoon-bot-error.log";
const level = process.env.NODE_ENV === EnvironmentType.Prod ? "info" : "debug";

const strFormat = winston.format.printf(
  ({ level, message, timestamp }): string => {
    return `${timestamp} [${level}] ${message}`;
  }
);
const logFormat = winston.format.combine(winston.format.timestamp(), strFormat);

const logger = winston.createLogger({
  transports: [
    new winston.transports.File({
      filename: filename,
      level: level,
    }),
    new winston.transports.File({
      filename: errorFilename,
      level: "error",
    }),
  ],
  format: logFormat,
  exitOnError: false,
});

if (process.env.NODE_ENV !== EnvironmentType.Prod) {
  logger.add(
    new winston.transports.Console({
      level: level,
      format: winston.format.combine(winston.format.colorize(), logFormat),
    })
  );
}

export default logger;

/**
 * Configration for morgan
 */

export const stream = {
  stream: {
    write: (message: string): void => {
      logger.info(message.trim());
    },
  },
};

/**
 * Logger utility that respects the environment.
 * Logs are only shown in development mode.
 */

const isDev = process.env.NODE_ENV === "development";

export const logger = {
  /**
   * Log an error message. Only shown in development.
   */
  error: (message: string, ...args: unknown[]) => {
    if (isDev) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  },

  /**
   * Log a warning message. Only shown in development.
   */
  warn: (message: string, ...args: unknown[]) => {
    if (isDev) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },

  /**
   * Log an info message. Only shown in development.
   */
  info: (message: string, ...args: unknown[]) => {
    if (isDev) {
      console.info(`[INFO] ${message}`, ...args);
    }
  },

  /**
   * Log a debug message. Only shown in development.
   */
  debug: (message: string, ...args: unknown[]) => {
    if (isDev) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  },
};

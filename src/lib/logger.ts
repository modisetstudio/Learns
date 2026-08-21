type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

function log(level: LogLevel, message: string, context?: LogContext): void {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
  };

  if (level === "error") {
    // eslint-disable-next-line no-console
    console.error(JSON.stringify(entry));
  } else if (level === "warn") {
    // eslint-disable-next-line no-console
    console.warn(JSON.stringify(entry));
  } else if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(entry));
  }
}

export const logger = {
  debug: (message: string, context?: LogContext) => log("debug", message, context),
  info: (message: string, context?: LogContext) => log("info", message, context),
  warn: (message: string, context?: LogContext) => log("warn", message, context),
  error: (message: string, context?: LogContext) => log("error", message, context),
};

type LogLevel = "info" | "warn" | "error";
type LogMetadata = Record<string, unknown>;

const serializeError = (error: unknown): LogMetadata => {
  if (error instanceof Error) {
    return {
      errorName: error.name,
      errorMessage: error.message,
      stack: error.stack,
    };
  }

  return {
    errorMessage: String(error),
  };
};

const writeLog = (
  level: LogLevel,
  message: string,
  metadata: LogMetadata = {},
): void => {
  const entry = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    ...metadata,
  });

  if (level === "error") {
    console.error(entry);
    return;
  }

  if (level === "warn") {
    console.warn(entry);
    return;
  }

  console.log(entry);
};

export const logInfo = (
  message: string,
  metadata?: LogMetadata,
): void => writeLog("info", message, metadata);

export const logWarn = (
  message: string,
  metadata?: LogMetadata,
): void => writeLog("warn", message, metadata);

export const logError = (
  message: string,
  error: unknown,
  metadata: LogMetadata = {},
): void => writeLog("error", message, { ...metadata, ...serializeError(error) });

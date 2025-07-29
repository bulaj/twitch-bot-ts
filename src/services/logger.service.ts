type LogLevel = "info" | "log" | "warn" | "error";
type LoggerFunction = (message: string, ...args: unknown[]) => void;

const Colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  // Kolory tekstu
  fg: {
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    gray: "\x1b[90m",
    cyan: "\x1b[36m",
  },
} as const;

const createLogger = () => {
  const formatDate = (): string => {
    return new Intl.DateTimeFormat("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
      .format(new Date())
      .replace(",", "");
  };

  const getColorForLevel = (level: LogLevel): string => {
    switch (level) {
      case "info":
        return Colors.fg.green;
      case "log":
        return Colors.fg.gray;
      case "warn":
        return Colors.fg.yellow;
      case "error":
        return Colors.fg.red;
      default:
        return Colors.reset;
    }
  };

  const createLoggerForLevel = (level: LogLevel): LoggerFunction => {
    return (message: string, ...args: unknown[]): void => {
      const color = getColorForLevel(level);
      const timestamp = `${Colors.fg.gray}[${formatDate()}]${Colors.reset}`;
      const levelStr = `${color}[${level.toUpperCase()}]${Colors.reset}`;

      console[level](
        `${levelStr} ${timestamp} ${color}${message}${Colors.reset}`,
        ...args,
      );
    };
  };

  return {
    info: createLoggerForLevel("info"),
    log: createLoggerForLevel("log"),
    warn: createLoggerForLevel("warn"),
    error: createLoggerForLevel("error"),
  };
};

export const logger = createLogger();

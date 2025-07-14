const formatDate = (date: Date): string => {
  const pad = (n: number): string => n.toString().padStart(2, "0");

  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
};

export const logger = {
  info: (message: string, ...args: any[]) =>
    console.log(`[INFO] [${formatDate(new Date())}] ${message}`, ...args),
  warn: (message: string, ...args: any[]) =>
    console.warn(`[WARN] [${formatDate(new Date())}] ${message}`, ...args),
  error: (message: string, ...args: any[]) =>
    console.error(`[ERROR] [${formatDate(new Date())}] ${message}`, ...args),
};

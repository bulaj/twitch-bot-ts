import Database, { Database as IDatabase } from "better-sqlite3";
import path from "path";
import fs from "fs"; // Potrzebujemy modułu `fs`

/**
 * Funkcja, która niezawodnie znajduje główny katalog monorepo,
 * szukając pliku `pnpm-workspace.yaml`.
 */
const findMonorepoRoot = () => {
  let currentDir = __dirname;
  while (!fs.existsSync(path.join(currentDir, "pnpm-workspace.yaml"))) {
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      // Dotarliśmy do roota systemu plików
      throw new Error(
        "Nie udało się znaleźć głównego katalogu monorepo (brak pnpm-workspace.yaml)",
      );
    }
    currentDir = parentDir;
  }
  return currentDir;
};

const monorepoRoot = findMonorepoRoot();

const createDbConnection = (dbName: string): IDatabase => {
  // Budujemy ścieżkę od znalezionego roota
  const dbPath = path.join(monorepoRoot, "db", dbName);

  try {
    const db = new Database(dbPath, { fileMustExist: true });
    db.pragma("journal_mode = WAL");
    console.log(`[DB] Pomyślnie połączono z: ${dbPath}`);
    return db;
  } catch (error) {
    console.error(
      `[DB] Błąd połączenia z bazą danych ${dbPath}. Upewnij się, że plik istnieje i został zainicjalizowany.`,
    );
    if (process.env.NODE_ENV === "development") {
      console.error(
        "Uruchom 'pnpm db:init', aby stworzyć i zainicjalizować bazę danych.",
      );
    }
    process.exit(1);
  }
};

// Singleton pattern
const globalForDb = globalThis as unknown as {
  reputationDb: IDatabase | undefined;
  pointsDb: IDatabase | undefined;
};

export const reputationDb: IDatabase =
  globalForDb.reputationDb ?? createDbConnection("reputation.db");
export const pointsDb: IDatabase =
  globalForDb.pointsDb ?? createDbConnection("points.db");

if (process.env.NODE_ENV !== "production") {
  globalForDb.reputationDb = reputationDb;
  globalForDb.pointsDb = pointsDb;
}

// ... reszta kodu (init...Schema) ...
// Pamiętaj, aby te funkcje również używały `reputationDb` i `pointsDb`
export const initReputationSchema = () => {
  reputationDb.exec(`CREATE TABLE IF NOT EXISTS ...`);
};

export const initPointsSchema = () => {
  pointsDb.exec(`CREATE TABLE IF NOT EXISTS ...`);
};

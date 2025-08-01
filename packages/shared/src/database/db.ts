import Database from "better-sqlite3";
import path from "path";
import { GAMBLING_START_POINTS } from "../../../bot/src/commands/points";

// Singleton, aby uniknąć wielokrotnego tworzenia instancji w jednym procesie
let reputationDbInstance: Database.Database | null = null;
let pointsDbInstance: Database.Database | null = null;

const createDbConnection = (dbName: string): Database.Database => {
  // Ta ścieżka musi być absolutna i niezależna od tego, skąd jest uruchamiany skrypt.
  // process.cwd() wskazuje na katalog, z którego uruchomiono komendę `pnpm`.
  const monorepoRoot = path.resolve(__dirname, "../../../../../");
  const dbPath = path.join(monorepoRoot, "db", dbName);

  try {
    const db = new Database(dbPath);
    db.pragma("journal_mode = WAL");
    console.log(`[DB] Pomyślnie połączono z: ${dbPath}`);
    return db;
  } catch (error) {
    console.error(`[DB] Błąd połączenia z bazą danych ${dbPath}:`, error);
    // Zatrzymujemy aplikację, jeśli nie można połączyć się z bazą.
    process.exit(1);
  }
};

// Funkcje do pobierania instancji (wzorzec singleton)
export const getReputationDbNew = (): Database.Database => {
  if (!reputationDbInstance) {
    reputationDbInstance = createDbConnection("reputation.db");
    // Tutaj możesz dodać inicjalizację schematu
    const createTable = `
        CREATE TABLE IF NOT EXISTS users (
            username TEXT PRIMARY KEY,
            reputation INTEGER DEFAULT 0
        );
    `;
    reputationDbInstance.exec(createTable);
  }
  return reputationDbInstance;
};

export const getPointsDbNew = (): Database.Database => {
  if (!pointsDbInstance) {
    pointsDbInstance = createDbConnection("points.db");
    // Tutaj możesz dodać inicjalizację schematu
    const createTable = `
      CREATE TABLE IF NOT EXISTS users (
        username TEXT PRIMARY KEY,
        displayName TEXT DEFAULT null,
        points INTEGER DEFAULT ${GAMBLING_START_POINTS},
        debt INTEGER DEFAULT 0,
        lastBet INTEGER DEFAULT 0,
        lastLoan INTEGER DEFAULT 0,
        lastDuel INTEGER DEFAULT 0,
        wins INTEGER DEFAULT 0,
        losses INTEGER DEFAULT 0,
        lastRobbery INTEGER DEFAULT 0,
        robberies INTEGER DEFAULT 0,
        betsCount INTEGER DEFAULT 0,
        successfulRobberies INTEGER DEFAULT 0
      );
     `;
    pointsDbInstance.exec(createTable);
  }
  return pointsDbInstance;
};

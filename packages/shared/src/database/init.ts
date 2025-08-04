import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// Definicje schematów
const reputationSchema = `
  CREATE TABLE IF NOT EXISTS users (
      username TEXT PRIMARY KEY,
      reputation INTEGER DEFAULT 0
  );
`;

const pointsSchema = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    displayName TEXT,
    points INTEGER DEFAULT 1000,
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

// Główna funkcja
const initializeDatabase = () => {
  const dataDir = path.resolve(__dirname, "../../../../db");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log(`[DB Init] Stworzono katalog: ${dataDir}`);
  }

  const reputationDbPath = path.join(dataDir, "reputation.db");
  const pointsDbPath = path.join(dataDir, "points.db");

  console.log("[DB Init] Inicjalizacja bazy danych reputacji...");
  const reputationDb = new Database(reputationDbPath);
  reputationDb.pragma("journal_mode = WAL");
  reputationDb.exec(reputationSchema);
  reputationDb.close();
  console.log(
    `[DB Init] Baza reputacji zainicjalizowana w ${reputationDbPath}`,
  );

  console.log("[DB Init] Inicjalizacja bazy danych punktów...");
  const pointsDb = new Database(pointsDbPath);
  pointsDb.pragma("journal_mode = WAL");
  pointsDb.exec(pointsSchema);
  pointsDb.close();
  console.log(`[DB Init] Baza punktów zainicjalizowana w ${pointsDbPath}`);

  console.log("\n[DB Init] Inicjalizacja zakończona pomyślnie!");
};

// Uruchomienie funkcji
initializeDatabase();

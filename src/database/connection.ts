import Database from "better-sqlite3";
import { logger } from "../services/logger.service";

let db: Database.Database;

export const initDb = () => {
  db = new Database("db/database.db");
  db.pragma("journal_mode = WAL");
  const createTable = `
        CREATE TABLE IF NOT EXISTS users (
            username TEXT PRIMARY KEY,
            reputation INTEGER DEFAULT 0
        );
    `;
  db.exec(createTable);
  logger.info("Database initialized and table created.");
};

export const getDb = (): Database.Database => {
  if (!db) {
    throw new Error("Database not initialized!");
  }
  return db;
};

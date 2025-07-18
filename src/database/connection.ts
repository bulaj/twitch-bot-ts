import Database from "better-sqlite3";
import { logger } from "../services/logger.service";
import { GAMBLING_START_POINTS } from "../commands/points";

let reputationDatabase: Database.Database;
let gamblingDatabase: Database.Database;

export const initDb = () => {
  createReputationDatabase();
  createGamblingDatabase();
};

const createReputationDatabase = () => {
  reputationDatabase = new Database("db/reputation.db");
  reputationDatabase.pragma("journal_mode = WAL");
  const createTable = `
        CREATE TABLE IF NOT EXISTS users (
            username TEXT PRIMARY KEY,
            reputation INTEGER DEFAULT 0
        );
    `;
  reputationDatabase.exec(createTable);
  logger.info("Reputation database initialized and table created.");
};

const createGamblingDatabase = () => {
  gamblingDatabase = new Database("db/points.db");
  gamblingDatabase.pragma("journal_mode = WAL");
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
      successfulRobberies INTEGER DEFAULT 0
    );
  `;
  gamblingDatabase.exec(createTable);
  logger.info("Gambling database initialized and table created.");
};

export const getReputationDb = (): Database.Database => {
  if (!reputationDatabase) {
    throw new Error("Reputation database not initialized!");
  }
  return reputationDatabase;
};

export const getPointsDb = (): Database.Database => {
  if (!gamblingDatabase) {
    throw new Error("Gambling database not initialized!");
  }
  return gamblingDatabase;
};

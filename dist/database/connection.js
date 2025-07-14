"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDb = initDb;
exports.getDb = getDb;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const logger_service_1 = require("../services/logger.service");
let db;
function initDb() {
    db = new better_sqlite3_1.default("db/database.db");
    db.pragma("journal_mode = WAL");
    const createTable = `
        CREATE TABLE IF NOT EXISTS users (
            username TEXT PRIMARY KEY,
            reputation INTEGER DEFAULT 0
        );
    `;
    db.exec(createTable);
    logger_service_1.logger.info("Database initialized and table created.");
}
function getDb() {
    if (!db) {
        throw new Error("Database not initialized!");
    }
    return db;
}

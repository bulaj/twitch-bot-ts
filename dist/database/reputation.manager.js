"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReputationManager = void 0;
const connection_1 = require("./connection");
class ReputationManager {
    static getUser(username) {
        const db = (0, connection_1.getDb)();
        const stmt = db.prepare("SELECT * FROM users WHERE username = ?");
        return stmt.get(username.toLowerCase());
    }
    static changeReputation(username, amount) {
        const db = (0, connection_1.getDb)();
        const normalizedUser = username.toLowerCase();
        let user = this.getUser(normalizedUser);
        if (!user) {
            db.prepare("INSERT INTO users (username) VALUES (?)").run(normalizedUser);
        }
        const stmt = db.prepare("UPDATE users SET reputation = reputation + ? WHERE username = ? RETURNING reputation");
        const result = stmt.get(amount, normalizedUser);
        return result.reputation;
    }
}
exports.ReputationManager = ReputationManager;

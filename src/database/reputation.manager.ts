import { getDb } from './connection';

export class ReputationManager {
    static getUser(username: string): { username: string; reputation: number } | null {
        const db = getDb();
        const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
        return stmt.get(username.toLowerCase()) as any;
    }

    static changeReputation(username: string, amount: number): number {
        const db = getDb();
        const normalizedUser = username.toLowerCase();

        let user = this.getUser(normalizedUser);
        if (!user) {
            db.prepare('INSERT INTO users (username) VALUES (?)').run(normalizedUser);
        }

        const stmt = db.prepare('UPDATE users SET reputation = reputation + ? WHERE username = ? RETURNING reputation');
        const result = stmt.get(amount, normalizedUser) as { reputation: number };
        return result.reputation;
    }
}

import { ReputationUser } from "./types";
import { reputationDb } from "./db";

export const getReputationUser = (username: string): ReputationUser => {
  const db = reputationDb;
  const stmt = db.prepare("SELECT * FROM users WHERE username = ?");
  return stmt.get(username.toLowerCase()) as ReputationUser;
};

export const changeReputation = (username: string, amount: number): number => {
  const db = reputationDb;
  const normalizedUser = username.toLowerCase();

  const user = getReputationUser(normalizedUser);
  if (!user) {
    db.prepare("INSERT INTO users (username) VALUES (?)").run(normalizedUser);
  }

  const stmt = db.prepare(
    "UPDATE users SET reputation = reputation + ? WHERE username = ? RETURNING reputation",
  );
  const result = stmt.get(amount, normalizedUser) as { reputation: number };
  return result.reputation;
};

export const getTopReputationUsers = (limit: number = 5): ReputationUser[] => {
  const db = reputationDb;
  const stmt = db.prepare(
    "SELECT username, reputation FROM users WHERE username != 'xd' ORDER BY reputation DESC LIMIT ?",
  );
  const rows = stmt.all(limit) as ReputationUser[];
  return rows;
};

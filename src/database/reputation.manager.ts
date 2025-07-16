import { getReputationDb } from "./connection";

export interface ReputationUser {
  username: string;
  reputation: number;
}

export const getReputationUser = (username: string): ReputationUser => {
  const db = getReputationDb();
  const stmt = db.prepare("SELECT * FROM users WHERE username = ?");
  return stmt.get(username.toLowerCase()) as ReputationUser;
};

export const changeReputation = (username: string, amount: number): number => {
  const db = getReputationDb();
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

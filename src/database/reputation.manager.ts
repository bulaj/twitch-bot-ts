import { getDb } from "./connection";

interface User {
  username: string;
  reputation: number;
}

export const getUser = (username: string): User | null => {
  const db = getDb();
  const stmt = db.prepare("SELECT * FROM users WHERE username = ?");
  return stmt.get(username.toLowerCase()) as User | null;
};

export const changeReputation = (username: string, amount: number): number => {
  const db = getDb();
  const normalizedUser = username.toLowerCase();

  const user = getUser(normalizedUser);
  if (!user) {
    db.prepare("INSERT INTO users (username) VALUES (?)").run(normalizedUser);
  }

  const stmt = db.prepare(
    "UPDATE users SET reputation = reputation + ? WHERE username = ? RETURNING reputation",
  );
  const result = stmt.get(amount, normalizedUser) as { reputation: number };
  return result.reputation;
};

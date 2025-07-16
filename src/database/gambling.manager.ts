import { getGamblingDb } from "./connection";

export interface GamblingUser {
  username: string;
  points: number;
  debt: number;
  lastBet: number;
  lastLoan: number;
}

export const getGamblingUser = (username: string): GamblingUser => {
  const db = getGamblingDb();
  const stmt = db.prepare("SELECT * FROM users WHERE username = ?");
  return stmt.get(username.toLowerCase()) as GamblingUser;
};

export const changePoints = (username: string, amount: number): number => {
  const db = getGamblingDb();
  const normalizedUser = username.toLowerCase();

  const user = getGamblingUser(normalizedUser);
  if (!user) {
    db.prepare("INSERT INTO users (username) VALUES (?)").run(normalizedUser);
  }

  const stmt = db.prepare(
    "UPDATE users SET points = points + ? WHERE username = ? RETURNING points",
  );
  const result = stmt.get(amount, normalizedUser) as { points: number };
  return result.points;
};

export const changeDebt = (username: string, amount: number): number => {
  const db = getGamblingDb();
  const normalizedUser = username.toLowerCase();

  const user = getGamblingUser(normalizedUser);
  if (!user) {
    db.prepare("INSERT INTO users (username) VALUES (?)").run(normalizedUser);
  }

  const stmt = db.prepare(
    "UPDATE users SET debt = debt + ? WHERE username = ? RETURNING debt",
  );
  const result = stmt.get(amount, normalizedUser) as { debt: number };
  return result.debt;
};

import { getGamblingDb } from "./connection";

export interface GamblingUser {
  username: string;
  points: number;
  debt: number;
  lastBet: number;
  lastLoan: number;
  wins: number;
  losses: number;
  lastDuel: number;
  lastRobbery: number;
  robberies: number;
  successfulRobberies: number;
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

export function updateDuelStats(username: string, didWin: boolean) {
  const db = getGamblingDb();
  if (didWin) {
    db.prepare("UPDATE users SET wins = wins + 1 WHERE username = ?").run(
      username,
    );
  } else {
    db.prepare("UPDATE users SET losses = losses + 1 WHERE username = ?").run(
      username,
    );
  }
}

export function updateRobberyStats(username: string, success: boolean) {
  const db = getGamblingDb();
  const user = db
    .prepare(
      `SELECT robberies, successfulRobberies FROM users WHERE username = ?`,
    )
    .get(username) as GamblingUser;
  if (!user) return;

  const newRobberies = (user.robberies ?? 0) + 1;
  const newSuccesses = success
    ? (user.successfulRobberies ?? 0) + 1
    : user.successfulRobberies;

  db.prepare(
    `UPDATE users SET robberies = ?, successfulRobberies = ? WHERE username = ?`,
  ).run(newRobberies, newSuccesses, username);
}

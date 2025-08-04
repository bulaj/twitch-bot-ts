import { PointsUser } from "./types";
import { pointsDb } from "./db";

export const getPointsUser = (username: string): PointsUser => {
  const db = pointsDb;
  const stmt = db.prepare("SELECT * FROM users WHERE username = ?");
  return stmt.get(username.toLowerCase()) as PointsUser;
};

export const changePoints = (username: string, amount: number): number => {
  const db = pointsDb;
  const normalizedUser = username.toLowerCase();

  const user = getPointsUser(normalizedUser);
  if (!user) {
    db.prepare("INSERT INTO users (username) VALUES (?)").run(normalizedUser);
  }

  const stmt = db.prepare(
    "UPDATE users SET points = points + ? WHERE username = ? RETURNING points",
  );
  const result = stmt.get(amount, normalizedUser) as { points: number };
  return result.points;
};

export const changeActivityPoints = (
  username: string,
  displayName: string,
  amount: number,
): void => {
  const db = pointsDb;

  // Dodaj usera jeśli nie istnieje
  db.prepare(
    `
    INSERT INTO users (username, displayName, points)
    VALUES (?, ?, ?)
    ON CONFLICT(username) DO UPDATE SET displayName = excluded.displayName
  `,
  ).run(username.toLowerCase(), displayName, amount);

  // Dodaj punkty (jeśli user już był, to tylko update)
  db.prepare(
    `
    UPDATE users SET points = points + ? WHERE username = ?
  `,
  ).run(amount, username.toLowerCase());
};

export const changeDebt = (username: string, amount: number): number => {
  const db = pointsDb;
  const normalizedUser = username.toLowerCase();

  const user = getPointsUser(normalizedUser);
  if (!user) {
    db.prepare("INSERT INTO users (username) VALUES (?)").run(normalizedUser);
  }

  const stmt = db.prepare(
    "UPDATE users SET debt = debt + ? WHERE username = ? RETURNING debt",
  );
  const result = stmt.get(amount, normalizedUser) as { debt: number };
  return result.debt;
};

export const updateDuelStats = (username: string, didWin: boolean): void => {
  const db = pointsDb;
  if (didWin) {
    db.prepare("UPDATE users SET wins = wins + 1 WHERE username = ?").run(
      username,
    );
  } else {
    db.prepare("UPDATE users SET losses = losses + 1 WHERE username = ?").run(
      username,
    );
  }
};

export const updateRobberyStats = (
  username: string,
  success: boolean,
): void => {
  const db = pointsDb;
  const user = db
    .prepare(
      `SELECT robberies, successfulRobberies FROM users WHERE username = ?`,
    )
    .get(username) as PointsUser;
  if (!user) return;

  const newRobberies = (user.robberies ?? 0) + 1;
  const newSuccesses = success
    ? (user.successfulRobberies ?? 0) + 1
    : user.successfulRobberies;

  db.prepare(
    `UPDATE users SET robberies = ?, successfulRobberies = ? WHERE username = ?`,
  ).run(newRobberies, newSuccesses, username);
};

export const repayLoan = (username: string, amount: number): number => {
  const db = pointsDb;
  const user = getPointsUser(username);
  if (!user) return 0;

  const repayAmount =
    amount === -1
      ? Math.min(user.points, user.debt)
      : Math.min(amount, user.points, user.debt);

  if (repayAmount <= 0) return 0;

  db.prepare(
    `UPDATE users SET points = points - ?, debt = debt - ? WHERE username = ?`,
  ).run(repayAmount, repayAmount, username);

  return repayAmount;
};

export const incrementBetsCount = (username: string): void => {
  const db = pointsDb;
  db.prepare(
    `UPDATE users SET betsCount = COALESCE(betsCount, 0) + 1 WHERE username = ?`,
  ).run(username.toLowerCase());
};

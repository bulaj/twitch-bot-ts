import tmi from "tmi.js";
import { logger } from "../../services/logger.service";
import {
  changeDebt,
  changePoints,
  getPointsUser,
  PointsUser,
  repayLoan,
} from "../../database/points.manager";
import { getPointsDb } from "../../database/connection";
import { handleRobbery } from "./robbery";
import {
  cleanupExpiredDuels,
  handleDuelAcceptance,
  handleDuelChallenge,
} from "./duel";
import { getDisplayName } from "../../services/displayName.service";

const COOLDOWN = 60 * 1000;
const COOLDOWN_LOAN = 10 * 60 * 1000;
const INTEREST_INTERVAL = 60 * 1000;
const MAX_DEBT = 2000;
const LOAN_AMOUNT = 1000;
const GAMBLING_CHANCE = 0.5;

export const GAMBLING_START_POINTS = 1000;

const OBSTAW = "!obstaw";
const POZYCZKA = "!pozyczka";
const SALDO = "!saldo";
const PUNKTY = "!punkty";
const TOPDLUZNICY = "!topdluznicy";
const DLUGI = "!dlugi";
const TOPBOGACZE = "!topbogacze";
const DUEL = "!duel";
const AKCEPTUJ = "!akceptuj";
const TOPWOJOWNICY = "!topwojownicy";
const ROBBERY = "!napad";
const TOPROBBERS = "!topnapady";
const SPLAC = "!splac";

type TopUser = Pick<
  PointsUser,
  "username" | "displayName" | "points" | "debt" | "wins" | "losses"
>;

const pointsCommands = [
  OBSTAW,
  POZYCZKA,
  SALDO,
  PUNKTY,
  TOPDLUZNICY,
  DLUGI,
  TOPBOGACZE,
  DUEL,
  AKCEPTUJ,
  TOPWOJOWNICY,
  ROBBERY,
  TOPROBBERS,
  SPLAC,
];

export const handlePointsCommands = (
  client: tmi.Client,
  channel: string,
  userstate: tmi.ChatUserstate,
  message: string,
) => {
  if (!userstate.username) return;
  if (!pointsCommands.some((cmd) => message.startsWith(cmd))) return;

  const db = getPointsDb();
  const username = userstate.username.toLowerCase();
  const displayName = getDisplayName(userstate);
  const now = Date.now();

  let user = getPointsUser(username);
  if (!user) {
    db.prepare(
      `INSERT INTO users (username, points, debt, lastBet, lastLoan, lastDuel, wins, losses)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(username, 1000, 0, 0, 0, 0, 0, 0);
    user = getPointsUser(username);
  }

  if (message.startsWith(ROBBERY)) {
    handleRobbery(client, channel, userstate, message, user, now);
    return;
  }

  logger.info(`Command: ${message} by ${username}`);

  // --- OBSTAWIANIE ---
  if (message.startsWith(OBSTAW)) {
    const args = message.trim().split(" ");
    const amount =
      args[1]?.toLowerCase() === "all" ? user!.points : parseInt(args[1]);

    if (isNaN(amount) || amount <= 0) {
      client.say(
        channel,
        `@${displayName}, podaj poprawną liczbę punktów. hazard`,
      );
      return;
    }

    if (now - user.lastBet < COOLDOWN) {
      const wait = Math.ceil((COOLDOWN - (now - user.lastBet)) / 1000);
      client.say(
        channel,
        `@${displayName}, odczekaj ${wait}s przed kolejnym obstawieniem. hazard`,
      );
      return;
    }

    if (user.points < amount) {
      client.say(
        channel,
        `@${displayName}, masz tylko ${user.points} punktów. hazard`,
      );
      return;
    }

    const win = Math.random() < GAMBLING_CHANCE;
    const diff = win ? amount : -amount;
    const updated = changePoints(username, diff);

    db.prepare(`UPDATE users SET lastBet = ? WHERE username = ?`).run(
      now,
      username,
    );

    client.say(
      channel,
      win
        ? `🎉 @${displayName} wygrał(a) ${amount} punktów! Masz teraz ${updated}. hazard`
        : `💥 @${displayName} przegrał(a) ${amount} punktów... Masz teraz ${updated}. hazard`,
    );
    return;
  }

  // --- POZYCZKA ---
  if (message === POZYCZKA) {
    if (user.points > 500) {
      client.say(
        channel,
        `@${displayName}, pożyczki tylko przy niskim saldzie.`,
      );
      return;
    }

    if (user.debt >= MAX_DEBT) {
      client.say(
        channel,
        `@${displayName}, masz już zbyt duży dług (${user.debt}).`,
      );
      return;
    }

    if (now - user.lastLoan < COOLDOWN_LOAN) {
      const wait = Math.ceil((COOLDOWN_LOAN - (now - user.lastLoan)) / 1000);
      client.say(
        channel,
        `@${displayName}, poczekaj ${wait}s na kolejną pożyczkę.`,
      );
      return;
    }

    changePoints(username, LOAN_AMOUNT);
    changeDebt(username, LOAN_AMOUNT);
    db.prepare("UPDATE users SET lastLoan = ? WHERE username = ?").run(
      now,
      username,
    );

    client.say(
      channel,
      `💸 @${displayName}, pożyczka przyznana. Twój dług: ${user.debt + LOAN_AMOUNT}`,
    );
    return;
  }

  // --- SPLATA ---
  if (message.startsWith(SPLAC)) {
    const args = message.trim().split(" ");
    const amountArg = args[1];
    const amount =
      amountArg?.toLowerCase() === "all" ? -1 : parseInt(amountArg);

    if (amountArg && isNaN(amount) && amount !== -1) {
      client.say(channel, `@${displayName}, podaj liczbę lub 'all'.`);
      return;
    }

    const repaid = repayLoan(username, amount ?? -1);

    if (repaid > 0) {
      client.say(
        channel,
        `@${displayName}, spłacono ${repaid} punktów długu. Dług: ${
          getPointsUser(username)!.debt
        }, punkty: ${getPointsUser(username)!.points}`,
      );
    } else {
      client.say(
        channel,
        `@${displayName}, nie masz długu albo za mało punktów na spłatę.`,
      );
    }
    return;
  }

  // --- SALDO ---
  if (message === SALDO) {
    client.say(
      channel,
      `@${displayName}, punkty: ${user.points}, dług: ${user.debt}`,
    );
    return;
  }

  // --- PUNKTY ---
  if (message === PUNKTY) {
    client.say(channel, `@${displayName}, masz ${user.points} punktów. hazard`);
    return;
  }

  // --- DLUGI ---
  if (message === TOPDLUZNICY || message === DLUGI) {
    const users = db
      .prepare(
        `SELECT username, debt FROM users WHERE debt > 0 ORDER BY debt DESC LIMIT 5`,
      )
      .all() as TopUser[];

    const msg =
      users.length === 0
        ? `💳 Nikt jeszcze nie ma długu. Czat czysty jak łza.`
        : `📉 Top dłużnicy: ` +
          users
            .map((u, i) => `${i + 1}. ${u.username}: ${u.debt} pkt`)
            .join(" | ");
    client.say(channel, msg);
    return;
  }

  // --- TOP BOGACZE ---
  if (message === TOPBOGACZE) {
    const users = db
      .prepare(
        `SELECT username, displayName, points FROM users WHERE points > 0 ORDER BY points DESC LIMIT 5`,
      )
      .all() as TopUser[];

    const msg =
      users.length === 0
        ? `😔 Nikt jeszcze nie ma punktów. Czat zbiedniał.`
        : `💰 Top bogacze: ` +
          users
            .map((u, i) => `${i + 1}. ${getDisplayName(u)}: ${u.points} pkt`)
            .join(" | ");
    client.say(channel, msg);
    return;
  }

  // --- POJEDYNEK ---
  if (message.startsWith(DUEL)) {
    const args = message.trim().split(" ");
    const target = args[1]?.startsWith("@") ? args[1].substring(1) : args[1];
    const amount = parseInt(args[2]);

    if (!target || isNaN(amount) || amount <= 0) {
      client.say(channel, `@${displayName}, użycie: !duel @nick <kwota>`);
      return;
    }

    handleDuelChallenge(
      client,
      channel,
      username,
      displayName,
      target,
      amount,
      now,
    );
    return;
  }

  // --- AKCEPTACJA POJEDYNKU ---
  if (message === AKCEPTUJ) {
    handleDuelAcceptance(client, channel, username, displayName, now);
    return;
  }

  // --- TOP WOJOWNICY ---
  if (message === TOPWOJOWNICY) {
    const users = db
      .prepare(
        `SELECT username, displayName, wins, losses 
       FROM users 
       WHERE wins + losses > 0 
       ORDER BY wins DESC 
       LIMIT 5`,
      )
      .all() as TopUser[];

    const msg =
      users.length === 0
        ? `🛡️ Nikt jeszcze nie walczył w pojedynku.`
        : `🥇 Top wojownicy: ` +
          users
            .map(
              (u, i) =>
                `${i + 1}. ${getDisplayName(u)} (${u.wins}W/${u.losses}L)`,
            )
            .join(" | ");
    client.say(channel, msg);
    return;
  }

  if (message === TOPROBBERS) {
    const users = db
      .prepare(
        `SELECT username, robberies, successfulRobberies 
     FROM users WHERE robberies > 0 
     ORDER BY successfulRobberies DESC, robberies DESC LIMIT 5`,
      )
      .all() as {
      username: string;
      robberies: number;
      successfulRobberies: number;
    }[];

    if (users.length === 0) {
      client.say(channel, `🏴‍☠️ Nikt jeszcze nie próbował napadu.`);
      return;
    }

    const msg = users
      .map(
        (u, i) =>
          `${i + 1}. ${getDisplayName(u)}: ${u.successfulRobberies} udanych / ${u.robberies} prób`,
      )
      .join(" | ");

    client.say(channel, `🏴‍☠️ Top napadowcy: ${msg}`);
    return;
  }
};

// --- ODSETKI ---
setInterval(() => {
  const db = getPointsDb();
  const stmt = db.prepare(
    `UPDATE users SET debt = debt + 1 WHERE debt > 0 AND debt < ?`,
  );
  const result = stmt.run(MAX_DEBT * 2);
  if (result.changes > 0) {
    console.log(
      "💰 Odsetki od pożyczek naliczone dla",
      result.changes,
      "użytkowników.",
    );
  }
}, INTEREST_INTERVAL);

// --- CZYSZCZENIE NIEPOTWIERDZONYCH POJEDYNKÓW ---
setInterval(cleanupExpiredDuels, 30 * 1000);

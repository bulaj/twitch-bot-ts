import tmi from "tmi.js";
import { logger } from "../../services/logger.service";
import {
  changeDebt,
  changePoints,
  GamblingUser,
  getGamblingUser,
} from "../../database/gambling.manager";
import { getGamblingDb } from "../../database/connection";

const COOLDOWN = 60 * 1000;
const COOLDOWN_LOAN = 10 * 60 * 1000;
const INTEREST_INTERVAL = 60 * 1000;
const MAX_DEBT = 5000;
const STANDARD_MULTIPLIER = 0.5;
const LOAN_AMOUNT = 1000;
export const GAMBLING_START_POINTS = 1000;

const OBSTAW = "!obstaw";
const POZYCZKA = "!pozyczka";
const SALDO = "!saldo";
const PUNKTY = "!punkty";
const TOPDLUZNICY = "!topdluznicy";
const DLUGI = "!dlugi";
const TOPBOGACZE = "!topbogacze";
const SPLAC = "!splac";

type TopUser = Pick<GamblingUser, "username" | "points" | "debt">;

const commands = [
  OBSTAW,
  POZYCZKA,
  SALDO,
  PUNKTY,
  TOPDLUZNICY,
  DLUGI,
  TOPBOGACZE,
  SPLAC,
];

export const handleGambling = (
  client: tmi.Client,
  channel: string,
  userstate: tmi.ChatUserstate,
  message: string,
) => {
  if (!userstate.username) return;
  if (!commands.some((cmd) => message.startsWith(cmd))) return;

  const db = getGamblingDb();
  const username = userstate.username.toLowerCase();
  const now = Date.now();

  let gamblingUser = getGamblingUser(username);
  if (!gamblingUser) {
    db.prepare(
      `INSERT INTO users (username, points, debt, lastBet, lastLoan) VALUES (?, ?, ?, ?, ?)`,
    ).run(username, 1000, 0, 0, 0);
    gamblingUser = getGamblingUser(username);
  }

  logger.info(`Gambling: ${message} by ${username}`);

  if (message.startsWith(OBSTAW)) {
    const args = message.trim().split(" ");
    const amount =
      args[1]?.toLowerCase() === "allin"
        ? gamblingUser!.points
        : parseInt(args[1]);
    if (isNaN(amount) || amount <= 0) {
      client.say(
        channel,
        `@${username}, podaj poprawną liczbę punktów. hazard`,
      );
      return;
    }

    if (now - (gamblingUser?.lastBet || 0) < COOLDOWN) {
      const wait = Math.ceil(
        (COOLDOWN - (now - (gamblingUser?.lastBet || 0))) /
          GAMBLING_START_POINTS,
      );
      client.say(
        channel,
        `@${username}, odczekaj ${wait}s przed kolejnym obstawieniem. hazard`,
      );
      return;
    }

    if ((gamblingUser?.points || 0) < amount) {
      client.say(
        channel,
        `@${username}, masz tylko ${gamblingUser?.points} punktów. hazard`,
      );
      return;
    }

    const win = Math.random() < STANDARD_MULTIPLIER;
    const diff = win ? amount : -amount;
    const updated = changePoints(username, diff);

    db.prepare(`UPDATE users SET lastBet = ? WHERE username = ?`).run(
      now,
      username,
    );

    client.say(
      channel,
      win
        ? `🎉 @${username} wygrał(a) ${amount} punktów! Masz teraz ${updated}. hazard`
        : `💥 @${username} przegrał(a) ${amount} punktów... Masz teraz ${updated}. hazard`,
    );
    return;
  }

  if (message === POZYCZKA) {
    if ((gamblingUser?.points || 0) > 0) {
      client.say(channel, `@${username}, pożyczki tylko przy zerowym saldzie.`);
      return;
    }

    if ((gamblingUser?.debt || 0) >= MAX_DEBT) {
      client.say(
        channel,
        `@${username}, masz już zbyt duży dług (${gamblingUser?.debt}).`,
      );
      return;
    }

    if (now - (gamblingUser?.lastLoan || 0) < COOLDOWN_LOAN) {
      const wait = Math.ceil(
        (COOLDOWN_LOAN - (now - (gamblingUser?.lastLoan || 0))) / 1000,
      );
      client.say(
        channel,
        `@${username}, poczekaj ${wait}s na kolejną pożyczkę.`,
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
      `💸 @${username}, pożyczka przyznana. Twój dług: ${(gamblingUser?.debt || 0) + LOAN_AMOUNT}`,
    );
    return;
  }

  if (message.startsWith(SPLAC)) {
    if ((gamblingUser?.debt || 0) <= 0) {
      client.say(channel, `@${username}, nie masz żadnego długu do spłaty.`);
      return;
    }

    const args = message.trim().split(" ");
    const repayAmount =
      args[1]?.toLowerCase() === "all"
        ? Math.min(gamblingUser.points, gamblingUser.debt)
        : parseInt(args[1]);

    if (isNaN(repayAmount) || repayAmount <= 0) {
      client.say(channel, `@${username}, podaj poprawną kwotę do spłaty.`);
      return;
    }

    if (gamblingUser.points < repayAmount) {
      client.say(
        channel,
        `@${username}, masz tylko ${gamblingUser.points} punktów. Nie możesz spłacić ${repayAmount}.`,
      );
      return;
    }

    if (repayAmount > gamblingUser.debt) {
      client.say(
        channel,
        `@${username}, Twój dług to tylko ${gamblingUser.debt} punktów. hazard`,
      );
      return;
    }

    changePoints(username, -repayAmount);
    changeDebt(username, -repayAmount);
    gamblingUser = getGamblingUser(username);

    client.say(
      channel,
      `✅ @${username}, spłacono ${repayAmount} punktów. Pozostały dług: ${gamblingUser.debt}`,
    );
    return;
  }

  if (message === SALDO) {
    client.say(
      channel,
      `@${username}, punkty: ${gamblingUser?.points || 0}, dług: ${gamblingUser?.debt || 0}`,
    );
    return;
  }

  if (message === PUNKTY) {
    client.say(
      channel,
      `@${username}, masz ${gamblingUser?.points || 0} punktów. hazard`,
    );
    return;
  }

  if (message === TOPDLUZNICY || message === DLUGI) {
    const users = db
      .prepare(
        `SELECT username, debt FROM users WHERE debt > 0 ORDER BY debt DESC LIMIT 5`,
      )
      .all() as TopUser[];

    if (users.length === 0) {
      client.say(channel, `💳 Nikt jeszcze nie ma długu. Czat czysty jak łza.`);
    } else {
      const msg = users
        .map((user, i) => `${i + 1}. ${user.username}: ${user.debt} pkt`)
        .join(" | ");
      client.say(channel, `📉 Top dłużnicy: ${msg} hazard`);
    }
    return;
  }

  if (message === TOPBOGACZE) {
    const users = db
      .prepare(
        `SELECT username, points FROM users WHERE points > 0 ORDER BY points DESC LIMIT 5`,
      )
      .all() as TopUser[];

    if (users.length === 0) {
      client.say(channel, `😔 Nikt jeszcze nie ma punktów. Czat zbiedniał.`);
    } else {
      const msg = users
        .map((u, i) => `${i + 1}. ${u.username}: ${u.points} pkt`)
        .join(" | ");
      client.say(channel, `💰 Top bogacze: ${msg}`);
    }
    return;
  }
};

// Naliczanie odsetek
setInterval(() => {
  const db = getGamblingDb();
  const stmt = db.prepare(
    `UPDATE users SET debt = debt + 50 WHERE debt > 0 AND debt < ?`,
  );
  const result = stmt.run(MAX_DEBT * 2);
  if (result.changes > 0) {
    console.log("💰 Odsetki naliczone dla", result.changes, "użytkowników.");
  }
}, INTEREST_INTERVAL);

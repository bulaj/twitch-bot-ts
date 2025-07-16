import tmi from "tmi.js";
import { logger } from "../../services/logger.service";
import {
  changeDebt,
  changePoints,
  GamblingUser,
  getGamblingUser,
  updateDuelStats,
} from "../../database/gambling.manager";
import { getGamblingDb } from "../../database/connection";
import { handleRobbery } from "../robbery/robbery";

const COOLDOWN = 60 * 1000;
const COOLDOWN_LOAN = 10 * 60 * 1000;
const COOLDOWN_DUEL = 60 * 1000;
const INTEREST_INTERVAL = 60 * 1000;
const MAX_DEBT = 2000;
const LOAN_AMOUNT = 1000;
const DUEL_EXPIRATION = 3 * 60 * 1000;
const GAMBLING_CHANCE = 0.5;
const DUEL_CHANCE = 0.5;

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

type TopUser = Pick<
  GamblingUser,
  "username" | "points" | "debt" | "wins" | "losses"
>;

const commands = [
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
];

const pendingDuels: {
  [targetUsername: string]: {
    challenger: string;
    amount: number;
    timestamp: number;
  };
} = {};

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

  let user = getGamblingUser(username);
  if (!user) {
    db.prepare(
      `INSERT INTO users (username, points, debt, lastBet, lastLoan, lastDuel, wins, losses)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(username, 1000, 0, 0, 0, 0, 0, 0);
    user = getGamblingUser(username);
  }

  if (message.startsWith(ROBBERY)) {
    handleRobbery(client, channel, userstate, message, user, now);
    return;
  }

  logger.info(`Gambling: ${message} by ${username}`);

  // --- OBSTAWIANIE ---
  if (message.startsWith(OBSTAW)) {
    const args = message.trim().split(" ");
    const amount =
      args[1]?.toLowerCase() === "all" ? user!.points : parseInt(args[1]);

    if (isNaN(amount) || amount <= 0) {
      client.say(
        channel,
        `@${username}, podaj poprawną liczbę punktów. hazard`,
      );
      return;
    }

    if (now - user.lastBet < COOLDOWN) {
      const wait = Math.ceil((COOLDOWN - (now - user.lastBet)) / 1000);
      client.say(
        channel,
        `@${username}, odczekaj ${wait}s przed kolejnym obstawieniem. hazard`,
      );
      return;
    }

    if (user.points < amount) {
      client.say(
        channel,
        `@${username}, masz tylko ${user.points} punktów. hazard`,
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
        ? `🎉 @${username} wygrał(a) ${amount} punktów! Masz teraz ${updated}. hazard`
        : `💥 @${username} przegrał(a) ${amount} punktów... Masz teraz ${updated}. hazard`,
    );
    return;
  }

  // --- POZYCZKA ---
  if (message === POZYCZKA) {
    if (user.points > 0) {
      client.say(channel, `@${username}, pożyczki tylko przy zerowym saldzie.`);
      return;
    }

    if (user.debt >= MAX_DEBT) {
      client.say(
        channel,
        `@${username}, masz już zbyt duży dług (${user.debt}).`,
      );
      return;
    }

    if (now - user.lastLoan < COOLDOWN_LOAN) {
      const wait = Math.ceil((COOLDOWN_LOAN - (now - user.lastLoan)) / 1000);
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
      `💸 @${username}, pożyczka przyznana. Twój dług: ${user.debt + LOAN_AMOUNT}`,
    );
    return;
  }

  // --- SALDO ---
  if (message === SALDO) {
    client.say(
      channel,
      `@${username}, punkty: ${user.points}, dług: ${user.debt}`,
    );
    return;
  }

  // --- PUNKTY ---
  if (message === PUNKTY) {
    client.say(channel, `@${username}, masz ${user.points} punktów. hazard`);
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
        `SELECT username, points FROM users WHERE points > 0 ORDER BY points DESC LIMIT 5`,
      )
      .all() as TopUser[];

    const msg =
      users.length === 0
        ? `😔 Nikt jeszcze nie ma punktów. Czat zbiedniał.`
        : `💰 Top bogacze: ` +
          users
            .map((u, i) => `${i + 1}. ${u.username}: ${u.points} pkt`)
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
      client.say(channel, `@${username}, użycie: !duel @nick <kwota>`);
      return;
    }

    if (target.toLowerCase() === username) {
      client.say(channel, `@${username}, nie możesz wyzwać samego siebie.`);
      return;
    }

    const challenger = user!;
    const opponent = getGamblingUser(target.toLowerCase());

    if (!opponent) {
      client.say(
        channel,
        `@${username}, nie znaleziono użytkownika ${target}.`,
      );
      return;
    }

    if (challenger.points < amount || opponent.points < amount) {
      client.say(
        channel,
        `@${username}, jeden z graczy nie ma wystarczająco punktów.`,
      );
      return;
    }

    if (now - challenger.lastDuel < COOLDOWN_DUEL) {
      const wait = Math.ceil(
        (COOLDOWN_DUEL - (now - challenger.lastDuel)) / 1000,
      );
      client.say(
        channel,
        `@${username}, poczekaj ${wait}s przed kolejnym pojedynkiem.`,
      );
      return;
    }

    pendingDuels[target.toLowerCase()] = {
      challenger: username,
      amount,
      timestamp: now,
    };

    client.say(
      channel,
      `⚔️ @${username} wyzwał(a) @${target} na pojedynek o ${amount} pkt! Aby zaakceptować, wpisz !akceptuj`,
    );
    return;
  }

  // --- AKCEPTACJA POJEDYNKU ---
  if (message === AKCEPTUJ) {
    const pending = pendingDuels[username];
    if (!pending) {
      client.say(
        channel,
        `@${username}, nie masz żadnych wyzwań do zaakceptowania.`,
      );
      return;
    }

    const challenger = getGamblingUser(pending.challenger);
    const opponent = user!;
    const amount = pending.amount;

    if (!challenger || !opponent) {
      client.say(channel, `Pojedynek nieważny – gracz nie istnieje.`);
      delete pendingDuels[username];
      return;
    }

    if (challenger.points < amount || opponent.points < amount) {
      client.say(
        channel,
        `Pojedynek anulowany – jeden z graczy nie ma wystarczających punktów.`,
      );
      delete pendingDuels[username];
      return;
    }

    const winner = Math.random() < DUEL_CHANCE ? challenger : opponent;
    const loser = winner === challenger ? opponent : challenger;

    changePoints(winner.username, amount);
    changePoints(loser.username, -amount);

    updateDuelStats(winner.username, true);
    updateDuelStats(loser.username, false);

    db.prepare(`UPDATE users SET lastDuel = ? WHERE username = ?`).run(
      now,
      challenger.username,
    );

    client.say(
      channel,
      `⚔️ Pojedynek: @${challenger.username} vs @${opponent.username} o ${amount} pkt! ` +
        `Wygrał(a) ${winner.username}! hazard`,
    );

    delete pendingDuels[username];
    return;
  }

  // --- TOP WOJOWNICY ---
  if (message === TOPWOJOWNICY) {
    const users = db
      .prepare(
        `SELECT username, wins, losses 
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
            .map((u, i) => `${i + 1}. ${u.username} (${u.wins}W/${u.losses}L)`)
            .join(" | ");
    client.say(channel, msg);
    return;
  }
};

// --- ODSETKI ---
setInterval(() => {
  const db = getGamblingDb();
  const stmt = db.prepare(
    `UPDATE users SET debt = debt + 1 WHERE debt > 0 AND debt < ?`,
  );
  const result = stmt.run(MAX_DEBT * 2);
  if (result.changes > 0) {
    console.log("💰 Odsetki naliczone dla", result.changes, "użytkowników.");
  }
}, INTEREST_INTERVAL);

// --- CZYSZCZENIE NIEPOTWIERDZONYCH POJEDYNKÓW ---
setInterval(() => {
  const now = Date.now();
  for (const [target, data] of Object.entries(pendingDuels)) {
    if (now - data.timestamp > DUEL_EXPIRATION) {
      delete pendingDuels[target];
    }
  }
}, 30 * 1000);

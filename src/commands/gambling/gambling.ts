import * as fs from "node:fs";
import tmi from "tmi.js";
import { logger } from "../../services/logger.service";

const COOLDOWN_BET = 60 * 1000;
const COOLDOWN_LOAN = 10 * 60 * 1000;
const INTEREST_INTERVAL = 60 * 1000; // 1 minuta
const MAX_DEBT = 30;
const STANDARD_MULTIPLIER = 0.9;

type GamblingUserData = {
  points: number;
  lastBet: number; // timestamp
  debt?: number;
  lastLoan?: number;
};

const DATA_FILE = "points.json";
const COOLDOWN = 60 * 1000; // 60 sekund

let gamblingUsers: Record<string, GamblingUserData> = {};

// Ładowanie danych z pliku
if (fs.existsSync(DATA_FILE)) {
  gamblingUsers = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
}

// Zapisywanie danych do pliku
function saveUsers() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(gamblingUsers, null, 2));
}

export const handleGambling = (
  client: tmi.Client,
  channel: string,
  userstate: tmi.ChatUserstate,
  message: string,
) => {
  if (!message.startsWith("!")) return;
  if (!userstate.username) return;

  if (!(userstate.username in gamblingUsers)) {
    gamblingUsers[userstate.username] = {
      points: 1000,
      lastBet: 0,
      debt: 0,
      lastLoan: 0,
    };
  }

  logger.info(`Gambling: ${message} by ${userstate.username}`);

  const user = gamblingUsers[userstate.username];
  const now = Date.now();

  if (message.startsWith("!obstaw")) {
    const args = message.trim().split(" ");
    const amount = parseInt(args[1]);

    if (isNaN(amount) || amount <= 0) {
      client.say(
        channel,
        `@${userstate.username}, wpisz poprawną liczbę punktów do obstawienia. hazard`,
      );
      return;
    }

    if (now - user.lastBet < COOLDOWN) {
      const wait = Math.ceil((COOLDOWN - (now - user.lastBet)) / 1000);
      client.say(
        channel,
        `@${userstate.username}, poczekaj ${wait}s przed kolejnym obstawieniem. hazard`,
      );
      return;
    }

    if (user.points < amount) {
      client.say(
        channel,
        `@${userstate.username}, masz tylko ${user.points} punktów. hazard`,
      );
      return;
    }

    const win = Math.random() < STANDARD_MULTIPLIER;

    if (win) {
      user.points += amount;
      client.say(
        channel,
        `🎉 @${userstate.username} wygrał(a) ${amount} punktów! Masz teraz ${user.points}. hazard`,
      );
    } else {
      user.points -= amount;
      client.say(
        channel,
        `💥 @${userstate.username} przegrał(a) ${amount} punktów... Masz teraz ${user.points}. hazard`,
      );
    }

    user.lastBet = now;
    saveUsers();
  }

  if (message === "!pozyczka") {
    if (user.points > 0) {
      client.say(
        channel,
        `@${userstate.username}, pożyczki tylko przy zerowym saldzie.`,
      );
      return;
    }

    if (user.debt && user.debt >= MAX_DEBT) {
      client.say(
        channel,
        `@${userstate.username}, masz już za dużo długu (${user.debt}).`,
      );
      return;
    }

    if (now - (user.lastLoan || 0) < COOLDOWN_LOAN) {
      const wait = Math.ceil(
        (COOLDOWN_LOAN - (now - (user.lastLoan || 0))) / 1000,
      );
      client.say(
        channel,
        `@${userstate.username}, poczekaj ${wait}s na kolejną pożyczkę.`,
      );
      return;
    }

    user.points += 1000;
    user.debt = (user.debt || 0) + 1000;
    user.lastLoan = now;
    client.say(
      channel,
      `💸 @${userstate.username}, otrzymujesz pożyczkę 1000 punktów. Twój dług: ${user.debt}.`,
    );
    saveUsers();
  }

  if (message === "!saldo") {
    client.say(
      channel,
      `@${userstate.username}, punkty: ${user.points}, dług: ${user.debt || 0}`,
    );
  }

  if (message === "!punkty") {
    if (!(userstate.username in gamblingUsers)) {
      gamblingUsers[userstate.username] = { points: 10, lastBet: 0 };
      saveUsers();
    }

    client.say(
      channel,
      `@${userstate.username}, masz ${gamblingUsers[userstate.username].points} punktów. hazard`,
    );
  }

  if (message === "!topdluznicy" || message === "!dlugi") {
    const top = Object.entries(gamblingUsers)
      .filter(([_, data]) => (data.debt || 0) > 0)
      .sort((a, b) => (b[1].debt || 0) - (a[1].debt || 0))
      .slice(0, 5);

    if (top.length === 0) {
      client.say(channel, `💳 Nikt jeszcze nie ma długu. Czat czysty jak łza.`);
    } else {
      const msg = top
        .map(([user, data], i) => `${i + 1}. ${user}: ${data.debt} pkt`)
        .join(" | ");
      client.say(channel, `📉 Top dłużnicy: ${msg}`);
    }
  }

  if (message === "!topbogacze") {
    const top = Object.entries(gamblingUsers)
      .filter(([_, data]) => data.points > 0)
      .sort((a, b) => b[1].points - a[1].points)
      .slice(0, 5);

    if (top.length === 0) {
      client.say(channel, `😔 Nikt jeszcze nie ma punktów. Czat zbiedniał.`);
    } else {
      const msg = top
        .map(([user, data], i) => `${i + 1}. ${user}: ${data.points} pkt`)
        .join(" | ");
      client.say(channel, `💰 Top bogacze: ${msg}`);
    }
  }
};

setInterval(() => {
  let anyChange = false;

  for (const [user, data] of Object.entries(gamblingUsers)) {
    if (data.debt && data.debt > 0 && data.debt < MAX_DEBT * 2) {
      data.debt += 1;
      anyChange = true;
    }
  }

  if (anyChange) {
    saveUsers();
    console.log("💰 Odsetki naliczone.");
  }
}, INTEREST_INTERVAL);

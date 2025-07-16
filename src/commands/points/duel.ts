import tmi from "tmi.js";
import {
  changePoints,
  getPointsUser,
  updateDuelStats,
} from "../../database/points.manager";
import { getPointsDb } from "../../database/connection";

const COOLDOWN_DUEL = 60 * 1000;
export const DUEL_EXPIRATION = 3 * 60 * 1000;
const DUEL_CHANCE = 0.5;

const pendingDuels: {
  [targetUsername: string]: {
    challenger: string;
    amount: number;
    timestamp: number;
  };
} = {};

export const handleDuelChallenge = (
  client: tmi.Client,
  channel: string,
  username: string,
  target: string,
  amount: number,
  now: number,
) => {
  if (target.toLowerCase() === username) {
    client.say(channel, `@${username}, nie możesz wyzwać samego siebie.`);
    return;
  }

  const challenger = getPointsUser(username);
  const opponent = getPointsUser(target.toLowerCase());

  if (!opponent) {
    client.say(channel, `@${username}, nie znaleziono użytkownika ${target}.`);
    return;
  }

  if (!challenger || challenger.points < amount || opponent.points < amount) {
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
};

export const handleDuelAcceptance = (
  client: tmi.Client,
  channel: string,
  username: string,
  now: number,
) => {
  const pending = pendingDuels[username];
  if (!pending) {
    client.say(
      channel,
      `@${username}, nie masz żadnych wyzwań do zaakceptowania.`,
    );
    return;
  }

  const challenger = getPointsUser(pending.challenger);
  const opponent = getPointsUser(username);
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

  const db = getPointsDb();
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
};

export const cleanupExpiredDuels = () => {
  const now = Date.now();
  for (const [target, data] of Object.entries(pendingDuels)) {
    if (now - data.timestamp > DUEL_EXPIRATION) {
      delete pendingDuels[target];
    }
  }
};

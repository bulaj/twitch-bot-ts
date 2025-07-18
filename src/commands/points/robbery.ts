import {
  changePoints,
  getPointsUser,
  PointsUser,
  updateRobberyStats,
} from "../../database/points.manager";
import tmi from "tmi.js";
import { getPointsDb } from "../../database/connection";
import { getDisplayName } from "../../services/displayName.service";

const COOLDOWN_ROBBERY = 5 * 60 * 1000; // 5 minut cooldown na napad
const ROBBERY_CHANCE = 0.333;
export const handleRobbery = (
  client: tmi.Client,
  channel: string,
  userstate: tmi.ChatUserstate,
  message: string,
  user: PointsUser,
  now: number,
) => {
  if (!userstate.username) return;

  const args = message.trim().split(" ");
  const target = args[1]?.startsWith("@") ? args[1].substring(1) : args[1];
  const amount = parseInt(args[2]);

  if (!target || isNaN(amount) || amount <= 0) {
    client.say(
      channel,
      `@${getDisplayName(userstate)}, użycie: !napad @nick <kwota>`,
    );
    return;
  }

  if (target.toLowerCase() === userstate.username.toLowerCase()) {
    client.say(
      channel,
      `@${getDisplayName(userstate)}, nie możesz napaść na siebie.`,
    );
    return;
  }

  const db = getPointsDb();
  const victim = getPointsUser(target.toLowerCase());

  if (!victim) {
    client.say(
      channel,
      `@${getDisplayName(userstate)}, nie znaleziono użytkownika ${target}.`,
    );
    return;
  }

  if (user.points < amount) {
    client.say(
      channel,
      `@${getDisplayName(userstate)}, nie masz tyle punktów, by ryzykować ${amount}.`,
    );
    return;
  }

  if (victim.points < amount) {
    client.say(
      channel,
      `@${getDisplayName(userstate)}, cel ma mniej niż ${amount} punktów.`,
    );
    return;
  }

  if (now - user.lastRobbery < COOLDOWN_ROBBERY) {
    const wait = Math.ceil(
      (COOLDOWN_ROBBERY - (now - user.lastRobbery)) / 1000,
    );
    client.say(
      channel,
      `@${getDisplayName(userstate)}, odczekaj ${wait}s przed kolejnym napadem.`,
    );
    return;
  }

  const success = Math.random() < ROBBERY_CHANCE;

  if (success) {
    changePoints(getDisplayName(user), amount);
    changePoints(victim.username, -amount);

    client.say(
      channel,
      `💥 @${getDisplayName(user)} udany napad na @${getDisplayName(victim)}, zdobycz: ${amount} punktów!`,
    );
  } else {
    changePoints(getDisplayName(user), -amount);

    client.say(
      channel,
      `❌ @${getDisplayName(user)} nie udał się napad na @${getDisplayName(victim)}, strata: ${amount} punktów!`,
    );
  }

  updateRobberyStats(getDisplayName(user), success);

  db.prepare(`UPDATE users SET lastRobbery = ? WHERE username = ?`).run(
    now,
    user.username,
  );
};

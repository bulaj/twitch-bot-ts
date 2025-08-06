import { changeActivityPoints, getPointsUser, LowercaseString } from "@twitch-bot-ts/shared";
import { logger } from "../services/logger.service";
import tmi from "tmi.js";

const ACTIVITY_COOLDOWN_MS = 30 * 1000;
const lastActivity: Map<string, number> = new Map();

const plusMinusNine = (n: number): number => {
  const offset = Math.floor(Math.random() * 19) - 9; // losowa liczba z przedziału [-9, 9]
  return n + offset;
};
const getMessagePoints = (message: string): number => {
  if (message.length >= 320) return plusMinusNine(100);
  if (message.length >= 160) return plusMinusNine(50);
  if (message.length >= 20) return plusMinusNine(30);
  return plusMinusNine(10);
};

const isHappyHour = (): boolean => {
  const hour = new Date().getHours();
  return hour >= 0 && hour < 5; // 00:00 – 05:00
};
export const handleActivityPoints = (
  channel: string,
  userstate: tmi.ChatUserstate,
  message: string,
) => {
  if (!userstate.username) return;

  const username = userstate.username.toLowerCase() as LowercaseString;
  const displayName = userstate["display-name"] || username;
  const now = Date.now();
  const lastUsed = lastActivity.get(username);

  if (lastUsed && now - lastUsed < ACTIVITY_COOLDOWN_MS) {
    return;
  }

  const user = getPointsUser(username);
  if (!user) return;

  const points = getMessagePoints(message);
  const bonus = Math.random() < 0.05 ? 100 : 0;
  const multiplier = isHappyHour() ? 2 : 1;

  const total = (points + bonus) * multiplier;

  changeActivityPoints(username, displayName, total);
  lastActivity.set(username, now);

  logger.info(
    `${username} dostał ${total} punktów za aktywność (bazowe: ${points}, bonus: ${bonus}, mnożnik: x${multiplier})`,
  );
};

import { changePoints, getPointsUser } from "../database/points.manager";
import { logger } from "../services/logger.service";
import tmi from "tmi.js";

const ACTIVITY_COOLDOWN_MS = 30 * 1000;
const lastActivity: Map<string, number> = new Map();

const getMessagePoints = (message: string): number => {
  if (message.length >= 80) return 50;
  if (message.length >= 40) return 40;
  if (message.length >= 20) return 30;
  return 10;
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

  const username = userstate.username.toLowerCase();
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

  changePoints(username, total);
  lastActivity.set(username, now);

  logger.info(
    `${username} dostał ${total} punktów za aktywność (bazowe: ${points}, bonus: ${bonus}, mnożnik: x${multiplier})`,
  );
};

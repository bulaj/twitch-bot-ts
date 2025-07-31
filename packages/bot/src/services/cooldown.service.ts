type CooldownKey = string; // np. "rep", "duel", "napad"
type Username = string;

interface CooldownEntry {
  timestamp: number;
}

const cooldowns: Map<Username, Map<CooldownKey, CooldownEntry>> = new Map();

export const isOnCooldown = (
  username: string,
  key: CooldownKey,
  durationMs: number,
): boolean => {
  const userCooldowns = cooldowns.get(username);
  if (!userCooldowns) return false;

  const entry = userCooldowns.get(key);
  if (!entry) return false;

  const now = Date.now();
  return now - entry.timestamp < durationMs;
};

export const setCooldown = (username: string, key: CooldownKey): void => {
  const now = Date.now();
  let userCooldowns = cooldowns.get(username);

  if (!userCooldowns) {
    userCooldowns = new Map();
    cooldowns.set(username, userCooldowns);
  }

  userCooldowns.set(key, { timestamp: now });
};

export const clearCooldown = (username: string, key: CooldownKey): void => {
  const userCooldowns = cooldowns.get(username);
  if (!userCooldowns) return;

  userCooldowns.delete(key);
};

export const getRemainingCooldown = (
  username: string,
  key: CooldownKey,
  durationMs: number,
): number => {
  const userCooldowns = cooldowns.get(username);
  if (!userCooldowns) return 0;

  const entry = userCooldowns.get(key);
  if (!entry) return 0;

  const now = Date.now();
  const remaining = durationMs - (now - entry.timestamp);
  return Math.max(0, remaining);
};

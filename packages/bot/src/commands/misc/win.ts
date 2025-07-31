import { SimpleCommand } from "./command.interface";
import { Client } from "tmi.js";

const COOLDOWN_MS = 60 * 1000;
const cooldowns = new Map<string, number>();

export const WinCommand: SimpleCommand = {
  name: "wygra",
  description: "Losuje szansę, że Redaktor dzisiaj wygra. Użycie: !wygra",
  execute(client: Client, channel, userstate) {
    if (!userstate.username) return;
    const username = userstate.username.toLowerCase();
    const now = Date.now();

    const lastUsed = cooldowns.get(username);
    if (lastUsed && now - lastUsed < COOLDOWN_MS) {
      const wait = Math.ceil((COOLDOWN_MS - (now - lastUsed)) / 1000);
      client.say(
        channel,
        `@${username}, poczekaj ${wait}s przed kolejnym wywołaniem.`,
      );
      return;
    }

    cooldowns.set(username, now);
    const szansa = Math.floor(Math.random() * 101); // 0-100%

    client.say(
      channel,
      `@${username}, szansa, że Redaktor dzisiaj wygra, wynosi ${szansa}%!`,
    );
  },
};

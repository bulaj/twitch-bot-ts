import { SimpleCommand } from "../command.interface";
import { chleby } from "./constants";

const COOLDOWN_TIME = 60 * 1000; // seconds
const lastUsed = new Map<string, number>();

function losujChleb() {
  const randomIndex = Math.floor(Math.random() * chleby.length);
  const chleb = chleby[randomIndex];

  return `${chleb.nazwa} - ${chleb.opis}`;
}

function isOnCooldown(username: string): boolean {
  const lastUseTime = lastUsed.get(username);
  if (!lastUseTime) return false;

  const timePassed = Date.now() - lastUseTime;
  return timePassed < COOLDOWN_TIME;
}

export const ChlebCommand: SimpleCommand = {
  name: "chleb",
  description: 'Mówi jakim chlebem jesteś"',
  execute(client, channel, userstate) {
    if (!userstate.username) return;

    if (isOnCooldown(userstate.username)) {
      const remainingTime = Math.ceil(
        (COOLDOWN_TIME -
          (Date.now() - (lastUsed.get(userstate.username) || 0))) /
          1000,
      );
      client.say(
        channel,
        `@${userstate.username}, musisz poczekać jeszcze ${remainingTime} sekund przed ponownym użyciem tej komendy!`,
      );
      return;
    }

    const chleb = losujChleb();
    const chuj = chleb.replace("Chleb", "Chuj").replace("chleb", "chuj");

    lastUsed.set(userstate.username, Date.now());

    client.say(channel, `@${userstate.username} Twój chleb to: ${chuj}`);
  },
};

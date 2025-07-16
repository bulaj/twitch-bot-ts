import { SimpleCommand } from "../command.interface";
import {
  changeReputation,
  getReputationUser,
} from "../../database/reputation.manager";

const REP_COOLDOWN = 60 * 1000; // 60 sekund
const repCooldowns: Record<string, number> = {}; // username → timestamp
export const RepCommand: SimpleCommand = {
  name: "rep",
  description:
    "Zarządza reputacją użytkowników. Użycie: !rep @uzytkownik, !rep+ @uzytkownik, !rep- @uzytkownik",
  execute(client, channel, userstate, message, args) {
    const action = message.split(" ")[0].slice(1);
    const targetUser = args[0]?.startsWith("@")
      ? args[0].substring(1)
      : args[0];

    if (!targetUser || userstate.username === undefined) {
      client.say(
        channel,
        `@${userstate.username}, musisz podać nick użytkownika!`,
      );
      return;
    }

    if (targetUser.toLowerCase() === userstate.username.toLowerCase()) {
      client.say(
        channel,
        `@${userstate.username}, nie możesz zmieniać własnej reputacji.`,
      );
      return;
    }

    switch (action) {
      case "rep+":
      case "rep-": {
        const now = Date.now();
        const key = userstate.username!.toLowerCase();
        const lastUsed = repCooldowns[key] || 0;

        if (now - lastUsed < REP_COOLDOWN) {
          const wait = Math.ceil((REP_COOLDOWN - (now - lastUsed)) / 1000);
          client.say(
            channel,
            `@${userstate.username}, poczekaj ${wait}s przed kolejną zmianą reputacji.`,
          );
          return;
        }

        // zaktualizuj cooldown
        repCooldowns[key] = now;

        const change = action === "rep+" ? 1 : -1;
        const newRep = changeReputation(targetUser, change);

        client.say(
          channel,
          `${action === "rep+" ? "Dodałeś" : "Odjąłeś"} punkt reputacji dla ${targetUser}! Ma teraz ${newRep} pkt.`,
        );
        break;
      }

      case "rep": {
        const user = getReputationUser(targetUser);
        const rep = user ? user.reputation : 0;
        client.say(
          channel,
          `Użytkownik ${targetUser} ma ${rep} punktów reputacji.`,
        );
        break;
      }
    }
  },
};

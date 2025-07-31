import { SimpleCommand } from "../misc/command.interface";
import {
  changeReputation,
  getReputationUser,
  getTopReputationUsers,
} from "@twitch-bot-ts/shared";
import {
  getRemainingCooldown,
  isOnCooldown,
  setCooldown,
} from "../../services/cooldown.service";

const REP_COOLDOWN = 60 * 1000; // 60 sekund
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

    if (action === "rep" && args[0]?.toLowerCase() === "top") {
      // Pobierz top 5 i wyświetl
      const topUsers = getTopReputationUsers(5);
      if (topUsers.length === 0) {
        client.say(channel, `Brak danych o reputacji użytkowników.`);
        return;
      }

      const leaderboard = topUsers
        .map((u, i) => `${i + 1}. ${u.username} (${u.reputation} pkt)`)
        .join(" | ");

      client.say(channel, `Top 5 użytkowników wg reputacji: ${leaderboard}`);
      return;
    }

    switch (action) {
      case "rep+":
      case "rep-": {
        if (isOnCooldown(userstate.username, "rep", REP_COOLDOWN)) {
          const wait = Math.ceil(
            getRemainingCooldown(userstate.username, "rep", REP_COOLDOWN) /
              1000,
          );
          client.say(
            channel,
            `@${userstate.username}, poczekaj ${wait}s przed kolejną zmianą reputacji.`,
          );
          return;
        }

        setCooldown(userstate.username, "rep");

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

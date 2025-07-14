import { Command } from "../command.interface";
import { changeReputation, getUser } from "../../database/reputation.manager";

export const RepCommand: Command = {
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
        const newRepPlus = changeReputation(targetUser, 1);
        client.say(
          channel,
          `Dodałeś punkt reputacji dla ${targetUser}! Ma teraz ${newRepPlus} pkt.`,
        );
        break;
      case "rep-":
        const newRepMinus = changeReputation(targetUser, -1);
        client.say(
          channel,
          `Odjąłeś punkt reputacji dla ${targetUser}! Ma teraz ${newRepMinus} pkt.`,
        );
        break;
      case "rep":
        const user = getUser(targetUser);
        const rep = user ? user.reputation : 0;
        client.say(
          channel,
          `Użytkownik ${targetUser} ma ${rep} punktów reputacji.`,
        );
        break;
    }
  },
};

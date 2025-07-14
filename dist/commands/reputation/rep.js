"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepCommand = void 0;
const reputation_manager_1 = require("../../database/reputation.manager");
exports.RepCommand = {
    name: "rep",
    description: "Zarządza reputacją użytkowników. Użycie: !rep @uzytkownik, !rep+ @uzytkownik, !rep- @uzytkownik",
    execute(client, channel, userstate, message, args) {
        const action = message.split(" ")[0].slice(1);
        const targetUser = args[0]?.startsWith("@")
            ? args[0].substring(1)
            : args[0];
        if (!targetUser) {
            client.say(channel, `@${userstate.username}, musisz podać nick użytkownika!`);
            return;
        }
        if (targetUser.toLowerCase() === userstate.username.toLowerCase()) {
            client.say(channel, `@${userstate.username}, nie możesz zmieniać własnej reputacji.`);
            return;
        }
        switch (action) {
            case "rep+":
                const newRepPlus = reputation_manager_1.ReputationManager.changeReputation(targetUser, 1);
                client.say(channel, `Dodałeś punkt reputacji dla ${targetUser}! Ma teraz ${newRepPlus} pkt.`);
                break;
            case "rep-":
                const newRepMinus = reputation_manager_1.ReputationManager.changeReputation(targetUser, -1);
                client.say(channel, `Odjąłeś punkt reputacji dla ${targetUser}! Ma teraz ${newRepMinus} pkt.`);
                break;
            case "rep":
                const user = reputation_manager_1.ReputationManager.getUser(targetUser);
                const rep = user ? user.reputation : 0;
                client.say(channel, `Użytkownik ${targetUser} ma ${rep} punktów reputacji.`);
                break;
        }
    },
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PingCommand = void 0;
exports.PingCommand = {
    name: "ping",
    description: 'Odpowiada "Pong!"',
    execute(client, channel) {
        client.say(channel, "Pong!");
    },
};

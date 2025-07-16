import { SimpleCommand } from "./command.interface";

export const PingCommand: SimpleCommand = {
  name: "ping",
  description: 'Odpowiada "Pong!"',
  execute(client, channel) {
    setTimeout(() => {
      client.say(channel, "Pong!");
    }, 1000);
  },
};

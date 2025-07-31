import { SimpleCommand } from "./command.interface";

export const NootCommand: SimpleCommand = {
  name: "noot",
  description: 'Odpowiada "!noot"',
  execute(client, channel) {
    setTimeout(() => {
      client.say(channel, "!noot");
    }, 1000);
  },
};

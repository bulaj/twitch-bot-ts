import { SimpleCommand } from "../command.interface";

export const ZerkCommand: SimpleCommand = {
  name: "zerk",
  description: "Odpowiada na zerk!",
  execute(client, channel) {
    client.say(channel, "Hahaha, znowu zerknal!");
    setTimeout(() => {}, 1000);
  },
};

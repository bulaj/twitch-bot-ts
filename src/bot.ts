import tmi from "tmi.js";
import { config } from "./config";
import { initDb } from "./database/connection";
import { logger } from "./services/logger.service";
import { handleSimpleCommand } from "./commands/misc";
import { handlePointsCommands } from "./commands/points";

initDb();

const options: tmi.Options = {
  identity: {
    username: config.twitch.username,
    password: config.twitch.oauthToken,
  },
  connection: {
    reconnect: true,
    secure: true,
  },
  channels: config.twitch.channels,
};

const client = new tmi.Client(options);

const onConnect = (address: string, port: number) => {
  logger.info(`Bot connected to ${address}:${port}`);
};

const handleMessage = (
  channel: string,
  userstate: tmi.ChatUserstate,
  message: string,
  self: boolean,
) => {
  if (self) return;

  if (!userstate.username) {
    return;
  }

  setTimeout(() => {
    handlePointsCommands(client, channel, userstate, message);
    handleSimpleCommand(client, channel, userstate, message);
  }, 2000);
};

const handleError = (err: Error) => {
  logger.error("Failed to connect:", err);
};

client.on("connected", onConnect);
client.on("message", handleMessage);
client.connect().catch(handleError);

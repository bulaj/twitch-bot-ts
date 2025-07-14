import tmi from "tmi.js";
import { config } from "./config";
import { handleCommand } from "./commands";
import { initDb } from "./database/connection";
import { logger } from "./services/logger.service";

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

const onMessage = (
  channel: string,
  userstate: tmi.ChatUserstate,
  message: string,
  self: boolean,
) => {
  if (self) return;
  handleCommand(client, channel, userstate, message);
};

const onError = (err: Error) => {
  logger.error("Failed to connect:", err);
};

client.on("connected", onConnect);
client.on("message", onMessage);
client.connect().catch(onError);

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
};

const client = new tmi.Client(options);

client.on("connected", (address, port) => {
  logger.info(`Bot connected to ${address}:${port}`);
});

client.on("message", (channel, userstate, message, self) => {
  if (self) return;
  handleCommand(client, channel, userstate, message);
});

client.connect().catch((err) => {
  logger.error("Failed to connect:", err);
});

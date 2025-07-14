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
  channels: config.twitch.channels,
  connection: {
    reconnect: true,
    secure: true,
  },
};

if (config.nodeEnv === "local") {
  options.connection = {
    server: config.localChat.host,
    port: config.localChat.port,
    reconnect: true,
  };
  // W trybie lokalnym kanał jest symulowany
  options.channels = ["#localdev"];
}

const client = new tmi.Client(options);

client.on("connected", (address, port) => {
  logger.info(`Bot connected to ${address}:${port}`);
});

client.on("message", (channel, userstate, message, self) => {
  if (self) return;
  handleCommand(client, channel, userstate, message);
});

client.connect().catch((err) => {
  console.log(options);
  logger.error("Failed to connect:", err);
});

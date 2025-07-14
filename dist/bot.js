"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tmi_js_1 = __importDefault(require("tmi.js"));
const config_1 = require("./config");
const commands_1 = require("./commands");
const connection_1 = require("./database/connection");
const logger_service_1 = require("./services/logger.service");
(0, connection_1.initDb)();
const options = {
    identity: {
        username: config_1.config.twitch.username,
        password: config_1.config.twitch.oauthToken,
    },
    connection: {
        reconnect: true,
        secure: true,
    },
};
const client = new tmi_js_1.default.Client(options);
client.on("connected", (address, port) => {
    logger_service_1.logger.info(`Bot connected to ${address}:${port}`);
});
client.on("message", (channel, userstate, message, self) => {
    if (self)
        return;
    (0, commands_1.handleCommand)(client, channel, userstate, message);
});
client.connect().catch((err) => {
    logger_service_1.logger.error("Failed to connect:", err);
});

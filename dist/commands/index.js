"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCommand = handleCommand;
const ping_1 = require("./misc/ping");
const weather_1 = require("./weather/weather");
const rep_1 = require("./reputation/rep");
const songrequest_1 = require("./music/songrequest");
const logger_service_1 = require("../services/logger.service");
const commands = [
    ping_1.PingCommand,
    weather_1.WeatherCommand,
    rep_1.RepCommand,
    songrequest_1.SongRequestCommand,
];
function handleCommand(client, channel, userstate, message) {
    if (!message.startsWith("!"))
        return;
    const [commandName, ...args] = message.slice(1).split(/\s+/);
    const commandToExecute = commands.find((c) => c.name === commandName.toLowerCase() ||
        (c.name === "rep" && (commandName === "rep+" || commandName === "rep-")));
    if (commandToExecute) {
        logger_service_1.logger.info(`Executing command: !${commandName} by ${userstate.username}`);
        commandToExecute.execute(client, channel, userstate, message, args);
    }
    else {
        logger_service_1.logger.warn(`Unknown command: !${commandName} by ${userstate.username}`);
    }
}

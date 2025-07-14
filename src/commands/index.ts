import tmi from "tmi.js";
import { Command } from "./command.interface";
import { PingCommand } from "./misc/ping";
import { WeatherCommand } from "./weather/weather";
import { RepCommand } from "./reputation/rep";
import { SongRequestCommand } from "./music/songrequest";
import { logger } from "../services/logger.service";

const commands: Command[] = [
  PingCommand,
  WeatherCommand,
  RepCommand,
  SongRequestCommand,
];

export function handleCommand(
  client: tmi.Client,
  channel: string,
  userstate: tmi.Userstate,
  message: string,
) {
  if (!message.startsWith("!")) return;

  const [commandName, ...args] = message.slice(1).split(/\s+/);
  const commandToExecute = commands.find(
    (c) =>
      c.name === commandName.toLowerCase() ||
      (c.name === "rep" && (commandName === "rep+" || commandName === "rep-")),
  );

  if (commandToExecute) {
    logger.info(`Executing command: !${commandName} by ${userstate.username}`);
    commandToExecute.execute(client, channel, userstate, message, args);
  } else {
    logger.warn(`Unknown command: !${commandName} by ${userstate.username}`);
  }
}

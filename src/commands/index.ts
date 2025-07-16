import tmi from "tmi.js";
import { SimpleCommand } from "./command.interface";
import { PingCommand } from "./misc/ping";
import { WeatherCommand } from "./weather/weather";
import { RepCommand } from "./reputation/reputation";
import { SongRequestCommand } from "./music/songrequest";
import { logger } from "../services/logger.service";
import { NootCommand } from "./misc/noot";
import { ZerkCommand } from "./misc/zerk";
import { ChlebCommand } from "./misc/chleb";
import { EightBallCommand } from "./misc/eighball";

const commands: SimpleCommand[] = [
  PingCommand,
  ZerkCommand,
  ChlebCommand,
  NootCommand,
  WeatherCommand,
  RepCommand,
  SongRequestCommand,
  EightBallCommand,
];

export const handleCommand = (
  client: tmi.Client,
  channel: string,
  userstate: tmi.ChatUserstate,
  message: string,
): void => {
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
  }
  // else {
  //   logger.warn(`Unknown command: !${commandName} by ${userstate.username}`);
  // }
};

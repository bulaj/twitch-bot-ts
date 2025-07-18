import tmi from "tmi.js";
import { SimpleCommand } from "./command.interface";
import { PingCommand } from "./ping";
import { RepCommand } from "../reputation/reputation";
import { logger } from "../../services/logger.service";
import { NootCommand } from "./noot";
import { ZerkCommand } from "./zerk";
import { ChlebCommand } from "./chleb";
import { EightBallCommand } from "./eighball";
import { WinCommand } from "./win";

const commands: SimpleCommand[] = [
  PingCommand,
  ZerkCommand,
  ChlebCommand,
  NootCommand,
  RepCommand,
  EightBallCommand,
  WinCommand,
];

export const handleSimpleCommand = (
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

import tmi from "tmi.js";
import { handleActivityPoints } from "./activityPoints";
import { logger } from "../services/logger.service";

export const handleAnyMessage = (
  channel: string,
  userstate: tmi.ChatUserstate,
  message: string,
) => {
  if (!userstate.username) return;
  logger.info(channel, userstate.username, message);
  handleActivityPoints(channel, userstate, message);
};

import tmi from "tmi.js";
import { handleActivityPoints } from "./activityPoints";

export const handleAnyMessage = (
  channel: string,
  userstate: tmi.ChatUserstate,
  message: string,
) => {
  if (!userstate.username) return;

  handleActivityPoints(channel, userstate, message);
};

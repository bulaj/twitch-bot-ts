import tmi from "tmi.js";
export type DisplayName = string;
export const getDisplayName = (user: tmi.ChatUserstate): DisplayName => {
  if (user.username) {
    return user["display-name"] || user.displayName || user.username;
  }
  return "[bn]";
};

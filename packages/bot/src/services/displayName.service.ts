import tmi from "tmi.js";

export const getDisplayName = (user: tmi.ChatUserstate) => {
  if (user.username) {
    return user["display-name"] || user.displayName || user.username;
  }
  return "[bn]";
};

import tmi from "tmi.js";

export interface Command {
  name: string;
  description: string;
  execute(
    client: tmi.Client,
    channel: string,
    userstate: tmi.Userstate,
    message: string,
    args: string[],
  ): void;
}

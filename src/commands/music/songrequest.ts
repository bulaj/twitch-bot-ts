import { Command } from "../command.interface";
import { musicService } from "../../services/music.service";

export const SongRequestCommand: Command = {
  name: "sr",
  description: "Dodaje piosenkę z YouTube do kolejki. Użycie: !sr <link>",
  async execute(client, channel, userstate, message, args) {
    const url = args[0];
    if (!url) {
      client.say(channel, `Użycie: !sr <link do YouTube>`);
      return;
    }

    const song = await musicService.addSong(url, userstate.username);

    if (song) {
      client.say(
        channel,
        `@${userstate.username}, dodano do kolejki: "${song.title}".`,
      );
    } else {
      client.say(
        channel,
        `@${userstate.username}, nieprawidłowy link do YouTube lub wystąpił błąd.`,
      );
    }
  },
};

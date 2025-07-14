"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SongRequestCommand = void 0;
const music_service_1 = require("../../services/music.service");
exports.SongRequestCommand = {
    name: "sr",
    description: "Dodaje piosenkę z YouTube do kolejki. Użycie: !sr <link>",
    async execute(client, channel, userstate, message, args) {
        const url = args[0];
        if (!url) {
            client.say(channel, `Użycie: !sr <link do YouTube>`);
            return;
        }
        const song = await music_service_1.musicService.addSong(url, userstate.username);
        if (song) {
            client.say(channel, `@${userstate.username}, dodano do kolejki: "${song.title}".`);
        }
        else {
            client.say(channel, `@${userstate.username}, nieprawidłowy link do YouTube lub wystąpił błąd.`);
        }
    },
};

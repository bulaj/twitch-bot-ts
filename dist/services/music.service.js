"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.musicService = void 0;
const ytdl_core_1 = __importDefault(require("ytdl-core"));
const logger_service_1 = require("./logger.service");
class MusicService {
    queue = [];
    async addSong(url, requestedBy) {
        try {
            if (!ytdl_core_1.default.validateURL(url)) {
                return null;
            }
            const info = await ytdl_core_1.default.getInfo(url);
            const song = {
                title: info.videoDetails.title,
                url,
                requestedBy,
            };
            this.queue.push(song);
            logger_service_1.logger.info(`Added to queue: ${song.title}`);
            return song;
        }
        catch (error) {
            logger_service_1.logger.error("Error adding song:", error);
            return null;
        }
    }
    getQueue() {
        return this.queue;
    }
    nextSong() {
        return this.queue.shift();
    }
}
exports.musicService = new MusicService();

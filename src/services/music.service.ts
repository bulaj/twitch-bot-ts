import ytdl from 'ytdl-core';
import { logger } from './logger.service';

interface Song {
    title: string;
    url: string;
    requestedBy: string;
}

class MusicService {
    private queue: Song[] = [];

    async addSong(url: string, requestedBy: string): Promise<Song | null> {
        try {
            if (!ytdl.validateURL(url)) {
                return null;
            }
            const info = await ytdl.getInfo(url);
            const song: Song = {
                title: info.videoDetails.title,
                url,
                requestedBy,
            };
            this.queue.push(song);
            logger.info(`Added to queue: ${song.title}`);
            return song;
        } catch (error) {
            logger.error('Error adding song:', error);
            return null;
        }
    }

    getQueue(): Song[] {
        return this.queue;
    }

    nextSong(): Song | undefined {
        return this.queue.shift();
    }
}

export const musicService = new MusicService();

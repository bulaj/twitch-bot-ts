import ytdl from "ytdl-core";
import { logger } from "./logger.service";

interface Song {
  title: string;
  url: string;
  requestedBy: string;
}

interface MusicServiceType {
  addSong: (url: string, requestedBy: string) => Promise<Song | null>;
  getQueue: () => Song[];
  nextSong: () => Song | undefined;
}

export const createMusicService = (): MusicServiceType => {
  const queue: Song[] = [];

  const addSong = async (url: string, requestedBy: string): Promise<Song | null> => {
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
      queue.push(song);
      logger.info(`Added to queue: ${song.title}`);
      return song;
    } catch (error) {
      logger.error("Error adding song:", error);
      return null;
    }
  };

  const getQueue = (): Song[] => {
    return [...queue];
  };

  const nextSong = (): Song | undefined => {
    return queue.shift();
  };

  return {
    addSong,
    getQueue,
    nextSong,
  };
};

export const musicService = createMusicService();

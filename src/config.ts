import dotenv from "dotenv";
dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || "local",
  twitch: {
    username: process.env.TWITCH_BOT_USERNAME,
    oauthToken: process.env.TWITCH_OAUTH_TOKEN,
    channels: [process.env.TWITCH_CHANNEL],
  },
  weather: {
    apiKey: process.env.WEATHER_API_KEY,
  },
  localChat: {
    host: "localhost",
    port: 6667,
  },
};

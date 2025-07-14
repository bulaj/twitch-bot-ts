import dotenv from "dotenv";
dotenv.config();

interface Config {
  nodeEnv: string;
  twitch: {
    username: string;
    oauthToken: string;
    channels: string[];
  };
  weather: {
    apiKey: string;
  };
}

function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Brakuje wymaganej zmiennej środowiskowej: ${name}`);
  }
  return value;
}

function createConfig(): Config {
  return {
    nodeEnv: process.env.NODE_ENV || "local",
    twitch: {
      username: getEnvVar("TWITCH_BOT_USERNAME"),
      oauthToken: getEnvVar("TWITCH_OAUTH_TOKEN"),
      channels: [getEnvVar("TWITCH_CHANNEL")],
    },
    weather: {
      apiKey: getEnvVar("WEATHER_API_KEY"),
    },
  };
}

export const config = createConfig();

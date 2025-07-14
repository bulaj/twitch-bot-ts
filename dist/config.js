"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    nodeEnv: process.env.NODE_ENV || "local",
    twitch: {
        username: process.env.TWITCH_BOT_USERNAME,
        oauthToken: process.env.TWITCH_OAUTH_TOKEN,
        channels: [process.env.TWITCH_CHANNEL],
    },
    weather: {
        apiKey: process.env.WEATHER_API_KEY,
    },
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeatherCommand = void 0;
const weather_service_1 = require("../../services/weather.service");
exports.WeatherCommand = {
    name: "pogoda",
    description: "Wyświetla aktualną pogodę dla podanego miasta.",
    async execute(client, channel, userstate, message, args) {
        const city = args.join(" ");
        if (!city) {
            client.say(channel, `@${userstate.username}, podaj nazwę miasta, np. !pogoda Warszawa`);
            return;
        }
        const weatherInfo = await (0, weather_service_1.getWeather)(city);
        client.say(channel, weatherInfo);
    },
};

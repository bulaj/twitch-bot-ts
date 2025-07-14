import { Command } from "../command.interface";
import { getWeather } from "../../services/weather.service";

export const WeatherCommand: Command = {
  name: "pogoda",
  description: "Wyświetla aktualną pogodę dla podanego miasta.",
  async execute(client, channel, userstate, message, args) {
    const city = args.join(" ");
    if (!city) {
      client.say(
        channel,
        `@${userstate.username}, podaj nazwę miasta, np. !pogoda Warszawa`,
      );
      return;
    }
    const weatherInfo = await getWeather(city);
    client.say(channel, weatherInfo);
  },
};

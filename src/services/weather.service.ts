import axios from "axios";
import { config } from "../config";

const API_URL = "http://api.openweathermap.org/data/2.5/weather";

export async function getWeather(city: string): Promise<string> {
  if (!config.weather.apiKey) {
    return "Klucz API do prognozy pogody nie został skonfigurowany.";
  }
  try {
    const response = await axios.get(API_URL, {
      params: {
        q: city,
        appid: config.weather.apiKey,
        units: "metric",
        lang: "pl",
      },
    });
    const data = response.data;
    return `Pogoda w ${data.name}: ${data.weather[0].description}, temperatura ${data.main.temp.toFixed(1)}°C, odczuwalna ${data.main.feels_like.toFixed(1)}°C.`;
  } catch (error) {
    return `Nie udało się znaleźć miasta "${city}". Spróbuj ponownie.`;
  }
}

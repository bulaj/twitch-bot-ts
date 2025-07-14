import { fetchWeatherApi } from "openmeteo";

export async function getWeather(city: string): Promise<string> {
  const url = "https://api.open-meteo.com/v1/forecast";

  const params = {
    latitude: 54.05,
    longitude: 18.41,
    hourly: "temperature_2m",
  };
  const responses = await fetchWeatherApi(url, params);
  try {
    const response = responses[0];

    const utcOffsetSeconds = response.utcOffsetSeconds();
    const timezone = response.timezone();
    const timezoneAbbreviation = response.timezoneAbbreviation();
    const latitude = response.latitude();
    const longitude = response.longitude();

    const hourly = response.hourly()!;

    const weatherData = {
      hourly: {
        time: [
          ...Array(
            (Number(hourly.timeEnd()) - Number(hourly.time())) /
              hourly.interval(),
          ),
        ].map(
          (_, i) =>
            new Date(
              (Number(hourly.time()) +
                i * hourly.interval() +
                utcOffsetSeconds) *
                1000,
            ),
        ),
        temperature2m: hourly.variables(0)!.valuesArray()!,
      },
    };

    for (let i = 0; i < weatherData.hourly.time.length; i++) {
      console.log(
        weatherData.hourly.time[i].toISOString(),
        weatherData.hourly.temperature2m[i],
      );
    }

    console.log(weatherData);
    return `Pogoda sprawdzona:`;
  } catch (error) {
    return `Nie udało się znaleźć miasta "${city}". Spróbuj ponownie.`;
  }
}

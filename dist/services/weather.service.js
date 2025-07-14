"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWeather = getWeather;
const openmeteo_1 = require("openmeteo");
async function getWeather(city) {
    const url = "https://api.open-meteo.com/v1/forecast";
    const params = {
        latitude: 54.05,
        longitude: 18.41,
        hourly: "temperature_2m",
    };
    const responses = await (0, openmeteo_1.fetchWeatherApi)(url, params);
    try {
        // Process first location. Add a for-loop for multiple locations or weather models
        const response = responses[0];
        // Attributes for timezone and location
        const utcOffsetSeconds = response.utcOffsetSeconds();
        const timezone = response.timezone();
        const timezoneAbbreviation = response.timezoneAbbreviation();
        const latitude = response.latitude();
        const longitude = response.longitude();
        const hourly = response.hourly();
        // Note: The order of weather variables in the URL query and the indices below need to match!
        const weatherData = {
            hourly: {
                time: [
                    ...Array((Number(hourly.timeEnd()) - Number(hourly.time())) /
                        hourly.interval()),
                ].map((_, i) => new Date((Number(hourly.time()) +
                    i * hourly.interval() +
                    utcOffsetSeconds) *
                    1000)),
                temperature2m: hourly.variables(0).valuesArray(),
            },
        };
        // `weatherData` now contains a simple structure with arrays for datetime and weather data
        for (let i = 0; i < weatherData.hourly.time.length; i++) {
            console.log(weatherData.hourly.time[i].toISOString(), weatherData.hourly.temperature2m[i]);
        }
        console.log(weatherData);
        return `Pogoda sprawdzona:`;
    }
    catch (error) {
        return `Nie udało się znaleźć miasta "${city}". Spróbuj ponownie.`;
    }
}

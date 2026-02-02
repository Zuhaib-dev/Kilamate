const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

if (!API_KEY) {
  throw new Error(
    "Missing VITE_OPENWEATHER_API_KEY environment variable. " +
    "Please create a .env file with your OpenWeather API key."
  );
}

export const API_CONFIG = {
  BASE_URL: "https://api.openweathermap.org/data/2.5",
  GEO: "https://api.openweathermap.org/geo/1.0",
  API_KEY,
  DEFAULT_PARAMS: {
    units: "metric",
    appid: API_KEY,
  },
};
import { useParams, useSearchParams } from "react-router-dom";
import { useWeatherQuery, useForecastQuery, useAirPollutionQuery } from "@/hooks/use-weather";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { CurrentWeather } from "../components/current-weather";
import { HourlyTemperature } from "../components/hourly-temprature";
import { WeatherDetails } from "../components/weather-details";
import { WeatherForecast } from "../components/weather-forecast";
import { AirPollution } from "../components/air-pollution";
import WeatherSkeleton from "../components/loading-skeleton";
import { FavoriteButton } from "@/components/favorite-button";
import { SEO, createCitySchema } from "@/components/seo";

export function CityPage() {
  const [searchParams] = useSearchParams();
  const params = useParams();
  const lat = parseFloat(searchParams.get("lat") || "0");
  const lon = parseFloat(searchParams.get("lon") || "0");

  const coordinates = { lat, lon };

  const weatherQuery = useWeatherQuery(coordinates);
  const forecastQuery = useForecastQuery(coordinates);
  const airPollutionQuery = useAirPollutionQuery(coordinates);

  if (weatherQuery.error || forecastQuery.error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load weather data. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  if (!weatherQuery.data || !forecastQuery.data || !params.cityName) {
    return <WeatherSkeleton />;
  }

  const cityName = params.cityName;
  const country = weatherQuery.data.sys.country;
  const temp = Math.round(weatherQuery.data.main.temp);
  const description = weatherQuery.data.weather[0].description;

  return (
    <>
      <SEO
        title={`${cityName} Weather Forecast | Current Temperature & AQI - Kilamate`}
        description={`Current weather in ${cityName}, ${country}: ${temp}°C, ${description}. Get real-time weather forecast, hourly temperature, air quality index (AQI), and 5-day weather predictions for ${cityName}.`}
        keywords={`${cityName} weather, weather in ${cityName}, ${cityName} temperature, ${cityName} AQI, ${cityName} air quality, ${cityName} forecast, weather ${country}`}
        canonicalUrl={`https://kilamate.netlify.app/city/${cityName}?lat=${lat}&lon=${lon}`}
        structuredData={createCitySchema(cityName, lat, lon)}
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">
            {cityName}, {country}
          </h1>
          <div className="flex gap-2">
            <FavoriteButton
              data={{ ...weatherQuery.data, name: cityName }}
            />
          </div>
        </div>

        <div className="grid gap-6">
          <CurrentWeather data={weatherQuery.data} />
          <HourlyTemperature data={forecastQuery.data} />
          <div className="grid gap-6 md:grid-cols-2 items-start">
            <WeatherDetails data={weatherQuery.data} />
            <WeatherForecast data={forecastQuery.data} />
            <AirPollution data={airPollutionQuery.data} />
          </div>
        </div>
      </div>
    </>
  );
}
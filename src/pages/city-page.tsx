import { useParams, useSearchParams } from "react-router-dom";
import { useWeatherQuery, useForecastQuery, useAirPollutionQuery } from "@/hooks/use-weather";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { CurrentWeather } from "../components/current-weather";
import { HourlyTemperature } from "../components/hourly-temperature";
import { WeatherDetails } from "../components/weather-details";
import { WeatherForecast } from "../components/weather-forecast";
import { WeatherStats } from "../components/weather-stats";
import { SunTracker } from "../components/sun-tracker";
import { DailyOutlook } from "../components/daily-outlook";
import { AirPollution } from "../components/air-pollution";
import { WeatherAlerts } from "../components/weather-alerts";
import { FavoriteCities } from "../components/favorite-cities";
import { RegionalOverview } from "../components/regional-overview";
import { TravelAdvisory } from "../components/travel-advisory";
import WeatherSkeleton from "../components/loading-skeleton";
import { FavoriteButton } from "@/components/favorite-button";
import { ActivityPlanner } from "../components/activity-planner";
import { ClothingAdvisor } from "../components/clothing-advisor";
import { MoonPhase } from "../components/moon-phase";
import { ComfortLevel } from "../components/comfort-level";
import { AgricultureAdvisor } from "../components/agriculture-advisor";
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

      <div className="space-y-4">
        {/* Favorite Cities - Added to match Dashboard */}
        <FavoriteCities />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight">
              {cityName}, {country}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <FavoriteButton
              data={{ ...weatherQuery.data, name: cityName }}
            />
          </div>
        </div>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
          {/* ROW 1: TOP 2 CARDS */}
          <CurrentWeather
            data={weatherQuery.data}
            locationName={{ name: cityName, country, state: "" } as any}
            forecast={forecastQuery.data ?? undefined}
          />
          <HourlyTemperature data={forecastQuery.data} />

          {/* FULL WIDTH ALERTS */}
          <div className="col-span-full">
            <WeatherAlerts
              data={weatherQuery.data}
              airPollution={airPollutionQuery.data ?? undefined}
            />
          </div>

          {/* ROW 2: WEATHER STATS (FULL WIDTH) */}
          <div className="col-span-full">
            <WeatherStats data={weatherQuery.data} />
          </div>

          {/* ROW 3: SUN TRACKER & MOON PHASE (2 CARDS) */}
          <SunTracker data={weatherQuery.data} />
          <MoonPhase />

          {/* ROW 4: WEATHER DETAILS (FULL WIDTH) */}
          <div className="col-span-full">
            <WeatherDetails data={weatherQuery.data} />
          </div>

          {/* ROW 5: DAILY OUTLOOK & COMFORT LEVEL (2 CARDS) */}
          <DailyOutlook
            weather={weatherQuery.data}
            forecast={forecastQuery.data}
            airPollution={airPollutionQuery.data}
          />
          <ComfortLevel data={weatherQuery.data} />

          {/* ROW 6: ADVISORS (2 CARDS) */}
          <ClothingAdvisor data={weatherQuery.data} />
          <ActivityPlanner data={forecastQuery.data} />

          {/* ROW 6: FORECAST (FULL WIDTH) */}
          <div className="col-span-full">
            <WeatherForecast data={forecastQuery.data} />
          </div>

          {/* ROW 7: REGIONAL OVERVIEW (FULL WIDTH) - Added for consistency */}
          <div className="col-span-full">
            <RegionalOverview />
          </div>

          {/* ROW 8: AQI (FULL WIDTH) */}
          <div className="col-span-full">
            <AirPollution data={airPollutionQuery.data} />
          </div>

          {/* ROW 9: TRAVEL ADVISORY (FULL WIDTH) - New Feature */}
          <div className="col-span-full">
            <TravelAdvisory />
          </div>

          {/* ROW 10: AGRICULTURE ADVISOR (FULL WIDTH) - New Feature */}
          <div className="col-span-full">
            <AgricultureAdvisor 
              weather={weatherQuery.data} 
              forecast={forecastQuery.data} 
            />
          </div>
        </div>
      </div>
    </>
  );
}
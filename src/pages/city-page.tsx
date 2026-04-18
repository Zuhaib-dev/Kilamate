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
import { SEO, createWeatherSchema, createBreadcrumbSchema } from "@/components/seo";
import { motion } from "framer-motion";
import { AnimateIn } from "@/components/motion/AnimateIn";

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
        title={`${cityName} Weather: ${temp}°C & ${description} | Current AQI - Kilamate`}
        description={`Live weather forecast for ${cityName}, ${country}. Current temperature: ${temp}°C, Conditions: ${description}. View real-time Air Quality Index (AQI), hourly updates, and 5-day predictions.`}
        keywords={`${cityName} weather, weather in ${cityName}, ${cityName} temperature, ${cityName} AQI, ${cityName} air quality, ${cityName} forecast, Kashmir weather`}
        canonicalUrl={`https://kilamate.netlify.app/city/${cityName}?lat=${lat}&lon=${lon}`}
        structuredData={[
          createWeatherSchema(cityName, country, temp, description, lat, lon),
          createBreadcrumbSchema([
            { name: "Home", item: "https://kilamate.netlify.app" },
            { name: cityName, item: `https://kilamate.netlify.app/city/${cityName}?lat=${lat}&lon=${lon}` }
          ])
        ]}
      />

      <div className="space-y-4">
        <AnimateIn variant="slideDown">
          <FavoriteCities />
        </AnimateIn>

        <AnimateIn variant="slideInLeft">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold tracking-tight">
                {cityName}, {country}
              </h1>
            </div>
            <motion.div
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <FavoriteButton data={{ ...weatherQuery.data, name: cityName }} />
            </motion.div>
          </div>
        </AnimateIn>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
          {/* ROW 1 */}
          <AnimateIn variant="slideInLeft">
            <CurrentWeather
              data={weatherQuery.data}
              locationName={{ name: cityName, country, state: "" } as any}
              forecast={forecastQuery.data ?? undefined}
            />
          </AnimateIn>
          <AnimateIn variant="slideInRight">
            <HourlyTemperature data={forecastQuery.data} />
          </AnimateIn>

          {/* ALERTS */}
          <AnimateIn variant="fadeIn" className="col-span-full">
            <WeatherAlerts
              data={weatherQuery.data}
              airPollution={airPollutionQuery.data ?? undefined}
            />
          </AnimateIn>

          {/* STATS */}
          <AnimateIn variant="slideUp" className="col-span-full">
            <WeatherStats data={weatherQuery.data} />
          </AnimateIn>

          {/* SUN + MOON */}
          <AnimateIn variant="slideInLeft">
            <SunTracker data={weatherQuery.data} />
          </AnimateIn>
          <AnimateIn variant="slideInRight">
            <MoonPhase />
          </AnimateIn>

          {/* DETAILS */}
          <AnimateIn variant="slideUp" className="col-span-full">
            <WeatherDetails data={weatherQuery.data} />
          </AnimateIn>

          {/* DAILY OUTLOOK + COMFORT */}
          <AnimateIn variant="slideInLeft">
            <DailyOutlook
              weather={weatherQuery.data}
              forecast={forecastQuery.data}
              airPollution={airPollutionQuery.data}
            />
          </AnimateIn>
          <AnimateIn variant="slideInRight">
            <ComfortLevel data={weatherQuery.data} />
          </AnimateIn>

          {/* ADVISORS */}
          <AnimateIn variant="slideInLeft">
            <ClothingAdvisor data={weatherQuery.data} />
          </AnimateIn>
          <AnimateIn variant="slideInRight">
            <ActivityPlanner data={forecastQuery.data} />
          </AnimateIn>

          {/* FORECAST */}
          <AnimateIn variant="slideUp" className="col-span-full">
            <WeatherForecast data={forecastQuery.data} />
          </AnimateIn>

          {/* AGRICULTURE */}
          <AnimateIn variant="slideUp" className="col-span-full">
            <AgricultureAdvisor
              weather={weatherQuery.data}
              forecast={forecastQuery.data}
            />
          </AnimateIn>

          {/* REGIONAL */}
          <AnimateIn variant="slideUp" className="col-span-full">
            <RegionalOverview />
          </AnimateIn>

          {/* AQI */}
          <AnimateIn variant="slideUp" className="col-span-full">
            <AirPollution data={airPollutionQuery.data} />
          </AnimateIn>

          {/* TRAVEL */}
          <AnimateIn variant="slideUp" className="col-span-full">
            <TravelAdvisory />
          </AnimateIn>
        </div>
      </div>
    </>
  );
}
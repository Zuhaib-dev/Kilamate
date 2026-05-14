import { useParams, useSearchParams } from "react-router-dom";
import { useWeatherQuery, useForecastQuery, useAirPollutionQuery, useReverseGeocodeQuery } from "@/hooks/use-weather";
import { usePreferences } from "@/hooks/use-preferences";
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
import { useFavorites } from "@/hooks/use-favorite";
import { RegionalOverview } from "../components/regional-overview";
import { TravelAdvisory } from "../components/travel-advisory";
import WeatherSkeleton from "../components/loading-skeleton";
import { FavoriteButton } from "@/components/favorite-button";
import { ShareButton } from "@/components/share-button";
import { ActivityPlanner } from "../components/activity-planner";
import { ClothingAdvisor } from "../components/clothing-advisor";
import { MoonPhase } from "../components/moon-phase";
import { ComfortLevel } from "../components/comfort-level";
import { AgricultureAdvisor } from "../components/agriculture-advisor";
import { AstroGuide } from "../components/astro-guide";
import { SEO, createWeatherSchema, createBreadcrumbSchema } from "@/components/seo";
import { BestDayThisWeek } from "@/components/best-day-this-week";
import { WeatherVsHistory } from "@/components/weather-vs-history";
import { motion } from "framer-motion";
import { AnimateIn } from "@/components/motion/AnimateIn";
import { LazyView } from "@/components/motion/lazy-view";
import { WeatherNewsFeed } from "@/components/weather-news-feed";
import { CityWebcams } from "../components/city-webcams";
import { AIWeatherBriefing } from "../components/ai-weather-briefing";
import { SmartHomeAdvisor } from "../components/smart-home-advisor";
import { AllergyForecast } from "../components/allergy-forecast";

export function CityPage() {
  const [searchParams] = useSearchParams();
  const params = useParams();
  const { temperatureUnit } = usePreferences();
  const { favorites, isLoading: favoritesLoading } = useFavorites();

  const lat = parseFloat(searchParams.get("lat") || "0");
  const lon = parseFloat(searchParams.get("lon") || "0");

  const coordinates = { lat, lon };

  const weatherQuery = useWeatherQuery(coordinates);
  const forecastQuery = useForecastQuery(coordinates);
  const airPollutionQuery = useAirPollutionQuery(coordinates);
  const locationQuery = useReverseGeocodeQuery(coordinates);

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
        {!favoritesLoading && favorites.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
          >
            <FavoriteCities />
          </motion.div>
        )}

        <AnimateIn variant="slideInLeft">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold tracking-tight">
                {cityName}, {country}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <ShareButton
                weather={weatherQuery.data}
                locationName={cityName}
                country={country}
                temperatureUnit={temperatureUnit}
                lat={lat}
                lon={lon}
              />
              <motion.div
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <FavoriteButton data={{ ...weatherQuery.data, name: cityName }} />
              </motion.div>
            </div>
          </div>
        </AnimateIn>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
          {/* AI BRIEFING */}
          <AnimateIn variant="fadeIn" className="col-span-full h-full">
            <AIWeatherBriefing 
              weather={weatherQuery.data} 
              forecast={forecastQuery.data ?? undefined} 
              airPollution={airPollutionQuery.data ?? undefined} 
            />
          </AnimateIn>

          {/* ROW 1 */}
          <AnimateIn variant="slideInLeft" className="h-full">
            <CurrentWeather
              data={weatherQuery.data}
              locationName={{ name: cityName, country, state: "" } as any}
              forecast={forecastQuery.data ?? undefined}
            />
          </AnimateIn>
          <AnimateIn variant="slideInRight" className="h-full">
            <HourlyTemperature data={forecastQuery.data} />
          </AnimateIn>

          {/* ALERTS */}
          <AnimateIn variant="fadeIn" className="col-span-full h-full">
            <WeatherAlerts
              data={weatherQuery.data}
              airPollution={airPollutionQuery.data ?? undefined}
            />
          </AnimateIn>

          {/* STATS */}
          <AnimateIn variant="slideUp" className="col-span-full h-full">
            <WeatherStats data={weatherQuery.data} />
          </AnimateIn>

          {/* BEST DAY THIS WEEK */}
          <AnimateIn variant="slideUp" className="col-span-full h-full">
            <BestDayThisWeek
              forecast={forecastQuery.data}
              airPollution={airPollutionQuery.data ?? undefined}
            />
          </AnimateIn>

          {/* SUN + MOON */}
          <LazyView margin="400px" className="h-full">
            <AnimateIn variant="slideInLeft" className="h-full">
              <SunTracker data={weatherQuery.data} />
            </AnimateIn>
          </LazyView>
          <LazyView margin="400px" className="h-full">
            <AnimateIn variant="slideInRight" className="h-full">
              <MoonPhase />
            </AnimateIn>
          </LazyView>

          {weatherQuery.data && (
            <LazyView margin="400px" className="col-span-full h-full">
              <AnimateIn variant="slideUp" className="h-full">
                <AstroGuide weather={weatherQuery.data} forecast={forecastQuery.data} />
              </AnimateIn>
            </LazyView>
          )}

          {/* DETAILS */}
          <LazyView margin="400px" className="col-span-full h-full">
            <AnimateIn variant="slideUp" className="h-full">
              <WeatherDetails data={weatherQuery.data} />
            </AnimateIn>
          </LazyView>

          {/* NOW VS HISTORY */}
          <LazyView margin="400px" className="col-span-full h-full">
            <AnimateIn variant="slideUp" className="h-full">
              <WeatherVsHistory data={weatherQuery.data} coordinates={coordinates} />
            </AnimateIn>
          </LazyView>

          {/* DAILY OUTLOOK + COMFORT */}
          <LazyView margin="400px" className="h-full">
            <AnimateIn variant="slideInLeft" className="h-full">
              <DailyOutlook
                weather={weatherQuery.data}
                forecast={forecastQuery.data}
                airPollution={airPollutionQuery.data}
              />
            </AnimateIn>
          </LazyView>
          <LazyView margin="400px" className="h-full">
            <AnimateIn variant="slideInRight" className="h-full">
              <ComfortLevel data={weatherQuery.data} />
            </AnimateIn>
          </LazyView>

          {/* ADVISORS */}
          <LazyView margin="400px" className="h-full">
            <AnimateIn variant="slideInLeft" className="h-full">
              <ClothingAdvisor data={weatherQuery.data} />
            </AnimateIn>
          </LazyView>
          <LazyView margin="400px" className="h-full">
            <AnimateIn variant="slideInRight" className="h-full">
              <ActivityPlanner data={forecastQuery.data} />
            </AnimateIn>
          </LazyView>

          {/* FORECAST */}
          <LazyView margin="400px" className="col-span-full h-full">
            <AnimateIn variant="slideUp" className="h-full">
              <WeatherForecast data={forecastQuery.data} />
            </AnimateIn>
          </LazyView>

          {/* AGRICULTURE */}
          <LazyView margin="400px" className="col-span-full h-full">
            <AnimateIn variant="slideUp" className="h-full">
              <AgricultureAdvisor
                weather={weatherQuery.data}
                forecast={forecastQuery.data}
              />
            </AnimateIn>
          </LazyView>

          {/* SMART HOME */}
          <LazyView margin="400px" className="col-span-full h-full">
            <AnimateIn variant="slideUp" className="h-full">
              <SmartHomeAdvisor 
                weather={weatherQuery.data}
                forecast={forecastQuery.data ?? undefined}
              />
            </AnimateIn>
          </LazyView>

          {/* REGIONAL */}
          <LazyView margin="400px" className="col-span-full h-full">
            <AnimateIn variant="slideUp" className="h-full">
              <RegionalOverview state={locationQuery.data?.[0]?.state} />
            </AnimateIn>
          </LazyView>

          {/* AQI */}
          <LazyView margin="400px" className="col-span-full h-full">
            <AnimateIn variant="slideUp" className="h-full">
              <AirPollution data={airPollutionQuery.data} />
            </AnimateIn>
          </LazyView>

          {/* ALLERGY FORECAST */}
          <LazyView margin="400px" className="col-span-full h-full">
            <AnimateIn variant="slideUp" className="h-full">
              <AllergyForecast weather={weatherQuery.data} airPollution={airPollutionQuery.data ?? undefined} />
            </AnimateIn>
          </LazyView>

          {/* CITY WEBCAMS */}
          <LazyView margin="400px" className="col-span-full h-full">
            <AnimateIn variant="slideUp" className="h-full">
              <CityWebcams coordinates={coordinates} locationName={cityName} />
            </AnimateIn>
          </LazyView>

          {/* WEATHER NEWS */}
          <LazyView margin="400px" className="col-span-full h-full">
            <AnimateIn variant="slideUp" className="h-full">
              <WeatherNewsFeed locationName={cityName} state={locationQuery.data?.[0]?.state} />
            </AnimateIn>
          </LazyView>

          {/* TRAVEL */}
          <LazyView margin="400px" className="col-span-full h-full">
            <AnimateIn variant="slideUp" className="h-full">
              <TravelAdvisory weather={weatherQuery.data} />
            </AnimateIn>
          </LazyView>
        </div>
      </div>
    </>
  );
}
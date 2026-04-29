import {
  useForecastQuery,
  useReverseGeocodeQuery,
  useWeatherQuery,
  useAirPollutionQuery,
} from "@/hooks/use-weather";
import { CurrentWeather } from "@/components/current-weather";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { MapPin, AlertTriangle, RefreshCw } from "lucide-react";
import { useGeolocation } from "@/hooks/use-geolocation";
import { WeatherDetails } from "@/components/weather-details";
import { WeatherForecast } from "@/components/weather-forecast";
import { HourlyTemperature } from "@/components/hourly-temperature";
import { Skeleton } from "@/components/ui/skeleton";
import { FavoriteCities } from "@/components/favorite-cities";
import { useFavorites } from "@/hooks/use-favorite";
import { AirPollution } from "@/components/air-pollution";
import { useWeatherTheme } from "@/context/weather-theme-provider";
import { lazy, Suspense, useEffect } from "react";
import { WeatherAlerts } from "@/components/weather-alerts";
import { WeatherStats } from "@/components/weather-stats";

// Lazy loaded components
const WeatherMap = lazy(() => import("@/components/weather-map").then(m => ({ default: m.WeatherMap })));
const WeatherGlobe = lazy(() => import("@/components/weather-globe").then(m => ({ default: m.WeatherGlobe })));
import { SunTracker } from "@/components/sun-tracker";
import { DailyOutlook } from "@/components/daily-outlook";
import { ClothingAdvisor } from "@/components/clothing-advisor";
import { ActivityPlanner } from "@/components/activity-planner";
import { RegionalOverview } from "@/components/regional-overview";
import { TravelAdvisory } from "@/components/travel-advisory";
import { MoonPhase } from "@/components/moon-phase";
import { ComfortLevel } from "@/components/comfort-level";
import { AgricultureAdvisor } from "@/components/agriculture-advisor";
import { SEO, webApplicationSchema, organizationSchema, createBreadcrumbSchema, createWeatherSchema } from "@/components/seo";
import { motion } from "framer-motion";
import { AnimateIn } from "@/components/motion/AnimateIn";
import { LazyView } from "@/components/motion/lazy-view";
import { ShareButton } from "@/components/share-button";
import { usePreferences } from "@/hooks/use-preferences";

export function WeatherDashboard() {
  const {
    coordinates,
    error: locationError,
    isLoading: locationLoading,
    getLocation,
  } = useGeolocation();

  const { temperatureUnit } = usePreferences();

  const weatherQuery = useWeatherQuery(coordinates);
  const forecastQuery = useForecastQuery(coordinates);
  const locationQuery = useReverseGeocodeQuery(coordinates);
  const airPollutionQuery = useAirPollutionQuery(coordinates);
  const { favorites } = useFavorites();

  const { setThemeByCondition } = useWeatherTheme();

  // Update global weather theme when data changes
  useEffect(() => {
    if (weatherQuery.data) {
      const isDay = weatherQuery.data.dt >= weatherQuery.data.sys.sunrise && 
                    weatherQuery.data.dt <= weatherQuery.data.sys.sunset;
      setThemeByCondition(weatherQuery.data.weather[0].id, isDay);
    }
  }, [weatherQuery.data, setThemeByCondition]);

  const handleRefresh = () => {
    getLocation();
    if (coordinates) {
      weatherQuery.refetch();
      forecastQuery.refetch();
      locationQuery.refetch();
      airPollutionQuery.refetch();
    }
  };

  const locationName = locationQuery.data?.[0];

  if (locationError && !coordinates) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Location Error</AlertTitle>
        <AlertDescription className="flex flex-col gap-4">
          <p>{locationError}</p>
          <Button onClick={getLocation} variant="outline" className="w-fit">
            <MapPin className="mr-2 h-4 w-4" />
            Enable Location
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!coordinates && !locationLoading) {
    return (
      <Alert>
        <MapPin className="h-4 w-4" />
        <AlertTitle>Location Required</AlertTitle>
        <AlertDescription className="flex flex-col gap-4">
          <p>Please enable location access to see your local weather.</p>
          <Button onClick={getLocation} variant="outline" className="w-fit">
            <MapPin className="mr-2 h-4 w-4" />
            Enable Location
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <SEO
        title={locationName ? `${locationName.name} Weather: ${Math.round(weatherQuery.data?.main.temp ?? 0)}°C & ${weatherQuery.data?.weather[0].main ?? 'Live Forecast'} | Kilamate` : "Kilamate | Real-Time Weather Forecast for Jammu & Kashmir"}
        description={locationName ? `Check live weather in ${locationName.name}, J&K. Current temp: ${Math.round(weatherQuery.data?.main.temp ?? 0)}°C with ${weatherQuery.data?.weather[0].description}. Detailed hourly and 5-day forecast.` : "Get accurate, real-time weather forecasts and Air Quality Index (AQI) for all districts of Jammu & Kashmir. Track weather in Srinagar, Budgam, Baramulla, Pulwama, and more."}
        keywords="weather forecast J&K, Jammu Kashmir weather, Srinagar weather, real-time AQI, air quality index, weather app Kashmir, Kilamate"
        structuredData={[
          organizationSchema, 
          webApplicationSchema,
          createBreadcrumbSchema([
            { name: "Home", item: "https://kilamate.netlify.app" },
            { name: locationName?.name || "Dashboard", item: window.location.href }
          ]),
          weatherQuery.data && createWeatherSchema(
            locationName?.name || "Current Location",
            locationName?.country || "IN",
            weatherQuery.data.main.temp,
            weatherQuery.data.weather[0].description,
            coordinates?.lat || 0,
            coordinates?.lon || 0,
            weatherQuery.data.main.humidity,
            weatherQuery.data.wind.speed,
            airPollutionQuery.data?.list[0].main.aqi
          )
        ].filter(Boolean) as object[]}
      />



      <div className="space-y-4">
        {/* Favorite Cities — only render when there are favorites so AnimateIn doesn't leave phantom space */}
        {favorites.length > 0 && (
          <AnimateIn variant="slideDown">
            <FavoriteCities />
          </AnimateIn>
        )}

        {locationError && (
          <AnimateIn variant="scaleIn">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Location Error</AlertTitle>
              <AlertDescription className="flex flex-col gap-4">
                <p>{locationError}</p>
                <Button onClick={getLocation} variant="outline" className="w-fit">
                  <MapPin className="mr-2 h-4 w-4" />
                  Retry Location
                </Button>
              </AlertDescription>
            </Alert>
          </AnimateIn>
        )}

        {/* Section title + refresh */}
        <AnimateIn variant="slideInLeft">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold tracking-tight">My Location</h1>
            <div className="flex items-center gap-3">
              {weatherQuery.dataUpdatedAt > 0 && (
                <motion.span
                  className="text-xs text-muted-foreground hidden sm:block"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Updated {
                    (() => {
                      const mins = Math.floor((Date.now() - weatherQuery.dataUpdatedAt) / 60000);
                      if (mins < 1) return "just now";
                      if (mins === 1) return "1 min ago";
                      return `${mins} min ago`;
                    })()
                  }
                </motion.span>
              )}
              
              <ShareButton
                weather={weatherQuery.data ?? undefined}
                locationName={locationName?.name || "Current Location"}
                country={weatherQuery.data?.sys.country}
                temperatureUnit={temperatureUnit}
                lat={coordinates?.lat}
                lon={coordinates?.lon}
              />

              <motion.div
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.9, rotate: -15 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleRefresh}
                  aria-label="Refresh weather data"
                  disabled={weatherQuery.isFetching || forecastQuery.isFetching}
                >
                  <motion.div
                    animate={weatherQuery.isFetching ? { rotate: 360 } : { rotate: 0 }}
                    transition={{ duration: 0.8, repeat: weatherQuery.isFetching ? Infinity : 0, ease: "linear" }}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </motion.div>
                </Button>
              </motion.div>
            </div>
          </div>
        </AnimateIn>

        {locationLoading ? (
          <div className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <Skeleton className="h-[300px] w-full rounded-xl" />
              <Skeleton className="h-[300px] w-full rounded-xl" />
            </div>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-2">

            {/* ROW 1: TOP 2 CARDS */}
            {weatherQuery.isLoading ? (
              <Skeleton className="h-[350px] w-full rounded-xl" />
            ) : weatherQuery.data ? (
              <AnimateIn variant="slideInLeft">
                <CurrentWeather
                  data={weatherQuery.data}
                  locationName={locationName}
                  forecast={forecastQuery.data ?? undefined}
                />
              </AnimateIn>
            ) : null}

            {forecastQuery.isLoading ? (
              <Skeleton className="h-[350px] w-full rounded-xl" />
            ) : forecastQuery.data ? (
              <AnimateIn variant="slideInRight">
                <HourlyTemperature data={forecastQuery.data} />
              </AnimateIn>
            ) : null}

            {/* FULL WIDTH ALERTS IF PRESENT */}
            {weatherQuery.data && (
              <AnimateIn variant="fadeIn" className="col-span-full">
                <WeatherAlerts
                  data={weatherQuery.data}
                  airPollution={airPollutionQuery.data ?? undefined}
                  forecast={forecastQuery.data ?? undefined}
                />
              </AnimateIn>
            )}

            {/* INTERACTIVE DATA VISUALS */}
            {coordinates && (
              <LazyView margin="400px" className="col-span-full grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AnimateIn variant="slideUp" className="h-full">
                  <Suspense fallback={<Skeleton className="h-[400px] w-full rounded-xl" />}>
                    <WeatherMap coordinates={coordinates} />
                  </Suspense>
                </AnimateIn>
                <AnimateIn variant="slideUp" className="h-full">
                  <Suspense fallback={<Skeleton className="h-[400px] w-full rounded-xl" />}>
                    <WeatherGlobe coordinates={coordinates} locationName={locationName?.name} />
                  </Suspense>
                </AnimateIn>
              </LazyView>
            )}

            {/* ROW 2: WEATHER STATS */}
            {weatherQuery.data && (
              <AnimateIn variant="slideUp" className="col-span-full">
                <WeatherStats data={weatherQuery.data} />
              </AnimateIn>
            )}

            {/* ROW 3: SUN TRACKER & MOON PHASE */}
            {weatherQuery.isLoading ? (
              <Skeleton className="h-[350px] w-full rounded-xl" />
            ) : weatherQuery.data ? (
              <LazyView margin="400px">
                <AnimateIn variant="slideInLeft">
                  <SunTracker data={weatherQuery.data} />
                </AnimateIn>
              </LazyView>
            ) : null}

            <LazyView margin="400px">
              <AnimateIn variant="slideInRight">
                <MoonPhase />
              </AnimateIn>
            </LazyView>

            {/* ROW 4: WEATHER DETAILS */}
            {weatherQuery.data && (
              <LazyView margin="400px" className="col-span-full">
                <AnimateIn variant="slideUp">
                  <WeatherDetails data={weatherQuery.data} />
                </AnimateIn>
              </LazyView>
            )}

            {/* ROW 5: DAILY OUTLOOK & COMFORT LEVEL */}
            {weatherQuery.isLoading ? (
              <Skeleton className="h-[350px] w-full rounded-xl" />
            ) : weatherQuery.data ? (
              <LazyView margin="400px">
                <AnimateIn variant="slideInLeft">
                  <DailyOutlook
                    weather={weatherQuery.data}
                    forecast={forecastQuery.data ?? null}
                    airPollution={airPollutionQuery.data ?? null}
                  />
                </AnimateIn>
              </LazyView>
            ) : null}

            {weatherQuery.data && (
              <LazyView margin="400px">
                <AnimateIn variant="slideInRight">
                  <ComfortLevel data={weatherQuery.data} />
                </AnimateIn>
              </LazyView>
            )}

            {/* ROW 5: ADVISORS */}
            {weatherQuery.data && (
              <LazyView margin="400px">
                <AnimateIn variant="slideInLeft">
                  <ClothingAdvisor data={weatherQuery.data} />
                </AnimateIn>
              </LazyView>
            )}
            {forecastQuery.data && (
              <LazyView margin="400px">
                <AnimateIn variant="slideInRight">
                  <ActivityPlanner data={forecastQuery.data} />
                </AnimateIn>
              </LazyView>
            )}

            {/* ROW 6: FORECAST */}
            {forecastQuery.data && (
              <LazyView margin="400px" className="col-span-full">
                <AnimateIn variant="slideUp">
                  <WeatherForecast data={forecastQuery.data} />
                </AnimateIn>
              </LazyView>
            )}

            {/* ROW 7: AGRICULTURE ADVISOR */}
            {weatherQuery.data && (
              <LazyView margin="400px" className="col-span-full">
                <AnimateIn variant="slideUp">
                  <AgricultureAdvisor
                    weather={weatherQuery.data}
                    forecast={forecastQuery.data ?? undefined}
                  />
                </AnimateIn>
              </LazyView>
            )}

            {/* ROW 7: REGIONAL OVERVIEW */}
            <LazyView margin="400px" className="col-span-full">
              <AnimateIn variant="slideUp">
                <RegionalOverview state={locationName?.state} />
              </AnimateIn>
            </LazyView>

            {/* ROW 8: AQI */}
            {airPollutionQuery.data && (
              <LazyView margin="400px" className="col-span-full">
                <AnimateIn variant="slideUp">
                  <AirPollution data={airPollutionQuery.data} />
                </AnimateIn>
              </LazyView>
            )}

            {/* ROW 9: TRAVEL ADVISORY */}
            <LazyView margin="400px" className="col-span-full">
              <AnimateIn variant="slideUp">
                <TravelAdvisory weather={weatherQuery.data} />
              </AnimateIn>
            </LazyView>
          </div>
        )}
      </div>
    </>
  );
}

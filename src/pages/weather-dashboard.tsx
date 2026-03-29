import {
  useForecastQuery,
  useReverseGeocodeQuery,
  useWeatherQuery,
  useAirPollutionQuery,
} from "@/hooks/use-weather";
import { CurrentWeather } from "../components/current-weather";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import { MapPin, AlertTriangle, RefreshCw } from "lucide-react";
import { useGeolocation } from "@/hooks/use-geolocation";
import { WeatherDetails } from "../components/weather-details";
import { WeatherForecast } from "../components/weather-forecast";
import { HourlyTemperature } from "../components/hourly-temperature";
import { Skeleton } from "../components/ui/skeleton";
import { FavoriteCities } from "@/components/favorite-cities";
import { AirPollution } from "../components/air-pollution";
import { useWeatherTheme } from "@/context/weather-theme-provider";
import { useEffect } from "react";
import { WeatherAlerts } from "../components/weather-alerts";
import { WeatherStats } from "../components/weather-stats";
import { SunTracker } from "../components/sun-tracker";
import { DailyOutlook } from "../components/daily-outlook";
import { ClothingAdvisor } from "../components/clothing-advisor";
import { ActivityPlanner } from "../components/activity-planner";
import { RegionalOverview } from "../components/regional-overview";
import { TravelAdvisory } from "../components/travel-advisory";
import {
  SEO,
  webApplicationSchema,
  organizationSchema,
} from "@/components/seo";

export function WeatherDashboard() {
  const {
    coordinates,
    error: locationError,
    isLoading: locationLoading,
    getLocation,
  } = useGeolocation();

  const weatherQuery = useWeatherQuery(coordinates);
  const forecastQuery = useForecastQuery(coordinates);
  const locationQuery = useReverseGeocodeQuery(coordinates);
  const airPollutionQuery = useAirPollutionQuery(coordinates);

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
        title="Kilamate | Real-Time Weather Forecast for Jammu & Kashmir"
        description="Get accurate, real-time weather forecasts and Air Quality Index (AQI) for all districts of Jammu & Kashmir. Track weather in Srinagar, Budgam, Baramulla, Pulwama, and more."
        keywords="weather forecast J&K, Jammu Kashmir weather, Srinagar weather, real-time AQI, air quality index, weather app Kashmir, Kilamate"
        structuredData={[organizationSchema, webApplicationSchema]}
      />

      <div className="space-y-4">
        {/* Favorite Cities - Restored to Top */}
        <FavoriteCities />

        {locationError && (
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
        )}

        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">My Location</h1>
          <div className="flex items-center gap-3">
            {weatherQuery.dataUpdatedAt > 0 && (
              <span className="text-xs text-muted-foreground hidden sm:block">
                Updated {
                  (() => {
                    const mins = Math.floor((Date.now() - weatherQuery.dataUpdatedAt) / 60000);
                    if (mins < 1) return "just now";
                    if (mins === 1) return "1 min ago";
                    return `${mins} min ago`;
                  })()
                }
              </span>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              aria-label="Refresh weather data"
              disabled={weatherQuery.isFetching || forecastQuery.isFetching}
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  weatherQuery.isFetching ? "animate-spin" : ""
                }`}
              />
            </Button>
          </div>
        </div>

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
              <CurrentWeather
                data={weatherQuery.data}
                locationName={locationName}
                forecast={forecastQuery.data ?? undefined}
              />
            ) : null}

            {forecastQuery.isLoading ? (
              <Skeleton className="h-[350px] w-full rounded-xl" />
            ) : forecastQuery.data ? (
              <HourlyTemperature data={forecastQuery.data} />
            ) : null}

            {/* FULL WIDTH ALERTS IF PRESENT */}
            {weatherQuery.data && (
              <div className="col-span-full">
                <WeatherAlerts
                  data={weatherQuery.data}
                  airPollution={airPollutionQuery.data ?? undefined}
                />
              </div>
            )}

            {/* ROW 2: WEATHER STATS (FULL WIDTH) */}
            {weatherQuery.data && (
              <div className="col-span-full">
                <WeatherStats data={weatherQuery.data} />
              </div>
            )}

            {/* ROW 3: SUN TRACKER & DAILY OUTLOOK (2 CARDS) */}
            {weatherQuery.isLoading ? (
              <Skeleton className="h-[350px] w-full rounded-xl" />
            ) : weatherQuery.data ? (
              <SunTracker data={weatherQuery.data} />
            ) : null}

            {weatherQuery.isLoading ? (
              <Skeleton className="h-[350px] w-full rounded-xl" />
            ) : weatherQuery.data ? (
              <DailyOutlook
                weather={weatherQuery.data}
                forecast={forecastQuery.data ?? null}
                airPollution={airPollutionQuery.data ?? null}
              />
            ) : null}

            {/* ROW 4: WEATHER DETAILS (FULL WIDTH) */}
            {weatherQuery.data && (
              <div className="col-span-full">
                <WeatherDetails data={weatherQuery.data} />
              </div>
            )}

            {/* ROW 5: ADVISORS (2 CARDS) */}
            {weatherQuery.data && (
              <ClothingAdvisor data={weatherQuery.data} />
            )}
            {forecastQuery.data && (
              <ActivityPlanner data={forecastQuery.data} />
            )}

            {/* ROW 6: FORECAST (FULL WIDTH) */}
            {forecastQuery.data && (
              <div className="col-span-full">
                <WeatherForecast data={forecastQuery.data} />
              </div>
            )}

            {/* ROW 7: REGIONAL OVERVIEW (FULL WIDTH) */}
            <div className="col-span-full">
              <RegionalOverview />
            </div>

            {/* ROW 8: AQI (FULL WIDTH) */}
            {airPollutionQuery.data && (
              <div className="col-span-full">
                <AirPollution data={airPollutionQuery.data} />
              </div>
            )}

            {/* ROW 9: TRAVEL ADVISORY (FULL WIDTH) - New Feature */}
            <div className="col-span-full">
              <TravelAdvisory />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

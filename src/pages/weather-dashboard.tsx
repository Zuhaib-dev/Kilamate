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
import { WeatherAlerts } from "../components/weather-alerts";
import { WeatherStats } from "../components/weather-stats";
import { SEO, webApplicationSchema, organizationSchema } from "@/components/seo";

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

  if (locationError) {
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
        {/* Favorite Cities - Always visible for quick access */}
        <FavoriteCities />

        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">My Location</h1>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            aria-label="Refresh weather data"
            disabled={weatherQuery.isFetching || forecastQuery.isFetching}
          >
            <RefreshCw
              className={`h-4 w-4 ${weatherQuery.isFetching ? "animate-spin" : ""
                }`}
            />
          </Button>
        </div>

        {locationLoading ? (
          <div className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <Skeleton className="h-[300px] w-full rounded-xl" />
              <Skeleton className="h-[300px] w-full rounded-xl" />
            </div>
          </div>
        ) : (
          <div className="grid gap-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {weatherQuery.isLoading ? (
                <Skeleton className="h-[300px] w-full lg:w-[50%] rounded-xl" />
              ) : weatherQuery.data ? (
                <CurrentWeather
                  data={weatherQuery.data}
                  locationName={locationName}
                />
              ) : null}

              {forecastQuery.isLoading ? (
                <Skeleton className="h-[300px] w-full lg:w-[50%] rounded-xl" />
              ) : forecastQuery.data ? (
                <HourlyTemperature data={forecastQuery.data} />
              ) : null}
            </div>

            {weatherQuery.data && <WeatherAlerts data={weatherQuery.data} />}

            {weatherQuery.isLoading ? (
              <div className="grid gap-6 md:grid-cols-3">
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
              </div>
            ) : weatherQuery.data ? (
              <WeatherStats data={weatherQuery.data} />
            ) : null}

            <div className="grid gap-6 md:grid-cols-2 items-start">
              {weatherQuery.isLoading ? (
                <Skeleton className="h-[400px] w-full rounded-xl" />
              ) : weatherQuery.data ? (
                <WeatherDetails data={weatherQuery.data} />
              ) : null}

              {forecastQuery.isLoading ? (
                <Skeleton className="h-[400px] w-full rounded-xl" />
              ) : forecastQuery.data ? (
                <WeatherForecast data={forecastQuery.data} />
              ) : null}

              {airPollutionQuery.isLoading ? (
                <Skeleton className="h-[200px] w-full rounded-xl" />
              ) : airPollutionQuery.data ? (
                <AirPollution data={airPollutionQuery.data} />
              ) : null}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

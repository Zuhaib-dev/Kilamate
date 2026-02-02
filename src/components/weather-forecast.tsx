import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ArrowDown, ArrowUp, Droplets, Wind } from "lucide-react";
import { format } from "date-fns";
import type { ForecastData } from "@/api/types";
import { usePreferences } from "@/hooks/use-preferences";
import { formatTemperature, formatWindSpeed } from "@/lib/units";

interface WeatherForecastProps {
  data: ForecastData;
}

interface DailyForecast {
  date: number;
  temp_min: number;
  temp_max: number;
  humidity: number;
  wind: number;
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  };
}

export function WeatherForecast({ data }: WeatherForecastProps) {
  const { temperatureUnit, windSpeedUnit } = usePreferences();

  const dailyForecasts = data.list.reduce((acc, forecast) => {
    const dateKey = format(new Date(forecast.dt * 1000), "yyyy-MM-dd");

    if (!acc[dateKey]) {
      acc[dateKey] = {
        temp_min: forecast.main.temp_min,
        temp_max: forecast.main.temp_max,
        humidity: forecast.main.humidity,
        wind: forecast.wind.speed,
        weather: forecast.weather[0],
        date: forecast.dt,
      };
    } else {
      acc[dateKey].temp_min = Math.min(
        acc[dateKey].temp_min,
        forecast.main.temp_min
      );
      acc[dateKey].temp_max = Math.max(
        acc[dateKey].temp_max,
        forecast.main.temp_max
      );
    }

    return acc;
  }, {} as Record<string, DailyForecast>);

  const nextDays = Object.values(dailyForecasts).slice(1, 6);

  const formatTemp = (temp: number) => formatTemperature(temp, temperatureUnit);

  return (
    <Card>
      <CardHeader>
        <CardTitle>5-Day Forecast</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {nextDays.map((day) => (
            <div
              key={day.date}
              className="
                grid grid-cols-1 gap-3
                rounded-lg border p-4
                sm:grid-cols-3 sm:items-center
              "
            >
              {/* Day + Description */}
              <div className="min-w-0 space-y-1">
                <p className="font-medium truncate">
                  {format(new Date(day.date * 1000), "EEE, MMM d")}
                </p>
                <p className="text-sm text-muted-foreground capitalize line-clamp-2">
                  {day.weather.description}
                </p>
              </div>

              {/* Temperatures */}
              <div className="flex items-center gap-4 sm:justify-center">
                <span className="flex items-center gap-1 text-blue-500">
                  <ArrowDown className="h-4 w-4" />
                  {formatTemp(day.temp_min)}
                </span>
                <span className="flex items-center gap-1 text-red-500">
                  <ArrowUp className="h-4 w-4" />
                  {formatTemp(day.temp_max)}
                </span>
              </div>

              {/* Wind & Humidity */}
              <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                <span className="flex items-center gap-1">
                  <Droplets className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">{day.humidity}%</span>
                </span>
                <span className="flex items-center gap-1">
                  <Wind className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">{formatWindSpeed(day.wind, windSpeedUnit)}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

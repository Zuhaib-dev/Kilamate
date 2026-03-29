import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Droplets, Wind } from "lucide-react";
import { format } from "date-fns";
import { enUS, hi } from "date-fns/locale";
import type { ForecastData } from "@/api/types";
import { usePreferences } from "@/hooks/use-preferences";
import { formatTemperature, formatWindSpeed } from "@/lib/units";
import { useTranslation } from "react-i18next";

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
  const { temperatureUnit, windSpeedUnit, language } = usePreferences();
  const { t } = useTranslation();

  const getDateLocale = () => {
    switch (language) {
      case "hi": return hi;
      case "ur": return enUS;
      default: return enUS;
    }
  };
  const currentLocale = getDateLocale();

  const formatUrduDate = (date: Date) => {
    const urduDays: Record<string, string> = { Mon: "پیر", Tue: "منگل", Wed: "بدھ", Thu: "جمعرات", Fri: "جمعہ", Sat: "ہفتہ", Sun: "اتوار" };
    const day = format(date, "EEE", { locale: enUS });
    return urduDays[day] || day;
  };

  const dailyForecasts = data.list.reduce(
    (acc, forecast) => {
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
        acc[dateKey].temp_min = Math.min(acc[dateKey].temp_min, forecast.main.temp_min);
        acc[dateKey].temp_max = Math.max(acc[dateKey].temp_max, forecast.main.temp_max);
      }
      return acc;
    },
    {} as Record<string, DailyForecast>,
  );

  const nextDays = Object.values(dailyForecasts).slice(1, 6);
  const formatTemp = (temp: number) => formatTemperature(temp, temperatureUnit);

  // Compute week-wide range for proportional range bars
  const weekMin = Math.min(...nextDays.map((d) => d.temp_min));
  const weekMax = Math.max(...nextDays.map((d) => d.temp_max));
  const weekRange = weekMax - weekMin || 1;

  const avgWind = nextDays.reduce((s, d) => s + d.wind, 0) / nextDays.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("weather.forecast")}</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-0">
          {nextDays.map((day) => {
            const barLeft = ((day.temp_min - weekMin) / weekRange) * 100;
            const barWidth = Math.max(((day.temp_max - day.temp_min) / weekRange) * 100, 4);

            return (
              <div
                key={day.date}
                className="grid items-center gap-x-2 py-2.5 border-b last:border-b-0"
                style={{ gridTemplateColumns: "36px 1fr 1fr 48px 48px" }}
              >
                {/* Weather icon */}
                <img
                  src={`https://openweathermap.org/img/wn/${day.weather.icon}.png`}
                  alt={day.weather.description}
                  width={32}
                  height={32}
                  className="flex-shrink-0"
                />

                {/* Day name + humidity */}
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-tight">
                    {language === "ur"
                      ? formatUrduDate(new Date(day.date * 1000))
                      : format(new Date(day.date * 1000), "EEE", { locale: currentLocale })}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Droplets className="h-3 w-3 text-blue-500 flex-shrink-0" />
                    <span className="text-xs text-muted-foreground">{day.humidity}%</span>
                  </div>
                </div>

                {/* Temperature range bar */}
                <div className="relative h-1.5 rounded-full bg-muted overflow-hidden mx-1">
                  <div
                    className="absolute h-full rounded-full bg-gradient-to-r from-blue-400 to-orange-400"
                    style={{ left: `${barLeft}%`, width: `${barWidth}%` }}
                  />
                </div>

                {/* Min temp */}
                <span className="text-sm text-muted-foreground tabular-nums text-right">
                  {formatTemp(day.temp_min)}
                </span>

                {/* Max temp */}
                <span className="text-sm font-semibold tabular-nums text-right">
                  {formatTemp(day.temp_max)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Avg wind at the bottom */}
        <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t text-xs text-muted-foreground">
          <Wind className="h-3.5 w-3.5" />
          <span>Avg wind this week: <span className="font-medium text-foreground">{formatWindSpeed(avgWind, windSpeedUnit)}</span></span>
        </div>
      </CardContent>
    </Card>
  );
}

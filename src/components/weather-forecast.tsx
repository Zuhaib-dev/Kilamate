import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ArrowDown, ArrowUp, Droplets, Wind } from "lucide-react";
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

  // Determine the correct locale for date-fns
  const getDateLocale = () => {
    switch (language) {
      case "hi":
        return hi;
      case "ur":
        // ur locale isn't available in date-fns v4 by default, use enUS as fallback
        return enUS;
      default:
        return enUS;
    }
  };
  const currentLocale = getDateLocale();

  // Helper function to format Urdu days manually if language is Urdu
  const formatUrduDate = (date: Date) => {
    // Simple manual translation for Urdu days to provide localized feel
    const urduDays: Record<string, string> = {
      Mon: "پیر",
      Tue: "منگل",
      Wed: "بدھ",
      Thu: "جمعرات",
      Fri: "جمعہ",
      Sat: "ہفتہ",
      Sun: "اتوار",
    };

    const urduMonths: Record<string, string> = {
      Jan: "جنوری",
      Feb: "فروری",
      Mar: "مارچ",
      Apr: "اپریل",
      May: "مئی",
      Jun: "جون",
      Jul: "جولائی",
      Aug: "اگست",
      Sep: "ستمبر",
      Oct: "اکتوبر",
      Nov: "نومبر",
      Dec: "دسمبر",
    };

    const day = format(date, "EEE", { locale: enUS });
    const month = format(date, "MMM", { locale: enUS });
    const dayOfMonth = format(date, "d", { locale: enUS });

    return `${urduDays[day] || day}, ${urduMonths[month] || month} ${dayOfMonth}`;
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
        acc[dateKey].temp_min = Math.min(
          acc[dateKey].temp_min,
          forecast.main.temp_min,
        );
        acc[dateKey].temp_max = Math.max(
          acc[dateKey].temp_max,
          forecast.main.temp_max,
        );
      }

      return acc;
    },
    {} as Record<string, DailyForecast>,
  );

  const nextDays = Object.values(dailyForecasts).slice(1, 6);

  const formatTemp = (temp: number) => formatTemperature(temp, temperatureUnit);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("weather.forecast")}</CardTitle>
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
                <p className="font-medium truncate text-base">
                  {language === "ur"
                    ? formatUrduDate(new Date(day.date * 1000))
                    : format(new Date(day.date * 1000), "EEE, d MMM", {
                        locale: currentLocale,
                      })}
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
                  <span className="text-sm">
                    {formatWindSpeed(day.wind, windSpeedUnit)}
                  </span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

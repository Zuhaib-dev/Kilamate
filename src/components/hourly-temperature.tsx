import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { enUS, hi } from "date-fns/locale";
import type { ForecastData } from "@/api/types";
import { usePreferences } from "@/hooks/use-preferences";
import { convertTemperature } from "@/lib/units";
import { useTranslation } from "react-i18next";

interface HourlyTemperatureProps {
  data: ForecastData;
}

interface ChartData {
  time: string;
  temp: number;
  feels_like: number;
}

import { memo } from "react";

export const HourlyTemperature = memo(function HourlyTemperature({
  data,
}: HourlyTemperatureProps) {
  const { temperatureUnit, language } = usePreferences();
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

  // Helper function to format Urdu hours manually if language is Urdu
  const formatUrduTime = (date: Date) => {
    const formatted = format(date, "ha", { locale: enUS });

    // Replace AM/PM with Urdu equivalents
    let urduFormatted = formatted.replace("AM", " صبح").replace("PM", " شام");

    // Replace numbers 1-12 with Urdu numerals if desired, but English numerals are often fine in Urdu context
    return urduFormatted;
  };

  // Get today's forecast data and format for chart
  const chartData: ChartData[] = data.list
    .slice(0, 8) // Get next 24 hours (3-hour intervals)
    .map((item) => ({
      time:
        language === "ur"
          ? formatUrduTime(new Date(item.dt * 1000))
          : format(new Date(item.dt * 1000), "ha", { locale: currentLocale }),
      temp: Math.round(convertTemperature(item.main.temp, temperatureUnit)),
      feels_like: Math.round(
        convertTemperature(item.main.feels_like, temperatureUnit),
      ),
    }));

  const unitSymbol = temperatureUnit === "celsius" ? "°C" : "°F";

  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle>{t("weather.hourly")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis
                dataKey="time"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}°`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              {t("weather.temperature")}
                            </span>
                            <span className="font-bold">
                              {payload[0].value}
                              {unitSymbol}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              {t("weather.feelsLike")}
                            </span>
                            <span className="font-bold">
                              {payload[1].value}
                              {unitSymbol}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="temp"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="feels_like"
                stroke="#64748b"
                strokeWidth={2}
                dot={false}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
});

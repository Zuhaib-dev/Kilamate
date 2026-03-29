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
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <CardTitle>{t("weather.hourly")}</CardTitle>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="inline-block w-4 h-0.5 bg-blue-600 rounded-full" />
              {t("weather.temperature")}
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-4 h-0.5 bg-slate-400 rounded-full" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #94a3b8 0, #94a3b8 4px, transparent 4px, transparent 9px)' }} />
              {t("weather.feelsLike")}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <XAxis
                dataKey="time"
                stroke="#888888"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}°`}
              />
              <Tooltip
                cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1, strokeDasharray: "4 4" }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2.5 shadow-md">
                        <p className="text-xs text-muted-foreground mb-1.5 font-medium">{label}</p>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="inline-block w-3 h-0.5 bg-blue-600 rounded-full" />
                            <span className="text-xs text-muted-foreground">{t("weather.temperature")}</span>
                            <span className="text-sm font-bold text-blue-600 ml-auto">{payload[0]?.value}{unitSymbol}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="inline-block w-3 h-0.5 bg-slate-400 rounded-full" />
                            <span className="text-xs text-muted-foreground">{t("weather.feelsLike")}</span>
                            <span className="text-sm font-bold text-slate-500 ml-auto">{payload[1]?.value}{unitSymbol}</span>
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
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 0, fill: "#2563eb" }}
              />
              <Line
                type="monotone"
                dataKey="feels_like"
                stroke="#94a3b8"
                strokeWidth={1.5}
                dot={false}
                strokeDasharray="5 5"
                activeDot={{ r: 4, strokeWidth: 0, fill: "#94a3b8" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
});

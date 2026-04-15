import React from "react";
import { Card, CardContent } from "./ui/card";
import { ArrowDown, ArrowUp, Droplets, Wind, CloudRain, CloudSnow, Zap, CloudDrizzle, Sun, Cloud } from "lucide-react";
import type { WeatherData, GeocodingResponse, ForecastData } from "@/api/types";
import { usePreferences } from "@/hooks/use-preferences";
import { formatTemperature, formatWindSpeed } from "@/lib/units";
import { useTranslation } from "react-i18next";
import { translateCityName, translateStateName } from "@/lib/translate-city";
import { memo } from "react";
import { motion } from "framer-motion";
import { staggerContainerFast, slideInLeft, slideUp, scaleInBounce } from "@/lib/animations";

interface CurrentWeatherProps {
  data: WeatherData;
  locationName?: GeocodingResponse;
  /** Forecast data — used to derive upcoming precipitation probability */
  forecast?: ForecastData;
}



// Maps OWM weather condition IDs to a short label + icon + color
function getConditionChip(id: number): { label: string; Icon: React.ElementType; color: string; bg: string } {
  if (id >= 200 && id < 300) return { label: "Thunderstorm",   Icon: Zap,          color: "text-yellow-500", bg: "bg-yellow-500/10" };
  if (id >= 300 && id < 400) return { label: "Drizzle",        Icon: CloudDrizzle, color: "text-sky-400",    bg: "bg-sky-400/10" };
  if (id >= 500 && id < 600) return { label: "Rainy",          Icon: CloudRain,    color: "text-blue-500",  bg: "bg-blue-500/10" };
  if (id >= 600 && id < 700) return { label: "Snowy",          Icon: CloudSnow,    color: "text-cyan-400",  bg: "bg-cyan-400/10" };
  if (id >= 700 && id < 800) return { label: "Hazy",           Icon: Cloud,        color: "text-slate-400", bg: "bg-slate-400/10" };
  if (id === 800)             return { label: "Clear sky",      Icon: Sun,          color: "text-yellow-400",bg: "bg-yellow-400/10" };
  return                             { label: "Partly cloudy", Icon: Cloud,        color: "text-slate-400", bg: "bg-slate-400/10" };
}

// Derive upcoming (next 6 h) max precipitation probability from forecast
function getUpcomingPop(forecast?: ForecastData): number {
  if (!forecast?.list?.length) return 0;
  // First two intervals = next 6 hours (3 h each)
  return Math.max(...forecast.list.slice(0, 2).map((f) => f.pop ?? 0));
}

function getPrecipChip(pop: number): { label: string; color: string; bg: string } | null {
  const pct = Math.round(pop * 100);
  if (pop < 0.05) return null;
  if (pop < 0.2)  return { label: `${pct}% chance of showers`,  color: "text-sky-500",  bg: "bg-sky-500/10" };
  if (pop < 0.5)  return { label: `${pct}% chance of rain`,     color: "text-blue-500", bg: "bg-blue-500/10" };
  if (pop < 0.75) return { label: `${pct}% — rain likely`,      color: "text-blue-600", bg: "bg-blue-600/10" };
  return               { label: `${pct}% — heavy rain expected`, color: "text-blue-700", bg: "bg-blue-700/10" };
}

export const CurrentWeather = memo(function CurrentWeather({
  data,
  locationName,
  forecast,
}: CurrentWeatherProps) {
  const { temperatureUnit, windSpeedUnit, language } = usePreferences();
  const { t } = useTranslation();

  const {
    weather: [currentWeather],
    main: { temp, feels_like, temp_min, temp_max, humidity },
    wind: { speed },
  } = data;

  // Format temperature with user's preferred unit
  const formatTemp = (temp: number) => formatTemperature(temp, temperatureUnit);

  // Dynamically generating the image URL
  const weatherIconUrl = `https://openweathermap.org/img/wn/${currentWeather.icon}@4x.png`;

  const conditionChip = getConditionChip(currentWeather.id);
  const upcomingPop   = getUpcomingPop(forecast);
  const precipChip    = getPrecipChip(upcomingPop);

  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
    >
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-2">

            {/* LEFT — info */}
            <motion.div
              className="space-y-4"
              variants={staggerContainerFast}
              initial="hidden"
              animate="visible"
            >
              {/* City name */}
              <motion.div className="space-y-2" variants={slideInLeft}>
                <div className="flex items-center flex-wrap gap-x-1">
                  <h2 className="text-2xl font-bold tracking-tight">
                    {translateCityName(locationName?.name || "", language)}
                  </h2>
                  {locationName?.state && (
                    <span className="text-muted-foreground">
                      , {translateStateName(locationName.state, language)}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{locationName?.country}</p>

                {/* Chips — each staggered */}
                <motion.div
                  className="flex flex-wrap gap-2 pt-0.5"
                  variants={staggerContainerFast}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.span
                    variants={scaleInBounce}
                    className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${conditionChip.bg} ${conditionChip.color}`}
                  >
                    <conditionChip.Icon className="h-3.5 w-3.5" />
                    {conditionChip.label}
                  </motion.span>

                  {precipChip && (
                    <motion.span
                      variants={scaleInBounce}
                      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${precipChip.bg} ${precipChip.color}`}
                    >
                      <CloudRain className="h-3.5 w-3.5" />
                      {precipChip.label}
                    </motion.span>
                  )}
                </motion.div>
              </motion.div>

              {/* Temperature */}
              <motion.div className="flex items-center gap-2" variants={slideUp}>
                <motion.p
                  className="text-6xl font-bold tracking-tighter"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.15 }}
                >
                  {formatTemp(temp)}
                </motion.p>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("weather.feelsLike")} {formatTemp(feels_like)}
                  </p>
                  {(() => {
                    const delta = feels_like - temp;
                    const absDelta = Math.abs(Math.round(delta));
                    if (absDelta < 1) return <p className="text-xs text-muted-foreground">Feels about the same</p>;
                    const direction = delta > 0 ? "warmer" : "cooler";
                    const color = delta > 0 ? "text-orange-400" : "text-blue-400";
                    return (
                      <p className={`text-xs font-medium ${color}`}>
                        Feels {absDelta}° {direction} than actual
                      </p>
                    );
                  })()}
                  <div className="flex gap-2 text-sm font-medium">
                    <motion.span
                      className="flex items-center gap-1 text-blue-500"
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <ArrowDown className="h-3 w-3" />
                      {formatTemp(temp_min)}
                    </motion.span>
                    <motion.span
                      className="flex items-center gap-1 text-red-500"
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <ArrowUp className="h-3 w-3" />
                      {formatTemp(temp_max)}
                    </motion.span>
                  </div>
                </div>
              </motion.div>

              {/* Wind / Humidity */}
              <motion.div className="grid grid-cols-2 gap-4" variants={slideUp}>
                <motion.div
                  className="flex items-center gap-2"
                  whileHover={{ x: 2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Droplets className="h-4 w-4 text-blue-500" />
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{t("weather.humidity")}</p>
                    <p className="text-sm text-muted-foreground">{humidity}%</p>
                  </div>
                </motion.div>
                <motion.div
                  className="flex items-center gap-2"
                  whileHover={{ x: 2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Wind className="h-4 w-4 text-blue-500" />
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{t("weather.windSpeed")}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatWindSpeed(speed, windSpeedUnit)}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* RIGHT — floating icon */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative flex aspect-square w-full max-w-[200px] items-center justify-center">
                <motion.img
                  src={weatherIconUrl}
                  alt={currentWeather.description}
                  className="h-full w-full object-contain"
                  loading="eager"
                  width="200"
                  height="200"
                  decoding="async"
                  initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    rotate: 0,
                    y: [0, -10, 0],
                  }}
                  transition={{
                    opacity: { duration: 0.5 },
                    scale: { type: "spring", stiffness: 260, damping: 18 },
                    rotate: { type: "spring", stiffness: 260, damping: 18 },
                    y: { duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 },
                  }}
                />
                <motion.div
                  className="absolute bottom-0 text-center"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <p className="text-sm font-medium capitalize">
                    {currentWeather.description}
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

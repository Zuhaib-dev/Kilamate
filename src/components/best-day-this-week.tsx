import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Trophy, Droplets, Wind, Thermometer, Star, CalendarCheck } from "lucide-react";
import type { ForecastData, AirPollutionResponse } from "@/api/types";
import { usePreferences } from "@/hooks/use-preferences";
import { convertTemperature } from "@/lib/units";
import { memo, useMemo } from "react";

interface BestDayProps {
  forecast: ForecastData;
  airPollution?: AirPollutionResponse;
}

interface ActivityTag {
  emoji: string;
  label: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
}

interface DayScore {
  date: Date;
  dateKey: string;
  dayLabel: string;
  score: number;
  avgTemp: number;
  maxRainChance: number;
  avgAqi: number;
  weatherIcon: string;
  weatherDesc: string;
  dominantWeatherId: number;
  reasons: string[];
  badge: { emoji: string; label: string; color: string };
  activities: ActivityTag[];
}

const AQI_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: "Good", color: "text-green-500" },
  2: { label: "Fair", color: "text-lime-500" },
  3: { label: "Moderate", color: "text-yellow-500" },
  4: { label: "Poor", color: "text-orange-500" },
  5: { label: "Very Poor", color: "text-red-500" },
};

function getWeatherEmoji(weatherId: number): string {
  if (weatherId === 800) return "☀️";
  if (weatherId >= 801 && weatherId <= 802) return "⛅";
  if (weatherId >= 803 && weatherId <= 804) return "☁️";
  if (weatherId >= 700 && weatherId <= 781) return "🌫️";
  if (weatherId >= 600 && weatherId <= 622) return "❄️";
  if (weatherId >= 500 && weatherId <= 531) return "🌧️";
  if (weatherId >= 300 && weatherId <= 321) return "🌦️";
  if (weatherId >= 200 && weatherId <= 232) return "⛈️";
  return "🌡️";
}

/** Returns a list of activity suggestions based on conditions */
function getActivityTags(
  avgTemp: number,
  maxRainChance: number,
  avgAqi: number,
  weatherId: number
): ActivityTag[] {
  const tags: ActivityTag[] = [];
  const isRainy = maxRainChance > 40 || (weatherId >= 300 && weatherId <= 531);
  const isStorm = weatherId >= 200 && weatherId <= 232;
  const isSnow = weatherId >= 600 && weatherId <= 622;
  const isClear = weatherId === 800;
  const isPartlyCloudy = weatherId >= 801 && weatherId <= 802;
  const isHazy = weatherId >= 700 && weatherId <= 781;
  const goodAqi = avgAqi <= 2;
  const comfortableTemp = avgTemp >= 15 && avgTemp <= 28;
  const warmTemp = avgTemp >= 20 && avgTemp <= 32;
  const coolTemp = avgTemp >= 5 && avgTemp < 18;
  const highRain = maxRainChance > 60;

  // ─── Picnic ───
  if (!isRainy && !isStorm && comfortableTemp && goodAqi && (isClear || isPartlyCloudy)) {
    tags.push({ emoji: "🧺", label: "Picnic", bgClass: "bg-green-500/10", textClass: "text-green-600 dark:text-green-400", borderClass: "border-green-500/20" });
  }

  // ─── Photography / Golden Hour ───
  if (!isRainy && !isStorm && !isHazy) {
    tags.push({ emoji: "📸", label: "Photography", bgClass: "bg-amber-500/10", textClass: "text-amber-600 dark:text-amber-400", borderClass: "border-amber-500/20" });
  }

  // ─── Hiking / Trekking ───
  if (!isRainy && !isStorm && !isSnow && goodAqi && avgTemp >= 10 && avgTemp <= 30) {
    tags.push({ emoji: "🥾", label: "Hiking", bgClass: "bg-lime-500/10", textClass: "text-lime-600 dark:text-lime-400", borderClass: "border-lime-500/20" });
  }

  // ─── Cycling ───
  if (!isRainy && !isStorm && !isSnow && comfortableTemp) {
    tags.push({ emoji: "🚴", label: "Cycling", bgClass: "bg-sky-500/10", textClass: "text-sky-600 dark:text-sky-400", borderClass: "border-sky-500/20" });
  }

  // ─── Running / Jogging ───
  if (!isRainy && !isStorm && goodAqi && avgTemp <= 26) {
    tags.push({ emoji: "🏃", label: "Running", bgClass: "bg-orange-500/10", textClass: "text-orange-500 dark:text-orange-400", borderClass: "border-orange-500/20" });
  }

  // ─── Stargazing ───
  if (isClear && maxRainChance < 10) {
    tags.push({ emoji: "🔭", label: "Stargazing", bgClass: "bg-indigo-500/10", textClass: "text-indigo-500 dark:text-indigo-400", borderClass: "border-indigo-500/20" });
  }

  // ─── Snow Activities ───
  if (isSnow) {
    tags.push({ emoji: "⛷️", label: "Skiing", bgClass: "bg-blue-500/10", textClass: "text-blue-400", borderClass: "border-blue-500/20" });
    tags.push({ emoji: "☃️", label: "Snowman!", bgClass: "bg-slate-500/10", textClass: "text-slate-400", borderClass: "border-slate-500/20" });
  }

  // ─── Stay Indoors warnings ───
  if (isStorm) {
    tags.push({ emoji: "🏠", label: "Stay Indoors", bgClass: "bg-red-500/10", textClass: "text-red-500", borderClass: "border-red-500/20" });
  } else if (highRain) {
    tags.push({ emoji: "☔", label: "Carry Umbrella", bgClass: "bg-blue-500/10", textClass: "text-blue-400", borderClass: "border-blue-500/20" });
  }

  // ─── Cozy indoors day ───
  if (coolTemp && maxRainChance < 30) {
    tags.push({ emoji: "☕", label: "Cozy Café Day", bgClass: "bg-rose-500/10", textClass: "text-rose-500 dark:text-rose-400", borderClass: "border-rose-500/20" });
  }

  // ─── Beach / Pool ───
  if (warmTemp && isClear && maxRainChance < 15) {
    tags.push({ emoji: "🏖️", label: "Beach Day", bgClass: "bg-cyan-500/10", textClass: "text-cyan-500 dark:text-cyan-400", borderClass: "border-cyan-500/20" });
  }

  // ─── Gardening ───
  if (!isRainy && !isStorm && comfortableTemp && goodAqi) {
    tags.push({ emoji: "🌱", label: "Gardening", bgClass: "bg-emerald-500/10", textClass: "text-emerald-500 dark:text-emerald-400", borderClass: "border-emerald-500/20" });
  }

  // Return max 5 most relevant tags
  return tags.slice(0, 5);
}

export const BestDayThisWeek = memo(function BestDayThisWeek({ forecast, airPollution }: BestDayProps) {
  const { temperatureUnit } = usePreferences();

  const rankedDays = useMemo<DayScore[]>(() => {
    const byDay: Record<string, typeof forecast.list> = {};
    for (const item of forecast.list) {
      const key = item.dt_txt.slice(0, 10);
      if (!byDay[key]) byDay[key] = [];
      byDay[key].push(item);
    }

    const today = format(new Date(), "yyyy-MM-dd");
    const futureDays = Object.entries(byDay).filter(([k]) => k > today).slice(0, 5);

    const aqiByDay: Record<string, number[]> = {};
    if (airPollution) {
      for (const item of airPollution.list) {
        const key = format(new Date(item.dt * 1000), "yyyy-MM-dd");
        if (!aqiByDay[key]) aqiByDay[key] = [];
        aqiByDay[key].push(item.main.aqi);
      }
    }

    return futureDays.map(([dateKey, items]) => {
      const date = new Date(items[0].dt * 1000);
      const dayLabel = format(date, "EEEE");

      const temps = items.map(i => i.main.temp);
      const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
      const maxRainChance = Math.max(...items.map(i => (i.pop ?? 0) * 100));

      const weatherIds = items.map(i => i.weather[0].id);
      const primaryWeather = weatherIds.reduce<Record<number, number>>((acc, id) => {
        acc[id] = (acc[id] ?? 0) + 1;
        return acc;
      }, {});
      const dominantWeatherId = Number(Object.entries(primaryWeather).sort((a, b) => b[1] - a[1])[0][0]);
      const dominantWeatherItem = items.find(i => i.weather[0].id === dominantWeatherId)!;

      const aqiValues = aqiByDay[dateKey] ?? [];
      const avgAqi = aqiValues.length > 0
        ? Math.round(aqiValues.reduce((a, b) => a + b, 0) / aqiValues.length)
        : 2;

      // SCORING
      const idealTemp = 22;
      const tempDiff = Math.abs(avgTemp - idealTemp);
      let tempScore = tempDiff <= 5 ? 100 : tempDiff <= 10 ? 80 : tempDiff <= 18 ? 50 : 20;
      const rainScore = Math.max(0, 100 - maxRainChance * 1.8);
      const aqiScore = Math.max(0, 100 - (avgAqi - 1) * 25);
      let conditionBonus = 0;
      if (dominantWeatherId === 800) conditionBonus = 25;
      else if (dominantWeatherId >= 801 && dominantWeatherId <= 802) conditionBonus = 15;
      else if (dominantWeatherId >= 803 && dominantWeatherId <= 804) conditionBonus = 0;
      else if (dominantWeatherId >= 700 && dominantWeatherId <= 781) conditionBonus = -10;
      else conditionBonus = -20;

      const score = Math.round(tempScore * 0.35 + rainScore * 0.4 + aqiScore * 0.15 + conditionBonus * 0.1);

      const reasons: string[] = [];
      if (maxRainChance < 10) reasons.push("No rain expected");
      else if (maxRainChance < 30) reasons.push("Very low rain chance");
      if (dominantWeatherId === 800) reasons.push("Clear sunny skies");
      if (avgAqi <= 2 && airPollution) reasons.push("Clean air quality");
      if (tempDiff <= 8) reasons.push("Comfortable temperature");

      let badge: DayScore["badge"];
      if (score >= 80) badge = { emoji: "🏆", label: "Perfect Day!", color: "text-amber-500" };
      else if (score >= 65) badge = { emoji: "🌟", label: "Great Day", color: "text-yellow-400" };
      else if (score >= 45) badge = { emoji: "👍", label: "Decent Day", color: "text-blue-400" };
      else badge = { emoji: "😐", label: "Average Day", color: "text-muted-foreground" };

      const activities = getActivityTags(avgTemp, maxRainChance, avgAqi, dominantWeatherId);

      return {
        date, dateKey, dayLabel, score,
        avgTemp: Math.round(avgTemp),
        maxRainChance: Math.round(maxRainChance),
        avgAqi,
        weatherIcon: dominantWeatherItem.weather[0].icon,
        weatherDesc: dominantWeatherItem.weather[0].description,
        dominantWeatherId,
        reasons: reasons.filter(Boolean),
        badge,
        activities,
      };
    }).sort((a, b) => b.score - a.score);
  }, [forecast, airPollution]);

  if (!rankedDays.length) return null;

  const bestDay = rankedDays[0];
  const restDays = rankedDays.slice(1);
  const convertedTemp = Math.round(convertTemperature(bestDay.avgTemp, temperatureUnit));
  const unitSymbol = temperatureUnit === "celsius" ? "°C" : "°F";
  const aqiInfo = AQI_LABELS[bestDay.avgAqi] ?? AQI_LABELS[2];

  return (
    <motion.div
      whileHover={{ scale: 1.005, y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
    >
      <Card className="overflow-hidden border-border/50 bg-gradient-to-br from-card via-card to-card/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2.5 text-base font-bold tracking-tight">
            <motion.div
              animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 5, ease: "easeInOut" }}
              className="p-1.5 rounded-xl bg-amber-500/15"
            >
              <Trophy className="h-4 w-4 text-amber-500" />
            </motion.div>
            Best Day This Week
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* ─── HERO CARD ─── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/20 p-5"
          >
            {/* Ambient glow */}
            <motion.div
              animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-amber-400/20 blur-3xl pointer-events-none"
            />

            <div className="relative flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* Badge */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.2 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 mb-3"
                >
                  <span className="text-sm">{bestDay.badge.emoji}</span>
                  <span className={`text-xs font-bold uppercase tracking-wider ${bestDay.badge.color}`}>
                    {bestDay.badge.label}
                  </span>
                </motion.div>

                {/* Day Name */}
                <motion.h2
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-3xl font-black tracking-tight text-foreground leading-none"
                >
                  {bestDay.dayLabel}
                </motion.h2>
                <p className="text-sm text-muted-foreground font-medium mt-0.5">
                  {format(bestDay.date, "MMMM d")}
                </p>

                {/* Stats Row */}
                <div className="flex flex-wrap items-center gap-2 mt-4">
                  <div className="flex items-center gap-1.5 bg-background/50 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-border/40">
                    <Thermometer className="h-3.5 w-3.5 text-orange-400" />
                    <span className="text-sm font-bold tabular-nums">{convertedTemp}{unitSymbol}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-background/50 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-border/40">
                    <Droplets className="h-3.5 w-3.5 text-sky-400" />
                    <span className="text-sm font-bold tabular-nums text-sky-500">{bestDay.maxRainChance}%</span>
                    <span className="text-xs text-muted-foreground">rain</span>
                  </div>
                  {airPollution && (
                    <div className="flex items-center gap-1.5 bg-background/50 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-border/40">
                      <Wind className="h-3.5 w-3.5 text-green-400" />
                      <span className={`text-sm font-bold ${aqiInfo.color}`}>{aqiInfo.label} AQI</span>
                    </div>
                  )}
                </div>

                {/* Reason Pills */}
                {bestDay.reasons.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {bestDay.reasons.map((reason, i) => (
                      <motion.span
                        key={reason}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + i * 0.07 }}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      >
                        <Star className="h-2.5 w-2.5" />
                        {reason}
                      </motion.span>
                    ))}
                  </div>
                )}

                {/* ─── ACTIVITY TAGS ─── */}
                {bestDay.activities.length > 0 && (
                  <div className="mt-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                      Perfect for
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {bestDay.activities.map((act, i) => (
                        <motion.div
                          key={act.label}
                          initial={{ opacity: 0, y: 6, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 380,
                            damping: 22,
                            delay: 0.45 + i * 0.08,
                          }}
                          whileHover={{ scale: 1.08, y: -1 }}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border cursor-default select-none
                            ${act.bgClass} ${act.textClass} ${act.borderClass}`}
                        >
                          <span className="text-base leading-none">{act.emoji}</span>
                          {act.label}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Weather Emoji */}
              <motion.div
                animate={{ y: [0, -6, 0], rotate: [0, 3, -3, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="text-6xl select-none shrink-0 drop-shadow-lg"
              >
                {getWeatherEmoji(bestDay.dominantWeatherId)}
              </motion.div>
            </div>

            {/* Score Bar */}
            <div className="mt-5 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium uppercase tracking-wider">Outdoor Score</span>
                <span className="font-black tabular-nums text-amber-500">{bestDay.score}/100</span>
              </div>
              <div className="h-2 rounded-full bg-background/50 border border-border/30 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${bestDay.score}%` }}
                  transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1], delay: 0.4 }}
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500"
                />
              </div>
            </div>
          </motion.div>

          {/* ─── COMPARISON STRIP ─── */}
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <CalendarCheck className="h-3.5 w-3.5" />
              Other days
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {restDays.map((day, i) => (
                <motion.div
                  key={day.dateKey}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.07, type: "spring", stiffness: 300, damping: 26 }}
                  className="relative flex flex-col items-center gap-1 rounded-xl border border-border/50 bg-muted/30 p-3 text-center hover:bg-muted/60 transition-colors cursor-default"
                >
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{day.dayLabel.slice(0, 3)}</p>
                  <span className="text-2xl">{getWeatherEmoji(day.dominantWeatherId)}</span>
                  <p className="text-sm font-bold tabular-nums">
                    {Math.round(convertTemperature(day.avgTemp, temperatureUnit))}{unitSymbol}
                  </p>
                  {/* Activity preview — show just top 2 emojis */}
                  {day.activities.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5">
                      {day.activities.slice(0, 3).map(a => (
                        <span key={a.label} className="text-base leading-none" title={a.label}>{a.emoji}</span>
                      ))}
                    </div>
                  )}
                  {/* Mini score bar */}
                  <div className="w-full h-1.5 rounded-full bg-background/70 overflow-hidden mt-1">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${day.score}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.65 + i * 0.07 }}
                      className={`h-full rounded-full ${day.score >= 65 ? 'bg-amber-400' : day.score >= 45 ? 'bg-sky-400' : 'bg-muted-foreground/40'}`}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground font-semibold tabular-nums">{day.score}pts</p>
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

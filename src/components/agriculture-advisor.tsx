import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Sprout,
  Droplets,
  Wind,
  ShieldCheck,
  ShieldAlert,
  Leaf,
  Bug,
  AlertTriangle,
  CalendarClock,
} from "lucide-react";
import type { WeatherData, ForecastData } from "@/api/types";
import { usePreferences } from "@/hooks/use-preferences";
import { formatWindSpeed } from "@/lib/units";
import { useTranslation } from "react-i18next";

interface AgricultureAdvisorProps {
  weather: WeatherData;
  forecast?: ForecastData | null;
}

// All SKUAST Kashmir phenological stages with month ranges & metadata
const ALL_STAGES = [
  {
    id: "dormancy",
    emoji: "🌿",
    months: [1, 2],
    monthLabel: "Feb – Mar",
    danger: false,
    bee: false,
    color: "blue",
  },
  {
    id: "greenTip",
    emoji: "🌱",
    months: [2, 3],
    monthLabel: "Mar – Apr",
    danger: false,
    bee: false,
    color: "teal",
  },
  {
    id: "pinkBud",
    emoji: "🌸",
    months: [3],
    monthLabel: "Apr",
    danger: false,
    bee: false,
    color: "pink",
  },
  {
    id: "fullBloom",
    emoji: "🐝",
    months: [3, 4],
    monthLabel: "Apr – May",
    danger: true,
    bee: true,
    color: "yellow",
  },
  {
    id: "petalFall",
    emoji: "🍃",
    months: [4],
    monthLabel: "May",
    danger: false,
    bee: false,
    color: "emerald",
  },
  {
    id: "fruitDev",
    emoji: "🍏",
    months: [5, 6, 7],
    monthLabel: "Jun – Aug",
    danger: false,
    bee: false,
    color: "lime",
  },
  {
    id: "preHarvest",
    emoji: "🍎",
    months: [7, 8],
    monthLabel: "Aug – Sep",
    danger: false,
    bee: false,
    color: "red",
  },
  {
    id: "postHarvest",
    emoji: "🍂",
    months: [9, 10],
    monthLabel: "Oct – Nov",
    danger: false,
    bee: false,
    color: "orange",
  },
];

const STAGE_COLOR_MAP: Record<string, { bg: string; border: string; text: string; dot: string; glow: string }> = {
  blue:    { bg: "bg-blue-500/10",    border: "border-blue-500/30",    text: "text-blue-500 dark:text-blue-400",    dot: "bg-blue-500",    glow: "shadow-blue-500/20" },
  teal:    { bg: "bg-teal-500/10",    border: "border-teal-500/30",    text: "text-teal-500 dark:text-teal-400",    dot: "bg-teal-500",    glow: "shadow-teal-500/20" },
  pink:    { bg: "bg-pink-500/10",    border: "border-pink-500/30",    text: "text-pink-500 dark:text-pink-400",    dot: "bg-pink-500",    glow: "shadow-pink-500/20" },
  yellow:  { bg: "bg-yellow-500/10",  border: "border-yellow-500/30",  text: "text-yellow-600 dark:text-yellow-400",  dot: "bg-yellow-400",  glow: "shadow-yellow-400/20" },
  emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500", glow: "shadow-emerald-500/20" },
  lime:    { bg: "bg-lime-500/10",    border: "border-lime-500/30",    text: "text-lime-600 dark:text-lime-400",    dot: "bg-lime-500",    glow: "shadow-lime-500/20" },
  red:     { bg: "bg-red-500/10",     border: "border-red-500/30",     text: "text-red-500 dark:text-red-400",     dot: "bg-red-500",     glow: "shadow-red-500/20" },
  orange:  { bg: "bg-orange-500/10",  border: "border-orange-500/30",  text: "text-orange-500 dark:text-orange-400",  dot: "bg-orange-500",  glow: "shadow-orange-500/20" },
};

export function AgricultureAdvisor({ weather, forecast }: AgricultureAdvisorProps) {
  const { windSpeedUnit } = usePreferences();
  const { t } = useTranslation();

  const isKashmir = useMemo(() => {
    const name = weather.name.toLowerCase();
    const kashmirCities = ["srinagar", "baramulla", "anantnag", "pulwama", "kupwara", "shopian", "bandipora", "ganderbal", "budgam", "kulgam"];
    return (
      kashmirCities.some((city) => name.includes(city)) ||
      (weather.coord.lat > 32 && weather.coord.lat < 35 && weather.coord.lon > 73 && weather.coord.lon < 76)
    );
  }, [weather]);

  const insights = useMemo(() => {
    const temp = weather.main.temp;
    const humidity = weather.main.humidity;
    const windSpeed = weather.wind.speed * 3.6;

    let isRaining = false;
    let rainExpected = false;

    if (weather.weather[0].main.toLowerCase() === "rain" || weather.weather[0].main.toLowerCase() === "drizzle") {
      isRaining = true;
    }

    if (forecast?.list?.length) {
      const next24h = forecast.list.slice(0, 8);
      rainExpected = next24h.some(
        (f) => f.weather[0].main.toLowerCase() === "rain" || f.weather[0].main.toLowerCase() === "drizzle" || (f.pop && f.pop > 0.4)
      );
    }

    let sprayStatus = t("agricultureInsights.spray.good");
    let sprayColor = "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    let sprayIcon = ShieldCheck;
    let sprayMessage = t("agricultureInsights.spray.msgClear");
    let sprayOriginal = "Good";

    if (isRaining) {
      sprayOriginal = "Bad";
      sprayStatus = t("agricultureInsights.spray.bad");
      sprayColor = "text-red-500 bg-red-500/10 border-red-500/20";
      sprayIcon = ShieldAlert;
      sprayMessage = t("agricultureInsights.spray.msgRain");
    } else if (rainExpected) {
      sprayOriginal = "Suboptimal";
      sprayStatus = t("agricultureInsights.spray.suboptimal");
      sprayColor = "text-orange-500 bg-orange-500/10 border-orange-500/20";
      sprayIcon = Droplets;
      sprayMessage = t("agricultureInsights.spray.msgExpected");
    } else if (windSpeed > 15) {
      sprayOriginal = "Windy";
      sprayStatus = t("agricultureInsights.spray.windy");
      sprayColor = "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      sprayIcon = Wind;
      sprayMessage = t("agricultureInsights.spray.msgWindy", { speed: formatWindSpeed(2.78, windSpeedUnit) });
    }

    let appleAdvice = t("agricultureInsights.crops.appleDefault");
    let apricotAdvice = t("agricultureInsights.crops.apricotDefault");

    if (temp > 25 && humidity > 70) {
      appleAdvice = t("agricultureInsights.crops.appleHumid");
      apricotAdvice = t("agricultureInsights.crops.apricotHumid");
    } else if (temp < 10) {
      appleAdvice = t("agricultureInsights.crops.appleCool");
      apricotAdvice = t("agricultureInsights.crops.apricotCold");
    } else if (windSpeed > 20) {
      appleAdvice = t("agricultureInsights.crops.appleWindy");
    } else if (temp >= 15 && temp <= 25 && !isRaining) {
      appleAdvice = t("agricultureInsights.crops.appleOptimal");
      apricotAdvice = t("agricultureInsights.crops.apricotOptimal");
    }

    return {
      spray: { status: sprayStatus, color: sprayColor, icon: sprayIcon, message: sprayMessage, originalStatus: sprayOriginal },
      crops: { apple: appleAdvice, apricot: apricotAdvice },
    };
  }, [weather, forecast, windSpeedUnit, t]);

  const { activeStages, nextStage, progressPct } = useMemo(() => {
    const currentMonth = new Date().getMonth(); // 0 = Jan
    const active = ALL_STAGES.filter((s) => s.months.includes(currentMonth));
    const fallback = active.length === 0 ? [ALL_STAGES[0]] : active;

    // Next upcoming stage (first stage whose earliest month > currentMonth)
    const next = ALL_STAGES.find((s) => Math.min(...s.months) > currentMonth) ?? null;

    // Progress within season (roughly: Jan=0%, Dec=100%)
    const pct = Math.round(((currentMonth + 1) / 12) * 100);

    return { activeStages: fallback, nextStage: next, progressPct: pct };
  }, []);

  const isInBloom = activeStages.some((s) => s.id === "fullBloom");

  return (
    <Card className="h-full overflow-hidden relative flex flex-col">
      {/* Top glow bar */}
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />

      {/* Header */}
      <CardHeader className="pb-3 bg-gradient-to-br from-emerald-500/8 to-transparent border-b border-emerald-500/10 relative overflow-hidden flex-shrink-0">
        <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-emerald-500/5 blur-2xl" />
        <CardTitle className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2 text-base font-bold text-emerald-600 dark:text-emerald-400">
            <div className="p-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/20">
              <Sprout className="h-3.5 w-3.5" />
            </div>
            {isKashmir ? t("agricultureAdvisor.titleKashmir") : t("agricultureAdvisor.titleGeneric")}
          </div>
          {isKashmir && (
            <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full">
              SKUAST
            </span>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 space-y-5 flex-1">

        {/* ── Spray Conditions ── */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Bug className="h-3.5 w-3.5 text-muted-foreground" />
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{t("agricultureAdvisor.spraying")}</h3>
          </div>

          <div className={`rounded-2xl border p-4 ${insights.spray.color} transition-all duration-300`}>
            <div className="flex items-center gap-3">
              <div className="shrink-0 bg-background/60 p-2.5 rounded-xl backdrop-blur-sm border border-current/10">
                <insights.spray.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm leading-tight mb-0.5">{insights.spray.status}</p>
                <p className="text-xs opacity-80 leading-relaxed">{insights.spray.message}</p>
              </div>
            </div>
          </div>

          {/* Bee warning banner */}
          {isKashmir && isInBloom && (
            <div className="rounded-xl border border-yellow-400/30 bg-yellow-400/10 px-3.5 py-2.5 flex items-start gap-2.5">
              <span className="text-lg leading-none mt-0.5">🐝</span>
              <div>
                <p className="text-xs font-bold text-yellow-600 dark:text-yellow-400 leading-tight">Full Bloom — No Pesticide Sprays!</p>
                <p className="text-[11px] text-yellow-600/80 dark:text-yellow-400/70 leading-snug mt-0.5">
                  Protect pollinators. Notify local beekeepers before any next spray.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Crop Advice ── */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Leaf className="h-3.5 w-3.5 text-muted-foreground" />
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{t("agricultureAdvisor.cropAdvice")}</h3>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {/* Apple */}
            <div className="bg-muted/30 border rounded-2xl p-3.5 hover:bg-muted/50 transition-colors group">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">🍎</span>
                <span className="font-semibold text-sm">{t("agricultureInsights.crops.appleTitle")}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{insights.crops.apple}</p>
              {isKashmir && (
                <div className={`mt-2.5 text-[11px] px-2 py-1 rounded-lg inline-flex items-center gap-1.5 font-semibold border ${
                  insights.spray.originalStatus === "Good"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    : "bg-orange-500/10 text-orange-500 dark:text-orange-400 border-orange-500/20"
                }`}>
                  {insights.spray.originalStatus === "Good"
                    ? <><ShieldCheck className="h-3 w-3" /> {t("agricultureInsights.badges.optimalSpray")}</>
                    : <><AlertTriangle className="h-3 w-3" /> {t("agricultureInsights.badges.delaySpray")}</>}
                </div>
              )}
            </div>

            {/* Apricot */}
            <div className="bg-muted/30 border rounded-2xl p-3.5 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">🟠</span>
                <span className="font-semibold text-sm">{t("agricultureInsights.crops.apricotTitle")}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{insights.crops.apricot}</p>
              {isKashmir && forecast?.list && forecast.list.slice(0, 16).some((f) => f.main.temp < 3) && (
                <div className="mt-2.5 text-[11px] bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-lg inline-flex items-center gap-1.5 font-semibold border border-blue-500/20">
                  <AlertTriangle className="h-3 w-3" />
                  {t("agricultureInsights.badges.frostWarning")}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── SKUAST Spray Schedule Timeline ── */}
        {isKashmir && (
          <div className="space-y-3">
            {/* Section header + season progress */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <CalendarClock className="h-3.5 w-3.5 text-muted-foreground" />
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  {t("agricultureInsights.schedule.title")}
                </h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-wider">
                {t("agricultureInsights.schedule.current")}
              </span>
            </div>

            {/* Season progress bar */}
            <div className="space-y-1">
              <div className="h-1.5 w-full rounded-full bg-muted/50 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 via-emerald-500 to-red-400 transition-all duration-700"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
                <span>Jan</span>
                <span>Apr</span>
                <span>Aug</span>
                <span>Dec</span>
              </div>
            </div>

            {/* Active stage cards */}
            <div className="grid gap-2">
              {activeStages.map((stage) => {
                const colors = STAGE_COLOR_MAP[stage.color];
                return (
                  <div
                    key={stage.id}
                    className={`relative rounded-2xl border-2 p-3.5 ${colors.bg} ${colors.border} overflow-hidden transition-all duration-300`}
                  >
                    {/* Animated pulse dot for active */}
                    <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5">
                      <span className={`relative flex h-2 w-2`}>
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${colors.dot} opacity-60`} />
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${colors.dot}`} />
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${colors.text}`}>Active</span>
                    </div>

                    <div className="flex items-start gap-3 pr-16">
                      <span className="text-xl leading-none mt-0.5">{stage.emoji}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center flex-wrap gap-1.5 mb-1">
                          <span className={`font-bold text-sm ${colors.text}`}>
                            {t(`agricultureInsights.schedule.stages.${stage.id}`)}
                          </span>
                          {stage.bee && (
                            <span className="text-[10px] bg-yellow-400/20 text-yellow-600 dark:text-yellow-400 border border-yellow-400/30 px-1.5 py-0.5 rounded-full font-bold">
                              🐝 No Spray
                            </span>
                          )}
                        </div>
                        <p className={`text-xs leading-relaxed opacity-80 ${colors.text}`}>
                          {t(`agricultureInsights.schedule.stages.${stage.id}Desc`)}
                        </p>
                        <div className={`mt-2 text-[10px] font-semibold ${colors.text} opacity-70`}>
                          📅 {stage.monthLabel}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Next upcoming stage hint */}
            {nextStage && (
              <div className="rounded-xl border border-dashed border-muted-foreground/20 bg-muted/20 px-3.5 py-2.5 flex items-center gap-3">
                <span className="text-lg">{nextStage.emoji}</span>
                <div>
                  <p className="text-[11px] font-bold text-muted-foreground">
                    Up Next → {t(`agricultureInsights.schedule.stages.${nextStage.id}`)}
                  </p>
                  <p className="text-[10px] text-muted-foreground/70">
                    📅 {nextStage.monthLabel}
                  </p>
                </div>
              </div>
            )}

            {/* Source attribution */}
            <p className="text-[10px] text-muted-foreground/50 text-right">
              Source: SKUAST-K / Dept. of Horticulture J&K
            </p>
          </div>
        )}

      </CardContent>
    </Card>
  );
}

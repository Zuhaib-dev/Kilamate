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
  ChevronRight,
  Thermometer,
  Clock,
  Snowflake,
} from "lucide-react";
import { Badge } from "./ui/badge";
import type { WeatherData, ForecastData } from "@/api/types";
import { usePreferences } from "@/hooks/use-preferences";
import { formatWindSpeed } from "@/lib/units";
import { useTranslation } from "react-i18next";

interface AgricultureAdvisorProps {
  weather: WeatherData;
  forecast?: ForecastData | null;
}

// SKUAST Kashmir phenological stages
const ALL_STAGES = [
  { id: "dormancy",    emoji: "🌿", months: [1, 2],    monthLabel: "Feb – Mar", bee: false, accent: "#60a5fa" },
  { id: "greenTip",   emoji: "🌱", months: [2, 3],    monthLabel: "Mar – Apr", bee: false, accent: "#2dd4bf" },
  { id: "pinkBud",    emoji: "🌸", months: [3],        monthLabel: "Apr",       bee: false, accent: "#f472b6" },
  { id: "fullBloom",  emoji: "🐝", months: [3, 4],    monthLabel: "Apr – May", bee: true,  accent: "#facc15" },
  { id: "petalFall",  emoji: "🍃", months: [4],        monthLabel: "May",       bee: false, accent: "#34d399" },
  { id: "fruitDev",   emoji: "🍏", months: [5, 6, 7], monthLabel: "Jun – Aug", bee: false, accent: "#a3e635" },
  { id: "preHarvest", emoji: "🍎", months: [7, 8],    monthLabel: "Aug – Sep", bee: false, accent: "#f87171" },
  { id: "postHarvest",emoji: "🍂", months: [9, 10],   monthLabel: "Oct – Nov", bee: false, accent: "#fb923c" },
];

// Mills Period: Apple Scab risk based on temp + consecutive wet hours
function getScabRisk(temp: number, humidity: number, isRaining: boolean) {
  // Simplified Mills Period model
  // Scab thrives: temp 6–24°C, humidity > 90% or active rain
  if (temp < 2 || temp > 30) return { level: 0, label: "None", color: "#34d399", pct: 5 };
  const wetCondition = isRaining || humidity >= 90;
  const inRange = temp >= 6 && temp <= 24;
  if (inRange && wetCondition) {
    if (humidity >= 95 || (isRaining && temp >= 10 && temp <= 20))
      return { level: 3, label: "High", color: "#f87171", pct: 92 };
    return { level: 2, label: "Moderate", color: "#fb923c", pct: 60 };
  }
  if (wetCondition && !inRange) return { level: 1, label: "Low", color: "#facc15", pct: 30 };
  return { level: 0, label: "None", color: "#34d399", pct: 5 };
}

// Best spray window from forecast: find the earliest 3-hour block today with low wind + no rain
function getBestSprayWindow(forecast: ForecastData | null | undefined, sunriseTs: number, sunsetTs: number) {
  if (!forecast?.list?.length) return null;
  const now = Date.now() / 1000;
  // Only look at the next 24h
  const next24 = forecast.list.filter(f => f.dt > now && f.dt < now + 86400);
  const sunriseHr = new Date(sunriseTs * 1000).getHours();
  const sunsetHr  = new Date(sunsetTs  * 1000).getHours();

  const good = next24.find(f => {
    const hr = new Date(f.dt * 1000).getHours();
    const windKph = f.wind.speed * 3.6;
    const noRain = !["rain","drizzle"].includes(f.weather[0].main.toLowerCase()) && (!f.pop || f.pop < 0.3);
    const calmWind = windKph < 15;
    const goodTime = hr >= sunriseHr + 1 && hr <= sunsetHr - 2; // avoid early morning dew + evening
    const notMidday = hr < 12 || hr > 15; // avoid midday heat
    return noRain && calmWind && goodTime && notMidday;
  });

  if (!good) return null;
  const d = new Date(good.dt * 1000);
  const hr = d.getHours();
  const min = d.getMinutes().toString().padStart(2, "0");
  const period = hr < 12 ? "AM" : "PM";
  const hr12 = hr === 0 ? 12 : hr > 12 ? hr - 12 : hr;
  return {
    timeStr: `${hr12}:${min} ${period}`,
    windKph: Math.round(good.wind.speed * 3.6),
    temp: Math.round(good.main.temp),
    isToday: new Date(good.dt * 1000).toDateString() === new Date().toDateString(),
  };
}

// Frost countdown: find the next forecast entry with temp < 3°C
function getFrostCountdown(forecast: ForecastData | null | undefined) {
  if (!forecast?.list?.length) return null;
  const now = Date.now() / 1000;
  const frostEntry = forecast.list.find(f => f.dt > now && f.main.temp < 3);
  if (!frostEntry) return null;
  const hoursAway = Math.round((frostEntry.dt - now) / 3600);
  const minTemp = Math.round(frostEntry.main.temp);
  return { hoursAway, minTemp, dt: frostEntry.dt };
}

export function AgricultureAdvisor({ weather, forecast }: AgricultureAdvisorProps) {
  const { windSpeedUnit } = usePreferences();
  const { t } = useTranslation();

  const isKashmir = useMemo(() => {
    const name = weather.name.toLowerCase();
    const kashmirCities = ["srinagar","baramulla","anantnag","pulwama","kupwara","shopian","bandipora","ganderbal","budgam","kulgam"];
    return kashmirCities.some(c => name.includes(c)) ||
      (weather.coord.lat > 32 && weather.coord.lat < 35 && weather.coord.lon > 73 && weather.coord.lon < 76);
  }, [weather]);

  const insights = useMemo(() => {
    const temp = weather.main.temp;
    const humidity = weather.main.humidity;
    const windSpeed = weather.wind.speed * 3.6;
    const isRaining = ["rain","drizzle"].includes(weather.weather[0].main.toLowerCase());
    const rainExpected = forecast?.list?.slice(0, 8).some(
      f => ["rain","drizzle"].includes(f.weather[0].main.toLowerCase()) || (f.pop && f.pop > 0.4)
    ) ?? false;

    let sprayStatus = t("agricultureInsights.spray.good");
    let sprayIcon = ShieldCheck;
    let sprayMessage = t("agricultureInsights.spray.msgClear");
    let sprayOriginal = "Good";
    let sprayAccent = "#34d399";

    if (isRaining) {
      sprayOriginal = "Bad"; sprayStatus = t("agricultureInsights.spray.bad");
      sprayIcon = ShieldAlert; sprayMessage = t("agricultureInsights.spray.msgRain"); sprayAccent = "#f87171";
    } else if (rainExpected) {
      sprayOriginal = "Suboptimal"; sprayStatus = t("agricultureInsights.spray.suboptimal");
      sprayIcon = Droplets; sprayMessage = t("agricultureInsights.spray.msgExpected"); sprayAccent = "#fb923c";
    } else if (windSpeed > 15) {
      sprayOriginal = "Windy"; sprayStatus = t("agricultureInsights.spray.windy");
      sprayIcon = Wind; sprayMessage = t("agricultureInsights.spray.msgWindy", { speed: formatWindSpeed(2.78, windSpeedUnit) }); sprayAccent = "#facc15";
    }

    let appleAdvice   = t("agricultureInsights.crops.appleDefault");
    let apricotAdvice = t("agricultureInsights.crops.apricotDefault");
    if (temp > 25 && humidity > 70) { appleAdvice = t("agricultureInsights.crops.appleHumid"); apricotAdvice = t("agricultureInsights.crops.apricotHumid"); }
    else if (temp < 10) { appleAdvice = t("agricultureInsights.crops.appleCool"); apricotAdvice = t("agricultureInsights.crops.apricotCold"); }
    else if (windSpeed > 20) { appleAdvice = t("agricultureInsights.crops.appleWindy"); }
    else if (temp >= 15 && temp <= 25 && !isRaining) { appleAdvice = t("agricultureInsights.crops.appleOptimal"); apricotAdvice = t("agricultureInsights.crops.apricotOptimal"); }

    return {
      spray: { status: sprayStatus, icon: sprayIcon, message: sprayMessage, originalStatus: sprayOriginal, accent: sprayAccent },
      crops: { apple: appleAdvice, apricot: apricotAdvice },
      hasFrost: forecast?.list?.slice(0, 16).some(f => f.main.temp < 3) ?? false,
      isRaining,
      scab: getScabRisk(temp, humidity, isRaining),
    };
  }, [weather, forecast, windSpeedUnit, t]);

  const { activeStages, nextStage, progressPct } = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const active = ALL_STAGES.filter(s => s.months.includes(currentMonth));
    const fallback = active.length === 0 ? [ALL_STAGES[0]] : active;
    const next = ALL_STAGES.find(s => Math.min(...s.months) > currentMonth) ?? null;
    const pct = Math.round(((currentMonth + 1) / 12) * 100);
    return { activeStages: fallback, nextStage: next, progressPct: pct };
  }, []);

  const sprayWindow  = useMemo(() => getBestSprayWindow(forecast, weather.sys.sunrise, weather.sys.sunset), [forecast, weather]);
  const frostRisk    = useMemo(() => getFrostCountdown(forecast), [forecast]);
  const isInBloom    = activeStages.some(s => s.id === "fullBloom");
  const SprayIcon    = insights.spray.icon;

  return (
    <Card className="relative overflow-hidden group rounded-2xl border-none bg-card/20 backdrop-blur-md hover:bg-card/40 transition-all border-white/5 h-full">

      {/* ── Header ── */}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Sprout className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-sm font-bold tracking-tight uppercase">
            {isKashmir ? t("agricultureAdvisor.titleKashmir") : t("agricultureAdvisor.titleGeneric")}
          </CardTitle>
        </div>
        {isKashmir && (
          <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter">
            SKUAST-K
          </Badge>
        )}
      </CardHeader>

      <CardContent className="space-y-5">

        {/* ── Spray Status ── */}
        <div>
          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.1em] flex items-center gap-1.5 mb-3">
            <Bug className="h-3 w-3" />
            {t("agricultureAdvisor.spraying")}
          </p>
          <div className="rounded-xl p-4 flex items-center gap-4 border border-white/5" style={{ background: `${insights.spray.accent}14` }}>
            <div className="p-2.5 rounded-xl shrink-0" style={{ background: `${insights.spray.accent}22`, border: `1px solid ${insights.spray.accent}40` }}>
              <SprayIcon className="h-5 w-5" style={{ color: insights.spray.accent }} />
            </div>
            <div className="min-w-0">
              <p className="font-black text-sm tracking-tight leading-tight" style={{ color: insights.spray.accent }}>{insights.spray.status}</p>
              <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">{insights.spray.message}</p>
            </div>
          </div>
          {isKashmir && isInBloom && (
            <div className="mt-2 rounded-xl border border-yellow-400/20 bg-yellow-400/8 px-3.5 py-2.5 flex items-start gap-3">
              <span className="text-xl leading-none mt-0.5 shrink-0">🐝</span>
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider text-yellow-400 leading-tight">Full Bloom — No Pesticide Sprays!</p>
                <p className="text-[10px] text-muted-foreground leading-snug mt-0.5">Protect pollinators. Notify beekeepers before any future spray.</p>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-white/5" />

        {/* ── NEW: Live Smart Alerts Row (Scab + Frost + Spray Window) ── */}
        {isKashmir && (
          <div className="grid grid-cols-1 gap-2">

            {/* Apple Scab Risk */}
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.1em] flex items-center gap-1.5 mb-2">
                <Thermometer className="h-3 w-3" />
                {t("agricultureAdvisor.scabRisk")}
              </p>
              <div className="rounded-xl border border-white/5 bg-background/30 p-3.5">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🍂</span>
                    <span className="font-black text-sm" style={{ color: insights.scab.color }}>
                      {t(`agricultureAdvisor.scabLevel.${insights.scab.level}`)}
                    </span>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border" style={{ color: insights.scab.color, background: `${insights.scab.color}15`, borderColor: `${insights.scab.color}30` }}>
                    {insights.scab.label} Risk
                  </span>
                </div>
                {/* Risk gauge bar */}
                <div className="relative h-1.5 w-full rounded-full bg-muted/30 overflow-hidden">
                  <div className="absolute top-0 left-0 h-full rounded-full transition-all duration-700"
                    style={{ width: `${insights.scab.pct}%`, background: `linear-gradient(to right, #34d399, #facc15, #f87171)` }} />
                  <div className="absolute top-0 h-full w-1 bg-white/80 shadow-[0_0_6px_white] z-10 rounded-full transition-all duration-700"
                    style={{ left: `calc(${insights.scab.pct}% - 2px)` }} />
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 leading-snug">
                  {t(`agricultureAdvisor.scabDesc.${insights.scab.level}`)}
                </p>
              </div>
            </div>

            {/* Best Spray Window + Frost Countdown side by side */}
            <div className="grid grid-cols-2 gap-2">

              {/* Best Spray Window */}
              <div className="rounded-xl border border-white/5 bg-background/30 p-3">
                <p className="text-[9px] text-muted-foreground uppercase font-black tracking-[0.1em] flex items-center gap-1 mb-2">
                  <Clock className="h-2.5 w-2.5" />
                  {t("agricultureAdvisor.sprayWindow")}
                </p>
                {sprayWindow ? (
                  <>
                    <p className="font-black text-lg tracking-tight leading-none text-emerald-400 italic">
                      {sprayWindow.timeStr}
                    </p>
                    <p className="text-[9px] text-muted-foreground/70 font-black uppercase mt-1">
                      {sprayWindow.isToday ? "Today" : "Tomorrow"}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[9px] text-muted-foreground bg-muted/40 px-1.5 py-0.5 rounded-md font-bold">
                        💨 {sprayWindow.windKph} km/h
                      </span>
                      <span className="text-[9px] text-muted-foreground bg-muted/40 px-1.5 py-0.5 rounded-md font-bold">
                        🌡 {sprayWindow.temp}°C
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="font-black text-sm text-muted-foreground italic mt-1">{t("agricultureAdvisor.noWindow")}</p>
                    <p className="text-[9px] text-muted-foreground/60 mt-1">{t("agricultureAdvisor.noWindowDesc")}</p>
                  </>
                )}
              </div>

              {/* Frost Risk Countdown */}
              <div className="rounded-xl border border-white/5 bg-background/30 p-3">
                <p className="text-[9px] text-muted-foreground uppercase font-black tracking-[0.1em] flex items-center gap-1 mb-2">
                  <Snowflake className="h-2.5 w-2.5" />
                  {t("agricultureAdvisor.frostRisk")}
                </p>
                {frostRisk ? (
                  <>
                    <p className="font-black text-lg tracking-tight leading-none text-blue-400 italic">
                      {frostRisk.hoursAway}h
                    </p>
                    <p className="text-[9px] text-muted-foreground/70 font-black uppercase mt-1">{t("agricultureAdvisor.frostIn")}</p>
                    <div className="mt-2">
                      <span className="text-[9px] font-black text-blue-400 bg-blue-400/10 border border-blue-400/20 px-1.5 py-0.5 rounded-md">
                        ❄ {frostRisk.minTemp}°C min
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="font-black text-sm text-emerald-400 italic mt-1">{t("agricultureAdvisor.noFrost")}</p>
                    <p className="text-[9px] text-muted-foreground/60 mt-1">{t("agricultureAdvisor.noFrostDesc")}</p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {isKashmir && <div className="border-t border-white/5" />}

        {/* ── Crop Cards ── */}
        <div>
          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.1em] flex items-center gap-1.5 mb-3">
            <Leaf className="h-3 w-3" />
            {t("agricultureAdvisor.cropAdvice")}
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {/* Apple */}
            <div className="rounded-xl bg-background/30 border border-white/5 p-3.5 space-y-2 hover:bg-background/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base leading-none">🍎</span>
                  <span className="text-xs font-black uppercase tracking-tight">{t("agricultureInsights.crops.appleTitle")}</span>
                </div>
                {isKashmir && (
                  <span className="text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded-full border"
                    style={insights.spray.originalStatus === "Good"
                      ? { color: "#34d399", background: "#34d39914", borderColor: "#34d39930" }
                      : { color: "#fb923c", background: "#fb923c14", borderColor: "#fb923c30" }}>
                    {insights.spray.originalStatus === "Good" ? "✓ Spray OK" : "⚠ Delay"}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{insights.crops.apple}</p>
              {isKashmir && insights.spray.originalStatus === "Good" && (
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                  <ShieldCheck className="h-3 w-3" />{t("agricultureInsights.badges.optimalSpray")}
                </div>
              )}
            </div>
            {/* Apricot */}
            <div className="rounded-xl bg-background/30 border border-white/5 p-3.5 space-y-2 hover:bg-background/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base leading-none">🟠</span>
                  <span className="text-xs font-black uppercase tracking-tight">{t("agricultureInsights.crops.apricotTitle")}</span>
                </div>
                {isKashmir && insights.hasFrost && (
                  <span className="text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded-full border text-blue-400 bg-blue-400/10 border-blue-400/30">❄ Frost</span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{insights.crops.apricot}</p>
              {isKashmir && insights.hasFrost && (
                <div className="flex items-center gap-1 text-[10px] font-bold text-blue-400">
                  <AlertTriangle className="h-3 w-3" />{t("agricultureInsights.badges.frostWarning")}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-white/5" />

        {/* ── SKUAST Spray Schedule ── */}
        {isKashmir && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.1em] flex items-center gap-1.5">
                <CalendarClock className="h-3 w-3" />
                {t("agricultureInsights.schedule.title")}
              </p>
              <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter text-primary">
                {t("agricultureInsights.schedule.current")}
              </Badge>
            </div>

            {/* Season progress bar */}
            <div className="space-y-1.5">
              <div className="relative h-1.5 w-full rounded-full bg-muted/30 overflow-hidden">
                <div className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progressPct}%`, background: "linear-gradient(to right, #60a5fa, #2dd4bf, #34d399, #a3e635, #f87171)" }} />
                <div className="absolute top-0 h-full w-1 bg-white/80 shadow-[0_0_6px_white] z-10 transition-all duration-1000 ease-out rounded-full"
                  style={{ left: `calc(${progressPct}% - 2px)` }} />
              </div>
              <div className="flex justify-between text-[8px] text-muted-foreground font-black uppercase tracking-widest opacity-50">
                <span>Jan</span><span>Apr</span><span>Aug</span><span>Dec</span>
              </div>
            </div>

            {/* Active stage cards */}
            <div className="space-y-2">
              {activeStages.map(stage => (
                <div key={stage.id} className="relative rounded-xl p-4 border border-white/5 overflow-hidden transition-all duration-300 hover:scale-[1.01]"
                  style={{ background: `${stage.accent}10` }}>
                  <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl" style={{ background: stage.accent }} />
                  <div className="pl-3 flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-lg leading-none">{stage.emoji}</span>
                        <span className="font-black text-sm tracking-tight" style={{ color: stage.accent }}>
                          {t(`agricultureInsights.schedule.stages.${stage.id}`)}
                        </span>
                        {stage.bee && (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-yellow-400/15 text-yellow-400 border border-yellow-400/25">🐝 No Spray</span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {t(`agricultureInsights.schedule.stages.${stage.id}Desc`)}
                      </p>
                      <p className="text-[9px] font-black uppercase tracking-widest mt-2 opacity-60" style={{ color: stage.accent }}>📅 {stage.monthLabel}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-70" style={{ background: stage.accent }} />
                        <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: stage.accent }} />
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: stage.accent }}>Now</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Next stage */}
            {nextStage && (
              <div className="rounded-xl border border-white/5 bg-background/20 px-3.5 py-3 flex items-center gap-3">
                <span className="text-lg shrink-0">{nextStage.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Up Next</p>
                  <p className="text-xs font-bold" style={{ color: nextStage.accent }}>{t(`agricultureInsights.schedule.stages.${nextStage.id}`)}</p>
                  <p className="text-[9px] text-muted-foreground/60 font-black uppercase tracking-widest">{nextStage.monthLabel}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
              </div>
            )}

            <p className="text-[9px] text-muted-foreground/40 text-right font-bold uppercase tracking-widest">
              Source: SKUAST-K · Dept. of Horticulture J&K
            </p>
          </div>
        )}

        {/* Subtle bg icon */}
        <div className="absolute -bottom-4 -right-4 h-24 w-24 text-primary/5 -rotate-12 pointer-events-none">
          <Sprout className="h-full w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

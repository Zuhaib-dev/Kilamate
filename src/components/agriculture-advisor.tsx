import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Sprout,
  Droplets,
  Wind,
  ShieldCheck,
  ShieldAlert,
  Bug,
  CalendarClock,
  Thermometer,
  Clock,
  Snowflake,
} from "lucide-react";
import { Badge } from "./ui/badge";
import type { WeatherData, ForecastData } from "@/api/types";
import { usePreferences } from "@/hooks/use-preferences";
import { formatWindSpeed } from "@/lib/units";
import { useTranslation } from "react-i18next";
import { getAppleStagesStatus } from "@/lib/kashmir-apple-stages";
import { motion } from "framer-motion";
import { AnimateIn } from "./motion/AnimateIn";

interface AgricultureAdvisorProps {
  weather: WeatherData;
  forecast?: ForecastData | null;
}

// Mills Period: Apple Scab risk based on temp + consecutive wet hours
function getScabRisk(temp: number, humidity: number, isRaining: boolean) {
  if (temp < 2 || temp > 30) return { level: 0, label: "None", color: "#22c55e", pct: 5 };
  const wetCondition = isRaining || humidity >= 90;
  const inRange = temp >= 6 && temp <= 24;
  if (inRange && wetCondition) {
    if (humidity >= 95 || (isRaining && temp >= 10 && temp <= 20))
      return { level: 3, label: "High", color: "#ef4444", pct: 92 };
    return { level: 2, label: "Moderate", color: "#f59e0b", pct: 60 };
  }
  if (wetCondition && !inRange) return { level: 1, label: "Low", color: "#eab308", pct: 30 };
  return { level: 0, label: "None", color: "#22c55e", pct: 5 };
}

function getBestSprayWindow(forecast: ForecastData | null | undefined, sunriseTs: number, sunsetTs: number) {
  if (!forecast?.list?.length) return null;
  const now = Date.now() / 1000;
  const next24 = forecast.list.filter(f => f.dt > now && f.dt < now + 86400);
  const sunriseHr = new Date(sunriseTs * 1000).getHours();
  const sunsetHr  = new Date(sunsetTs  * 1000).getHours();

  const good = next24.find(f => {
    const hr = new Date(f.dt * 1000).getHours();
    const windKph = f.wind.speed * 3.6;
    const noRain = !["rain","drizzle"].includes(f.weather[0].main.toLowerCase()) && (!f.pop || f.pop < 0.3);
    const calmWind = windKph < 15;
    const goodTime = hr >= sunriseHr + 1 && hr <= sunsetHr - 2;
    const notMidday = hr < 12 || hr > 15;
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

function getFrostCountdown(forecast: ForecastData | null | undefined) {
  if (!forecast?.list?.length) return null;
  const now = Date.now() / 1000;
  const frostEntry = forecast.list.find(f => f.dt > now && f.main.temp < 3);
  if (!frostEntry) return null;
  const hoursAway = Math.round((frostEntry.dt - now) / 3600);
  const minTemp = Math.round(frostEntry.main.temp);
  return { hoursAway, minTemp, dt: frostEntry.dt };
}

const JK_CITIES = [
  "srinagar","baramulla","anantnag","pulwama","kupwara","shopian","bandipora","ganderbal","budgam","kulgam",
  "jammu","udhampur","rajouri","poonch","doda","ramban","kishtwar","reasi","samba","kathua",
  "leh","kargil",
];

function isInJandK(weather: WeatherData): boolean {
  const name = weather.name.toLowerCase();
  if (JK_CITIES.some(c => name.includes(c))) return true;
  const { lat, lon } = weather.coord;
  return lat > 32 && lat < 37.5 && lon > 73 && lon < 80;
}

export function AgricultureAdvisor({ weather, forecast }: AgricultureAdvisorProps) {
  const { windSpeedUnit } = usePreferences();
  const { t } = useTranslation();

  const inJK = useMemo(() => isInJandK(weather), [weather]);
  if (!inJK) return null;

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
    let sprayAccent = "#22c55e"; // Green-500

    if (isRaining) {
      sprayOriginal = "Bad"; sprayStatus = t("agricultureInsights.spray.bad");
      sprayIcon = ShieldAlert; sprayMessage = t("agricultureInsights.spray.msgRain"); sprayAccent = "#ef4444";
    } else if (rainExpected) {
      sprayOriginal = "Suboptimal"; sprayStatus = t("agricultureInsights.spray.suboptimal");
      sprayIcon = Droplets; sprayMessage = t("agricultureInsights.spray.msgExpected"); sprayAccent = "#f59e0b";
    } else if (windSpeed > 15) {
      sprayOriginal = "Windy"; sprayStatus = t("agricultureInsights.spray.windy");
      sprayIcon = Wind; sprayMessage = t("agricultureInsights.spray.msgWindy", { speed: formatWindSpeed(2.78, windSpeedUnit) }); sprayAccent = "#eab308";
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

  const { activeStages, nextStage, progressPct, daysUntilNext } = useMemo(() => {
    return getAppleStagesStatus();
  }, []);

  const sprayWindow  = useMemo(() => getBestSprayWindow(forecast, weather.sys.sunrise, weather.sys.sunset), [forecast, weather]);
  const frostRisk    = useMemo(() => getFrostCountdown(forecast), [forecast]);
  const isInBloom    = activeStages.some(s => s.id === "flowering");
  const SprayIcon    = insights.spray.icon;

  return (
    <Card className="premium-card group h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2.5 rounded-xl">
            <Sprout className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-lg font-bold tracking-tight uppercase font-heading">
            {t("agricultureAdvisor.titleKashmir")}
          </CardTitle>
        </div>
        <Badge variant="outline" className="text-[10px] font-black uppercase tracking-tighter px-2 py-1 rounded-md border-primary/20 bg-primary/5 text-primary">
          SKUAST-K
        </Badge>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Spray Window Status */}
        <AnimateIn variant="slideInLeft" delay={0.1}>
          <div className="space-y-3">
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em] flex items-center gap-2">
              <Bug className="h-3.5 w-3.5" />
              {t("agricultureAdvisor.spraying")}
            </p>
            <div className="rounded-2xl p-5 flex items-center gap-5 border transition-all duration-500 hover:scale-[1.02]" 
                 style={{ background: `${insights.spray.accent}10`, borderColor: `${insights.spray.accent}20` }}>
              <div className="p-3.5 rounded-2xl shrink-0 shadow-lg" 
                   style={{ background: `${insights.spray.accent}20`, color: insights.spray.accent }}>
                <SprayIcon className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="font-black text-base tracking-tight leading-tight" style={{ color: insights.spray.accent }}>
                  {insights.spray.status}
                </p>
                <p className="text-xs text-muted-foreground leading-snug mt-1 font-medium italic opacity-80">
                  {insights.spray.message}
                </p>
              </div>
            </div>
            {isInBloom && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 flex items-start gap-4"
              >
                <span className="text-2xl leading-none mt-1 shrink-0 animate-bounce">🐝</span>
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-amber-500 leading-tight">Full Bloom — Protect Pollinators!</p>
                  <p className="text-[11px] text-muted-foreground leading-snug mt-1 italic">Avoid all pesticide sprays during this stage. Notify local beekeepers.</p>
                </div>
              </motion.div>
            )}
          </div>
        </AnimateIn>

        <div className="border-b border-white/5 mx-[-24px]" />

        {/* Risk Alerts Row */}
        <div className="grid grid-cols-1 gap-6">
          <AnimateIn variant="slideUp" delay={0.2}>
            <div className="space-y-4">
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em] flex items-center gap-2">
                <Thermometer className="h-3.5 w-3.5" />
                {t("agricultureAdvisor.scabRisk")}
              </p>
              <div className="rounded-2xl border bg-background/20 backdrop-blur-sm p-5 hover:bg-background/30 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🍂</span>
                    <span className="font-black text-base tracking-tight" style={{ color: insights.scab.color }}>
                      {t(`agricultureAdvisor.scabLevel.${insights.scab.level}`)}
                    </span>
                  </div>
                  <Badge className="font-black uppercase tracking-widest px-3 py-1 shadow-sm" 
                         style={{ backgroundColor: insights.scab.color, color: "#fff" }}>
                    {insights.scab.label} Risk
                  </Badge>
                </div>
                
                {/* Risk Gauge Bar */}
                <div className="relative h-2 w-full rounded-full bg-muted/20 overflow-hidden shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${insights.scab.pct}%` }}
                    transition={{ duration: 1.5, ease: "circOut" }}
                    className="absolute top-0 left-0 h-full rounded-full"
                    style={{ background: `linear-gradient(to right, #22c55e, #eab308, #ef4444)` }} 
                  />
                  <motion.div 
                    animate={{ left: `calc(${insights.scab.pct}% - 4px)` }}
                    className="absolute top-0 h-full w-2 bg-white shadow-xl z-10 rounded-full" 
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-4 leading-relaxed font-medium">
                  {t(`agricultureAdvisor.scabDesc.${insights.scab.level}`)}
                </p>
              </div>
            </div>
          </AnimateIn>

          <div className="grid grid-cols-2 gap-4">
            <AnimateIn variant="scaleIn" delay={0.3}>
              <div className="rounded-2xl border bg-background/20 backdrop-blur-sm p-4 h-full flex flex-col justify-between hover:bg-background/30 transition-colors">
                <p className="text-[9px] text-muted-foreground uppercase font-black tracking-[0.15em] flex items-center gap-1.5 mb-3">
                  <Clock className="h-3 w-3" />
                  {t("agricultureAdvisor.sprayWindow")}
                </p>
                {sprayWindow ? (
                  <div className="space-y-1">
                    <p className="font-black text-xl tracking-tighter text-emerald-400 font-heading">
                      {sprayWindow.timeStr}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase">
                      {sprayWindow.isToday ? "Today" : "Tomorrow"}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <span className="text-[10px] text-muted-foreground bg-muted/30 px-2 py-1 rounded-md font-bold flex items-center gap-1">
                        💨 {sprayWindow.windKph}km/h
                      </span>
                      <span className="text-[10px] text-muted-foreground bg-muted/30 px-2 py-1 rounded-md font-bold flex items-center gap-1">
                        🌡 {sprayWindow.temp}°C
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="font-bold text-sm text-muted-foreground/60 italic leading-tight">{t("agricultureAdvisor.noWindow")}</p>
                    <p className="text-[9px] text-muted-foreground/50 font-medium leading-snug">{t("agricultureAdvisor.noWindowDesc")}</p>
                  </div>
                )}
              </div>
            </AnimateIn>

            <AnimateIn variant="scaleIn" delay={0.4}>
              <div className="rounded-2xl border bg-background/20 backdrop-blur-sm p-4 h-full flex flex-col justify-between hover:bg-background/30 transition-colors">
                <p className="text-[9px] text-muted-foreground uppercase font-black tracking-[0.15em] flex items-center gap-1.5 mb-3">
                  <Snowflake className="h-3 w-3" />
                  {t("agricultureAdvisor.frostRisk")}
                </p>
                {frostRisk ? (
                  <div className="space-y-1">
                    <p className="font-black text-xl tracking-tighter text-blue-400 font-heading">
                      {frostRisk.hoursAway}h
                    </p>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase">{t("agricultureAdvisor.frostIn")}</p>
                    <div className="mt-3">
                      <span className="text-[10px] font-black text-blue-400 bg-blue-400/10 border border-blue-400/20 px-2 py-1 rounded-md flex items-center gap-1">
                        ❄ {frostRisk.minTemp}°C
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="font-bold text-sm text-emerald-500/50 italic leading-tight">{t("agricultureAdvisor.noFrost")}</p>
                    <p className="text-[9px] text-muted-foreground/50 font-medium leading-snug">{t("agricultureAdvisor.noFrostDesc")}</p>
                  </div>
                )}
              </div>
            </AnimateIn>
          </div>
        </div>

        <div className="border-b border-white/5 mx-[-24px]" />

        {/* Season Progress */}
        <AnimateIn variant="slideUp" delay={0.5}>
          <div className="space-y-5">
            <div className="flex items-center justify-between group/header">
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em] flex items-center gap-2">
                <CalendarClock className="h-3.5 w-3.5" />
                {t("agricultureInsights.schedule.title")}
              </p>
              <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest text-primary border-primary/30 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                {t("agricultureInsights.schedule.current")}
              </Badge>
            </div>

            {/* Visual Timeline */}
            <div className="space-y-2">
              <div className="relative h-3 w-full rounded-full bg-muted/20 overflow-hidden shadow-inner p-[1px]">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 2, ease: "circOut" }}
                  className="absolute top-0 left-0 h-full rounded-full shadow-lg"
                  style={{ background: "linear-gradient(to right, #60a5fa, #2dd4bf, #22c55e, #a3e635, #ef4444)" }} 
                />
              </div>
              <div className="flex justify-between text-[9px] text-muted-foreground font-black uppercase tracking-[0.3em] opacity-40 px-1">
                <span>JAN</span><span>APR</span><span>JUL</span><span>OCT</span><span>DEC</span>
              </div>
            </div>

            {/* Active Stage Cards */}
            <div className="space-y-4">
              {activeStages.map((stage, idx) => (
                <motion.div 
                  key={stage.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + idx * 0.1 }}
                  className="relative rounded-2xl p-6 border overflow-hidden transition-all duration-300 shadow-sm hover:shadow-xl hover:bg-background/40"
                  style={{ background: `${stage.accent}08`, borderColor: `${stage.accent}25` }}
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ background: stage.accent }} />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl leading-none drop-shadow-md">{stage.emoji}</span>
                      <div>
                        <h4 className="font-black text-xl tracking-tight uppercase font-heading" style={{ color: stage.accent }}>
                          {stage.name}
                        </h4>
                        <div className="flex items-center gap-3 mt-1.5">
                           <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-2" style={{ borderColor: `${stage.accent}40`, color: stage.accent }}>
                             {stage.sprayNo} {t("agricultureAdvisor.stagesUI.sprayBadge")}
                           </Badge>
                           <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 flex items-center gap-1.5">
                             📅 {stage.monthLabel}
                           </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-40" style={{ background: stage.accent }} />
                        <span className="relative inline-flex rounded-full h-3 w-3 shadow-sm" style={{ background: stage.accent }} />
                      </span>
                      <span className="text-xs font-black uppercase tracking-widest" style={{ color: stage.accent }}>{t("agricultureAdvisor.stagesUI.active")}</span>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border p-4 bg-background/40 hover:bg-background/60 transition-colors">
                      <p className="text-[10px] text-blue-500 uppercase font-black tracking-widest mb-3 flex items-center gap-2">
                        <Droplets className="h-3.5 w-3.5" /> {t("agricultureAdvisor.stagesUI.recommendedSprays")}
                      </p>
                      <div className="space-y-4">
                        {stage.fungicide[0] !== "X" && (
                          <div>
                            <p className="text-[9px] uppercase font-black text-muted-foreground/60 mb-2">{t("agricultureAdvisor.stagesUI.fungicidesPer100L")}</p>
                            <ul className="text-[11px] text-foreground/90 space-y-2">
                              {stage.fungicide.map((f, i) => <li key={i} className="leading-snug bg-blue-500/5 p-2 rounded-lg border border-blue-500/10 font-medium">• {f}</li>)}
                            </ul>
                          </div>
                        )}
                        {stage.insecticide[0] !== "X" && (
                          <div>
                            <p className="text-[9px] uppercase font-black text-muted-foreground/60 mb-2">{t("agricultureAdvisor.stagesUI.insecticidesAcaricides")}</p>
                            <ul className="text-[11px] text-foreground/90 space-y-2">
                              {stage.insecticide.map((f, i) => <li key={i} className="leading-snug bg-purple-500/5 p-2 rounded-lg border border-purple-500/10 font-medium">• {f}</li>)}
                            </ul>
                          </div>
                        )}
                        {stage.fungicide[0] === "X" && stage.insecticide[0] === "X" && (
                          <p className="text-[11px] font-black text-emerald-500 italic flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4" /> {t("agricultureAdvisor.stagesUI.noChemicalSprays")}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="rounded-xl border p-4 bg-background/40 hover:bg-background/60 transition-colors">
                      <p className="text-[10px] text-emerald-500 uppercase font-black tracking-widest mb-3 flex items-center gap-2">
                        <Sprout className="h-3.5 w-3.5" /> {t("agricultureAdvisor.stagesUI.managementFertilizer")}
                      </p>
                      <div className="space-y-4">
                        {stage.fertilizer[0] !== "X" && (
                          <div>
                            <p className="text-[9px] uppercase font-black text-muted-foreground/60 mb-2">{t("agricultureAdvisor.stagesUI.fertilizerDosage")}</p>
                            <ul className="text-[11px] text-foreground/90 space-y-2">
                              {stage.fertilizer.map((f, i) => <li key={i} className="leading-snug bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10 font-medium">• {f}</li>)}
                            </ul>
                          </div>
                        )}
                        <div>
                          <p className="text-[9px] uppercase font-black text-muted-foreground/60 mb-2">{t("agricultureAdvisor.stagesUI.culturalPractices")}</p>
                          <ul className="text-[11px] text-foreground/90 space-y-2">
                            {stage.practices.map((p, i) => <li key={i} className="leading-snug bg-amber-500/5 p-2 rounded-lg border border-amber-500/10 font-medium">• {p}</li>)}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Next Stage Preview */}
            {nextStage && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="rounded-2xl border border-white/5 bg-background/30 p-5 flex items-center justify-between transition-all hover:bg-background/50 hover:shadow-lg cursor-default"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-muted/40 p-3 rounded-2xl shrink-0 text-3xl">
                    {nextStage.emoji}
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1" style={{ color: nextStage.accent }}>
                      {t("agricultureAdvisor.stagesUI.upNext")}
                    </p>
                    <h5 className="text-base font-black tracking-tight uppercase font-heading">{nextStage.name}</h5>
                    <p className="text-[11px] text-muted-foreground font-medium opacity-70">
                       Starts in approx. <span className="text-foreground">{daysUntilNext} days</span>
                    </p>
                  </div>
                </div>
                <div className="bg-background/60 border rounded-2xl p-3 text-center min-w-[70px] shadow-sm">
                  <span className="block text-xl font-black leading-none" style={{ color: nextStage.accent }}>{daysUntilNext}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-1 block">Days</span>
                </div>
              </motion.div>
            )}
          </div>
        </AnimateIn>

        <p className="text-[10px] text-muted-foreground/40 text-center font-black uppercase tracking-[0.3em] pt-4">
          Source: SKUAST-K Kashmir · Dept. of Horticulture
        </p>
      </CardContent>

      {/* Decorative Background Icon */}
      <div className="absolute -bottom-8 -right-8 h-32 w-32 text-primary/5 -rotate-12 pointer-events-none group-hover:scale-110 transition-transform duration-700">
        <Sprout className="h-full w-full" />
      </div>
    </Card>
  );
}


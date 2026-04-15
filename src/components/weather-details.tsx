import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Eye, Compass, Thermometer, Sun } from "lucide-react";
import type { WeatherData } from "@/api/types";
import { useTranslation } from "react-i18next";
import { usePreferences } from "@/hooks/use-preferences";
import { convertTemperature } from "@/lib/units";
import { motion } from "framer-motion";
import { staggerContainer, slideUp } from "@/lib/animations";

interface WeatherDetailsProps {
  data: WeatherData;
}

// ─── Dew Point (Magnus formula) ────────────────────────────────────────────
function calcDewPoint(tempC: number, humidity: number): number {
  const a = 17.625;
  const b = 243.04;
  const alpha = (a * tempC) / (b + tempC) + Math.log(humidity / 100);
  return (b * alpha) / (a - alpha);
}

// ─── UV Index estimate from condition ID + solar altitude heuristic ─────────
// OWM free tier doesn't expose UV, so we estimate from cloud cover + time of day.
function estimateUVI(conditionId: number, dt: number, sunrise: number, sunset: number): number {
  const now = dt;
  if (now < sunrise || now > sunset) return 0;          // night
  const dayLen = sunset - sunrise;
  const elapsed = now - sunrise;
  const solarFraction = elapsed / dayLen;               // 0→1 across the day
  // Peak is at solar noon (0.5). Use sine to model the arc.
  const solarArc = Math.sin(solarFraction * Math.PI);  // 0→1→0
  const clearSkyUVI = 10 * solarArc;                   // theoretical clear-sky peak ≈ 10
  // Attenuate by cloud cover derived from condition ID
  let cloudFactor = 1;
  if (conditionId >= 200 && conditionId < 300) cloudFactor = 0.05; // thunderstorm
  else if (conditionId >= 300 && conditionId < 500) cloudFactor = 0.2; // drizzle/rain
  else if (conditionId >= 500 && conditionId < 600) cloudFactor = 0.15;
  else if (conditionId >= 600 && conditionId < 700) cloudFactor = 0.3; // snow
  else if (conditionId >= 700 && conditionId < 800) cloudFactor = 0.5; // mist/haze
  else if (conditionId === 800) cloudFactor = 1;        // clear
  else if (conditionId === 801) cloudFactor = 0.85;
  else if (conditionId === 802) cloudFactor = 0.65;
  else if (conditionId <= 804) cloudFactor = 0.4;
  return Math.round(clearSkyUVI * cloudFactor * 10) / 10;
}

function getUVILabel(uvi: number): { label: string; color: string; bg: string; bar: string } {
  if (uvi === 0)   return { label: "Night",     color: "text-slate-400",  bg: "bg-slate-400/10",  bar: "bg-slate-400" };
  if (uvi <= 2)    return { label: "Low",       color: "text-green-500",  bg: "bg-green-500/10",  bar: "bg-green-500" };
  if (uvi <= 5)    return { label: "Moderate",  color: "text-yellow-500", bg: "bg-yellow-500/10", bar: "bg-yellow-500" };
  if (uvi <= 7)    return { label: "High",      color: "text-orange-500", bg: "bg-orange-500/10", bar: "bg-orange-500" };
  if (uvi <= 10)   return { label: "Very High", color: "text-red-500",    bg: "bg-red-500/10",    bar: "bg-red-500" };
  return               { label: "Extreme",   color: "text-purple-500", bg: "bg-purple-500/10", bar: "bg-purple-500" };
}

function getWindDirection(degree: number): string {
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const idx = Math.round(((degree %= 360) < 0 ? degree + 360 : degree) / 22.5) % 16;
  return dirs[idx];
}

function getDewPointComfort(dewC: number): { label: string; color: string } {
  if (dewC < 10)  return { label: "Very dry",       color: "text-slate-400" };
  if (dewC < 13)  return { label: "Comfortable",    color: "text-green-500" };
  if (dewC < 16)  return { label: "Pleasant",       color: "text-green-400" };
  if (dewC < 18)  return { label: "Slightly humid", color: "text-yellow-500" };
  if (dewC < 21)  return { label: "Humid",          color: "text-orange-400" };
  if (dewC < 24)  return { label: "Very humid",     color: "text-orange-500" };
  return               { label: "Oppressive",    color: "text-red-500" };
}

function getVisibilityLabel(km: number): { label: string; color: string } {
  if (km >= 10) return { label: "Excellent",   color: "text-green-500" };
  if (km >= 5)  return { label: "Good",        color: "text-yellow-500" };
  if (km >= 2)  return { label: "Moderate",    color: "text-orange-400" };
  if (km >= 1)  return { label: "Poor",        color: "text-orange-500" };
  return             { label: "Very poor",  color: "text-red-500" };
}

export function WeatherDetails({ data }: WeatherDetailsProps) {
  const { t } = useTranslation();
  const { temperatureUnit } = usePreferences();

  const { wind, main, sys, weather, visibility, dt } = data;
  const conditionId = weather[0]?.id ?? 800;

  // Derived values
  const dewPointC = calcDewPoint(main.temp, main.humidity);
  const dewPointDisplay = Math.round(convertTemperature(dewPointC, temperatureUnit));
  const dewUnit = temperatureUnit === "celsius" ? "°C" : "°F";
  const dewComfort = getDewPointComfort(dewPointC);

  const uvi = estimateUVI(conditionId, dt, sys.sunrise, sys.sunset);
  const uviInfo = getUVILabel(uvi);
  const uviPct = Math.min((uvi / 11) * 100, 100);

  const windDir = getWindDirection(wind.deg);

  const visKm = (visibility ?? 10000) / 1000;
  const visInfo = getVisibilityLabel(visKm);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{t("weather.details")}</CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div
          className="grid gap-4 sm:grid-cols-2"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >

          {/* ── Wind Compass ─────────────────────────────────── */}
          <motion.div
            className="flex items-center gap-4 rounded-lg border p-4 col-span-full sm:col-span-1"
            variants={slideUp}
            whileHover={{ scale: 1.01, y: -2, boxShadow: "0px 8px 24px rgba(0,0,0,0.1)" }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
          >
            <div className="relative flex-shrink-0 w-16 h-16">
              <svg viewBox="0 0 64 64" className="w-full h-full text-muted-foreground">
                <circle cx="32" cy="32" r="30" fill="none" strokeWidth="1.5" stroke="currentColor" strokeOpacity="0.25" />
                {[0, 90, 180, 270].map((angle) => {
                  const rad = (angle * Math.PI) / 180;
                  const x1 = 32 + 26 * Math.sin(rad);
                  const y1 = 32 - 26 * Math.cos(rad);
                  const x2 = 32 + 30 * Math.sin(rad);
                  const y2 = 32 - 30 * Math.cos(rad);
                  return <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="2" strokeOpacity="0.4" />;
                })}
                <text x="32" y="8"  textAnchor="middle" fontSize="6" fill="currentColor" fillOpacity="0.5">N</text>
                <text x="32" y="60" textAnchor="middle" fontSize="6" fill="currentColor" fillOpacity="0.5">S</text>
                <text x="58" y="34" textAnchor="middle" fontSize="6" fill="currentColor" fillOpacity="0.5">E</text>
                <text x="6"  y="34" textAnchor="middle" fontSize="6" fill="currentColor" fillOpacity="0.5">W</text>
                {/* Animated compass arrow */}
                <motion.g
                  initial={{ rotate: 0 }}
                  animate={{ rotate: wind.deg }}
                  transition={{ type: "spring", stiffness: 80, damping: 15, delay: 0.4 }}
                  style={{ transformOrigin: "32px 32px" }}
                >
                  <polygon points="32,6 28,32 32,28 36,32" fill="#ef4444" />
                  <polygon points="32,58 28,32 32,36 36,32" fill="currentColor" fillOpacity="0.3" />
                </motion.g>
                <circle cx="32" cy="32" r="3" fill="hsl(var(--background))" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <Compass className="h-3.5 w-3.5" />
                {t("weather.windDirection")}
              </p>
              <p className="text-2xl font-bold tracking-tight mt-0.5">{windDir}</p>
              <p className="text-xs text-muted-foreground">{wind.deg}° — from {windDir}</p>
            </div>
          </motion.div>

          {/* ── UV Index ─────────────────────────────────── */}
          <motion.div
            className="rounded-lg border p-4"
            variants={slideUp}
            whileHover={{ scale: 1.01, y: -2, boxShadow: "0px 8px 24px rgba(0,0,0,0.1)" }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
          >
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-3">
              <Sun className="h-3.5 w-3.5" />
              UV Index
            </p>
            <div className="flex items-baseline gap-2 mb-2">
              <motion.span
                className="text-2xl font-bold tracking-tight"
                initial={{ opacity: 0, scale: 0.7 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.15 }}
              >
                {uvi}
              </motion.span>
              <span className={`text-sm font-semibold ${uviInfo.color}`}>{uviInfo.label}</span>
            </div>
            {/* UV bar — animated fill */}
            <div className="relative h-2 w-full rounded-full bg-muted overflow-hidden mt-1">
              <motion.div
                className={`h-full rounded-full ${uviInfo.bar}`}
                initial={{ width: 0 }}
                whileInView={{ width: `${uviPct}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
              />
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white border border-black/20 shadow-sm"
                initial={{ left: "0%" }}
                whileInView={{ left: `calc(${uviPct}% - 4px)` }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>0 {t("weather.low")}</span><span>6 {t("weather.high")}</span><span>11+ {t("weather.extreme")}</span>
            </div>
            {uvi > 0 && (
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                {uvi <= 2 && "No protection needed."}
                {uvi > 2 && uvi <= 5 && "Wear sunscreen SPF 30+."}
                {uvi > 5 && uvi <= 7 && "Seek shade during midday hours."}
                {uvi > 7 && uvi <= 10 && "Sun protection essential."}
                {uvi > 10 && "Avoid outdoor exposure if possible."}
              </p>
            )}
          </motion.div>

          {/* ── Dew Point ─────────────────────────────────── */}
          <motion.div
            className="rounded-lg border p-4"
            variants={slideUp}
            whileHover={{ scale: 1.01, y: -2, boxShadow: "0px 8px 24px rgba(0,0,0,0.1)" }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
          >
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-3">
              <Thermometer className="h-3.5 w-3.5" />
              Dew Point
            </p>
            <div className="flex items-baseline gap-2 mb-1">
              <motion.span
                className="text-2xl font-bold tracking-tight"
                initial={{ opacity: 0, scale: 0.7 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
              >
                {dewPointDisplay}
                <span className="text-base font-medium text-muted-foreground">{dewUnit}</span>
              </motion.span>
            </div>
            <span className={`text-sm font-semibold ${dewComfort.color}`}>{dewComfort.label}</span>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              {dewPointC < 10 && "Air feels very dry. Stay hydrated."}
              {dewPointC >= 10 && dewPointC < 16 && "Comfortable outdoor conditions."}
              {dewPointC >= 16 && dewPointC < 21 && "You may notice some humidity."}
              {dewPointC >= 21 && "Feels muggy; sweat evaporates slowly."}
            </p>
          </motion.div>

          {/* ── Visibility ─────────────────────────────────── */}
          <motion.div
            className="rounded-lg border p-4"
            variants={slideUp}
            whileHover={{ scale: 1.01, y: -2, boxShadow: "0px 8px 24px rgba(0,0,0,0.1)" }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
          >
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-3">
              <Eye className="h-3.5 w-3.5" />
              {t("weather.visibility") || "Visibility"}
            </p>
            <div className="flex items-baseline gap-2 mb-1">
              <motion.span
                className="text-2xl font-bold tracking-tight"
                initial={{ opacity: 0, scale: 0.7 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
              >
                {visKm >= 10 ? "10+" : visKm.toFixed(1)}
              </motion.span>
              <span className="text-sm text-muted-foreground">km</span>
            </div>
            <span className={`text-sm font-semibold ${visInfo.color}`}>{visInfo.label}</span>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              {visKm >= 10 && "Crystal clear visibility."}
              {visKm >= 5 && visKm < 10 && "Good conditions for driving."}
              {visKm >= 2 && visKm < 5 && "Reduced visibility — drive carefully."}
              {visKm < 2 && "Foggy — use low-beam headlights."}
            </p>
          </motion.div>

        </motion.div>
      </CardContent>
    </Card>
  );
}

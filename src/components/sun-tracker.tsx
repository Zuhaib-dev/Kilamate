import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Sunrise, Sunset, Moon } from "lucide-react";
import { format } from "date-fns";
import type { WeatherData } from "@/api/types";
import { useTranslation } from "react-i18next";
import { memo } from "react";
import { motion } from "framer-motion";

interface SunTrackerProps {
  data: WeatherData;
}

function formatTime(ts: number) {
  return format(new Date(ts * 1000), "h:mm a");
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

// Convert polar angle to SVG arc coordinates on a 200-wide, 110-tall viewport
// The arc is a semicircle: left = sunrise (angle=180°), right = sunset (angle=0°)
function polarToXY(angleDeg: number, cx: number, cy: number, r: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy - r * Math.sin(rad),
  };
}

export const SunTracker = memo(function SunTracker({ data }: SunTrackerProps) {
  const { t } = useTranslation();
  const { sys, dt } = data;
  const { sunrise, sunset } = sys;

  const now = dt;
  const isDay = now >= sunrise && now <= sunset;
  const isBeforeSunrise = now < sunrise;

  // Sun progress: 0 (sunrise) → 1 (sunset)
  const dayLen = sunset - sunrise;
  const elapsed = Math.max(0, Math.min(now - sunrise, dayLen));
  const progress = dayLen > 0 ? elapsed / dayLen : 0;

  // Map progress to arc angle: 180° (left/sunrise) → 0° (right/sunset)
  const sunAngleDeg = 180 - progress * 180;

  // SVG layout constants
  const cx = 110; // center x
  const cy = 110; // center y (bottom of card area)
  const r = 90;   // arc radius

  const sunPos = isDay ? polarToXY(sunAngleDeg, cx, cy, r) : null;

  // Sky gradient colors based on time of day
  const getSkyColors = () => {
    if (!isDay) return { from: "#0f172a", to: "#1e293b", sun: "#f8fafc" };
    if (progress < 0.1) return { from: "#f97316", to: "#fbbf24", sun: "#fef08a" }; // dawn
    if (progress < 0.3) return { from: "#fbbf24", to: "#bae6fd", sun: "#fef08a" }; // morning
    if (progress < 0.7) return { from: "#38bdf8", to: "#7dd3fc", sun: "#fef08a" }; // midday
    if (progress < 0.9) return { from: "#fb923c", to: "#f97316", sun: "#fed7aa" }; // evening
    return { from: "#dc2626", to: "#7c3aed", sun: "#fda4af" }; // dusk
  };

  const sky = getSkyColors();

  // Time info
  const timeUntilSunset = sunset - now;
  const timeUntilSunrise = sunrise - now;

  return (
    <Card className="overflow-hidden h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          {isDay ? (
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sunrise className="h-4 w-4 text-orange-400" />
            </motion.div>
          ) : (
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Moon className="h-4 w-4 text-slate-400" />
            </motion.div>
          )}
          {t("weather.sunrise") && "Sun Tracker"}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* SVG Arc */}
        <div className="relative w-full" style={{ paddingBottom: "52%" }}>
          <svg
            viewBox="0 0 220 120"
            className="absolute inset-0 w-full h-full"
            aria-label="Sun position arc"
          >
            <defs>
              {/* Sky gradient background - more vibrant multi-stop */}
              <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={sky.from} stopOpacity={0.25} />
                <stop offset="50%" stopColor={sky.from} stopOpacity={0.1} />
                <stop offset="100%" stopColor={sky.to} stopOpacity={0.05} />
              </linearGradient>
              
              {/* Glowing sun core */}
              <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor={sky.sun} stopOpacity={1} />
                <stop offset="30%"  stopColor={sky.sun} stopOpacity={0.8} />
                <stop offset="100%" stopColor={sky.sun} stopOpacity={0} />
              </radialGradient>

              {/* Arc glow effect */}
              <filter id="arcGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>

              {/* Horizon mask */}
              <clipPath id="aboveHorizon">
                <rect x="0" y="0" width="220" height="110" />
              </clipPath>
            </defs>

            {/* Background Atmosphere */}
            <rect x="10" y="5" width="200" height="105" rx="16" fill="url(#skyGrad)" className="transition-all duration-1000" />

            {/* Horizon line - subtle and thin */}
            <line x1="20" y1="110" x2="200" y2="110" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.5" />

            {/* Main Arc Track */}
            <path
              d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.08"
              strokeWidth="1.5"
              strokeLinecap="round"
              clipPath="url(#aboveHorizon)"
            />

            {/* Progress Path with Glow */}
            {isDay && progress > 0 && (() => {
              const startPt = polarToXY(180, cx, cy, r);
              const endPt   = polarToXY(sunAngleDeg, cx, cy, r);
              const largeArc = progress > 0.5 ? 1 : 0;
              return (
                <motion.path
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  d={`M ${startPt.x} ${startPt.y} A ${r} ${r} 0 ${largeArc} 1 ${endPt.x} ${endPt.y}`}
                  fill="none"
                  stroke={sky.sun}
                  strokeOpacity={0.4}
                  strokeWidth="3"
                  strokeLinecap="round"
                  clipPath="url(#aboveHorizon)"
                  filter="url(#arcGlow)"
                />
              );
            })()}

            {/* Terminal points (Sunrise/Sunset) */}
            <circle cx={cx - r} cy={cy} r="3" fill="#f97316" fillOpacity={0.6} />
            <circle cx={cx + r} cy={cy} r="3" fill="#7c3aed" fillOpacity={0.6} />

            {/* Labels for Sunrise/Sunset */}
            <text x={cx - r} y={cy + 18} textAnchor="middle" fontSize="8" fontWeight="700" fill="currentColor" fillOpacity={0.4} className="font-heading">
              {formatTime(sunrise)}
            </text>
            <text x={cx + r} y={cy + 18} textAnchor="middle" fontSize="8" fontWeight="700" fill="currentColor" fillOpacity={0.4} className="font-heading">
              {formatTime(sunset)}
            </text>

            {/* Interactive Sun Component */}
            {isDay && sunPos && (
              <motion.g
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
              >
                {/* Sun Outer Glow pulsing */}
                <motion.circle
                  cx={sunPos.x} cy={sunPos.y} r="18"
                  fill="url(#sunGlow)"
                  animate={{ r: [18, 24, 18], opacity: [0.6, 0.3, 0.6] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
                {/* Sun Core */}
                <circle
                  cx={sunPos.x} cy={sunPos.y} r="7"
                  fill={sky.sun}
                  className="shadow-xl"
                />
                
                {/* Vertical Indicator */}
                <line
                  x1={sunPos.x} y1={sunPos.y + 10}
                  x2={sunPos.x} y2={cy}
                  stroke={sky.sun} strokeOpacity={0.2}
                  strokeWidth="0.5"
                  strokeDasharray="2 2"
                />
              </motion.g>
            )}

            {/* Night Visuals */}
            {!isDay && (
              <motion.g
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
              >
                <text x={cx} y={cy - 20} textAnchor="middle" fontSize="32">🌙</text>
                <text x={cx} y={cy - 60} textAnchor="middle" fontSize="10" fontWeight="800" fill="currentColor" fillOpacity={0.3} className="uppercase tracking-[0.2em]">
                  {t("sun.nighttime")}
                </text>
              </motion.g>
            )}
          </svg>
        </div>

        {/* Bottom info row */}
        <motion.div
          className="grid grid-cols-3 gap-2 text-center"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 250, damping: 26, delay: 0.2 }}
        >
          <div className="space-y-0.5">
            <div className="flex items-center justify-center gap-1 text-orange-400">
              <Sunrise className="h-3.5 w-3.5" />
              <span className="text-xs font-semibold">{t("weather.sunrise")}</span>
            </div>
            <p className="text-sm font-bold tabular-nums">{formatTime(sunrise)}</p>
          </div>

          <div className="space-y-0.5 border-x px-2">
            <p className="text-xs text-muted-foreground">
              {isDay
                ? (timeUntilSunset > 0 ? t("sun.sunsetIn") : t("sun.sunHasSet"))
                : isBeforeSunrise
                  ? t("sun.sunriseIn")
                  : t("sun.nextSunrise")
              }
            </p>
            <p className="text-sm font-bold tabular-nums text-primary">
              {isDay && timeUntilSunset > 0
                ? formatDuration(timeUntilSunset)
                : !isDay && isBeforeSunrise
                  ? formatDuration(timeUntilSunrise)
                  : formatDuration(86400 - (now - sunset))
              }
            </p>
            <p className="text-[10px] text-muted-foreground">
              {isDay ? t("sun.daylightPercent", { percent: Math.round(progress * 100) }) : t("sun.nighttime")}
            </p>
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center justify-center gap-1 text-purple-400">
              <Sunset className="h-3.5 w-3.5" />
              <span className="text-xs font-semibold">{t("weather.sunset")}</span>
            </div>
            <p className="text-sm font-bold tabular-nums">{formatTime(sunset)}</p>
          </div>
        </motion.div>

        {/* Day length */}
        <div className="text-center text-xs text-muted-foreground pt-1 border-t">
          {t("sun.dayLength")}: <span className="font-medium text-foreground">{formatDuration(dayLen)}</span>
        </div>
      </CardContent>
    </Card>
  );
});

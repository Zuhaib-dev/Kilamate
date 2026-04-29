import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Sunrise, Sunset, Moon, Camera } from "lucide-react";
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

  // Golden Hour definition (roughly 1 hour after sunrise, 1 hour before sunset)
  const GOLDEN_HOUR_DURATION = 3600; // 1 hour in seconds
  const morningGoldenEnd = sunrise + GOLDEN_HOUR_DURATION;
  const eveningGoldenStart = sunset - GOLDEN_HOUR_DURATION;

  const isMorningGolden = now >= sunrise && now <= morningGoldenEnd;
  const isEveningGolden = now >= eveningGoldenStart && now <= sunset;
  const isGoldenHour = isMorningGolden || isEveningGolden;

  // Sun progress: 0 (sunrise) → 1 (sunset)
  const dayLen = sunset - sunrise;
  const elapsed = Math.max(0, Math.min(now - sunrise, dayLen));
  const progress = dayLen > 0 ? Math.max(0, Math.min(elapsed / dayLen, 1)) : 0;

  // Map progress to arc angle: 180° (left/sunrise) → 0° (right/sunset)
  const sunAngleDeg = 180 - progress * 180;

  const morningGoldenProgress = Math.min(GOLDEN_HOUR_DURATION / dayLen, 0.5);
  const eveningGoldenProgress = Math.max(1 - (GOLDEN_HOUR_DURATION / dayLen), 0.5);

  const morningGoldenAngleEnd = 180 - (morningGoldenProgress * 180);
  const eveningGoldenAngleStart = 180 - (eveningGoldenProgress * 180);

  // SVG layout constants
  const cx = 110; // center x
  const cy = 110; // center y (bottom of card area)
  const r = 90;   // arc radius

  const sunPos = isDay ? polarToXY(sunAngleDeg, cx, cy, r) : null;

  // Generate path for an arc segment
  const getArcPath = (startAngle: number, endAngle: number) => {
    const startPt = polarToXY(startAngle, cx, cy, r);
    const endPt = polarToXY(endAngle, cx, cy, r);
    // Determine large arc flag based on angle difference
    const diff = Math.abs(startAngle - endAngle);
    const largeArc = diff > 180 ? 1 : 0;
    return `M ${startPt.x} ${startPt.y} A ${r} ${r} 0 ${largeArc} 1 ${endPt.x} ${endPt.y}`;
  };

  // Sky gradient colors based on time of day
  const getSkyColors = () => {
    if (!isDay) return { from: "#0f172a", to: "#1e293b", sun: "#f8fafc", mode: "night" };
    if (isGoldenHour) return { from: "#f59e0b", to: "#fbbf24", sun: "#fef08a", mode: "golden" };
    if (progress < 0.3) return { from: "#38bdf8", to: "#bae6fd", sun: "#fef08a", mode: "morning" };
    if (progress < 0.7) return { from: "#0ea5e9", to: "#7dd3fc", sun: "#fef08a", mode: "midday" };
    return { from: "#38bdf8", to: "#bae6fd", sun: "#fef08a", mode: "afternoon" };
  };

  const sky = getSkyColors();

  // Time info
  const timeUntilSunset = sunset - now;
  const timeUntilSunrise = sunrise - now;
  
  let primaryStatus = "";
  let secondaryStatus = "";
  
  if (isGoldenHour) {
    primaryStatus = "Golden Hour Active!";
    secondaryStatus = `Ends in ${formatDuration(isMorningGolden ? morningGoldenEnd - now : sunset - now)}`;
  } else if (isDay) {
    if (now < eveningGoldenStart) {
      primaryStatus = "Golden Hour In";
      secondaryStatus = formatDuration(eveningGoldenStart - now);
    } else {
      primaryStatus = "Sunset In";
      secondaryStatus = formatDuration(timeUntilSunset);
    }
  } else {
    primaryStatus = "Sunrise In";
    secondaryStatus = isBeforeSunrise 
      ? formatDuration(timeUntilSunrise) 
      : formatDuration(86400 - (now - sunset));
  }

  return (
    <Card className={`overflow-hidden h-full border-border/50 transition-colors duration-1000 ${isGoldenHour ? 'bg-amber-500/10 dark:bg-amber-900/20 border-amber-500/30' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-bold tracking-tight">
            {isGoldenHour ? (
              <motion.div
                animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="bg-amber-500/20 p-1.5 rounded-full"
              >
                <Camera className="h-4 w-4 text-amber-500" />
              </motion.div>
            ) : isDay ? (
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
            Sun Tracker
          </CardTitle>
          <div className="text-right">
            <p className={`text-xs font-bold uppercase tracking-wider ${isGoldenHour ? 'text-amber-500' : 'text-muted-foreground'}`}>{primaryStatus}</p>
            <p className={`text-sm font-black tabular-nums ${isGoldenHour ? 'text-amber-600 dark:text-amber-400' : 'text-foreground'}`}>{secondaryStatus}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        {/* SVG Arc */}
        <div className="relative w-full" style={{ paddingBottom: "50%" }}>
          <svg
            viewBox="0 0 220 120"
            className="absolute inset-0 w-full h-full"
            aria-label="Sun position arc"
          >
            <defs>
              <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={sky.from} stopOpacity={0.25} />
                <stop offset="50%" stopColor={sky.from} stopOpacity={0.1} />
                <stop offset="100%" stopColor={sky.to} stopOpacity={0.05} />
              </linearGradient>
              
              <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor={sky.sun} stopOpacity={1} />
                <stop offset="30%"  stopColor={sky.sun} stopOpacity={0.8} />
                <stop offset="100%" stopColor={sky.sun} stopOpacity={0} />
              </radialGradient>

              <filter id="arcGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Background Atmosphere */}
            <rect x="10" y="5" width="200" height="105" rx="16" fill="url(#skyGrad)" className="transition-all duration-1000" />

            {/* Horizon line */}
            <line x1="20" y1="110" x2="200" y2="110" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.5" />

            {/* Base Arc Track (Full Day) */}
            <path
              d={getArcPath(180, 0)}
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.08"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Morning Golden Hour Highlight */}
            <path
              d={getArcPath(180, morningGoldenAngleEnd)}
              fill="none"
              stroke="#fbbf24"
              strokeOpacity={0.4}
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Evening Golden Hour Highlight */}
            <path
              d={getArcPath(eveningGoldenAngleStart, 0)}
              fill="none"
              stroke="#fbbf24"
              strokeOpacity={0.4}
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Progress Path */}
            {isDay && progress > 0 && (() => {
              // Ensure we draw from left (180) towards right (sunAngleDeg)
              const pathStr = getArcPath(180, sunAngleDeg);
              return (
                <motion.path
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  d={pathStr}
                  fill="none"
                  stroke={isGoldenHour ? "#f59e0b" : sky.sun}
                  strokeOpacity={0.6}
                  strokeWidth="3"
                  strokeLinecap="round"
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
                  cx={sunPos.x} cy={sunPos.y} r={isGoldenHour ? "22" : "18"}
                  fill="url(#sunGlow)"
                  animate={{ r: isGoldenHour ? [22, 28, 22] : [18, 24, 18], opacity: [0.6, 0.3, 0.6] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
                {/* Sun Core */}
                <circle
                  cx={sunPos.x} cy={sunPos.y} r={isGoldenHour ? "8" : "7"}
                  fill={isGoldenHour ? "#f59e0b" : sky.sun}
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
                  {t("sun.nighttime") || "Nighttime"}
                </text>
              </motion.g>
            )}
          </svg>
        </div>

        {/* Bottom info row */}
        <motion.div
          className="grid grid-cols-3 gap-2 text-center items-end"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 250, damping: 26, delay: 0.2 }}
        >
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-orange-400">
              <Sunrise className="h-4 w-4" />
            </div>
            <p className="text-sm font-bold tabular-nums">{formatTime(sunrise)}</p>
          </div>

          <div className="space-y-1 border-x px-2">
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
              {t("sun.dayLength") || "Day Length"}
            </p>
            <p className="text-sm font-bold tabular-nums text-foreground">
              {formatDuration(dayLen)}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-purple-400">
              <Sunset className="h-4 w-4" />
            </div>
            <p className="text-sm font-bold tabular-nums">{formatTime(sunset)}</p>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
});

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Sunrise, Sunset, Moon } from "lucide-react";
import { format } from "date-fns";
import type { WeatherData } from "@/api/types";
import { useTranslation } from "react-i18next";
import { memo } from "react";

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
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          {isDay ? (
            <Sunrise className="h-4 w-4 text-orange-400" />
          ) : (
            <Moon className="h-4 w-4 text-slate-400" />
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
              {/* Sky gradient background */}
              <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={sky.from} stopOpacity={0.15} />
                <stop offset="100%" stopColor={sky.to} stopOpacity={0.05} />
              </linearGradient>
              {/* Glowing sun */}
              <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor={sky.sun} stopOpacity={1} />
                <stop offset="60%"  stopColor={sky.sun} stopOpacity={0.6} />
                <stop offset="100%" stopColor={sky.sun} stopOpacity={0} />
              </radialGradient>
              {/* Arc glow filter */}
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              {/* Horizon mask — hide below horizon */}
              <clipPath id="aboveHorizon">
                <rect x="0" y="0" width="220" height="110" />
              </clipPath>
            </defs>

            {/* Background fill */}
            <rect x="10" y="0" width="200" height="115" rx="8" fill="url(#skyGrad)" />

            {/* Horizon line */}
            <line x1="10" y1="110" x2="210" y2="110" stroke="currentColor" strokeOpacity="0.15" strokeWidth="1" />

            {/* Arc track (full semicircle) */}
            <path
              d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.12"
              strokeWidth="2"
              clipPath="url(#aboveHorizon)"
            />

            {/* Completed arc (progress portion) */}
            {isDay && progress > 0 && (() => {
              const startPt = polarToXY(180, cx, cy, r);
              const endPt   = polarToXY(sunAngleDeg, cx, cy, r);
              const largeArc = progress > 0.5 ? 1 : 0;
              return (
                <path
                  d={`M ${startPt.x} ${startPt.y} A ${r} ${r} 0 ${largeArc} 1 ${endPt.x} ${endPt.y}`}
                  fill="none"
                  stroke={sky.sun}
                  strokeOpacity={0.5}
                  strokeWidth="2"
                  clipPath="url(#aboveHorizon)"
                  filter="url(#glow)"
                />
              );
            })()}

            {/* Sunrise dot */}
            <circle cx={cx - r} cy={cy} r="4" fill="#f97316" fillOpacity={0.8} />
            {/* Sunset dot */}
            <circle cx={cx + r} cy={cy} r="4" fill="#7c3aed" fillOpacity={0.8} />

            {/* Sunrise label */}
            <text x={cx - r} y={cy + 14} textAnchor="middle" fontSize="7" fill="currentColor" fillOpacity={0.5}>
              {formatTime(sunrise)}
            </text>
            {/* Sunset label */}
            <text x={cx + r} y={cy + 14} textAnchor="middle" fontSize="7" fill="currentColor" fillOpacity={0.5}>
              {formatTime(sunset)}
            </text>

            {/* Sun position (daytime) */}
            {isDay && sunPos && (
              <>
                {/* Glow halo */}
                <circle cx={sunPos.x} cy={sunPos.y} r="14" fill="url(#sunGlow)" clipPath="url(#aboveHorizon)" />
                {/* Sun core */}
                <circle cx={sunPos.x} cy={sunPos.y} r="6" fill={sky.sun} clipPath="url(#aboveHorizon)" filter="url(#glow)" />
                {/* Sun rays (cross) */}
                {[0, 45, 90, 135].map((ang) => {
                  const rad = (ang * Math.PI) / 180;
                  const dx = Math.cos(rad) * 10;
                  const dy = Math.sin(rad) * 10;
                  return (
                    <line
                      key={ang}
                      x1={sunPos.x - dx} y1={sunPos.y - dy}
                      x2={sunPos.x + dx} y2={sunPos.y + dy}
                      stroke={sky.sun} strokeOpacity={0.35} strokeWidth={1.5}
                      strokeLinecap="round"
                      clipPath="url(#aboveHorizon)"
                    />
                  );
                })}
              </>
            )}

            {/* Moon (nighttime) */}
            {!isDay && (
              <text x={cx} y={cy - 30} textAnchor="middle" fontSize="28" fill="#94a3b8">🌙</text>
            )}

            {/* Vertical dotted "now" line from sun to horizon */}
            {isDay && sunPos && (
              <line
                x1={sunPos.x} y1={sunPos.y + 8}
                x2={sunPos.x} y2={cy}
                stroke={sky.sun} strokeOpacity={0.25} strokeWidth={1}
                strokeDasharray="3 2"
                clipPath="url(#aboveHorizon)"
              />
            )}
          </svg>
        </div>

        {/* Bottom info row */}
        <div className="grid grid-cols-3 gap-2 text-center">
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
                ? (timeUntilSunset > 0 ? "Sunset in" : "Sun has set")
                : isBeforeSunrise
                  ? "Sunrise in"
                  : "Next sunrise"
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
              {isDay ? `${Math.round(progress * 100)}% of daylight` : "Nighttime"}
            </p>
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center justify-center gap-1 text-purple-400">
              <Sunset className="h-3.5 w-3.5" />
              <span className="text-xs font-semibold">{t("weather.sunset")}</span>
            </div>
            <p className="text-sm font-bold tabular-nums">{formatTime(sunset)}</p>
          </div>
        </div>

        {/* Day length */}
        <div className="text-center text-xs text-muted-foreground pt-1 border-t">
          Day length: <span className="font-medium text-foreground">{formatDuration(dayLen)}</span>
        </div>
      </CardContent>
    </Card>
  );
});

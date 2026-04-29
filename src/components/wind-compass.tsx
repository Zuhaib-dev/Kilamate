import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { motion, useSpring, useTransform } from "framer-motion";
import type { WeatherData } from "@/api/types";
import { usePreferences } from "@/hooks/use-preferences";
import { convertWindSpeed } from "@/lib/units";
import { memo, useEffect, useMemo, useRef } from "react";
import { Wind } from "lucide-react";

interface WindCompassProps {
  data: WeatherData;
}

const DIRECTIONS = [
  { label: "N", deg: 0 },
  { label: "NE", deg: 45 },
  { label: "E", deg: 90 },
  { label: "SE", deg: 135 },
  { label: "S", deg: 180 },
  { label: "SW", deg: 225 },
  { label: "W", deg: 270 },
  { label: "NW", deg: 315 },
];

const BEAUFORT: Array<{ max: number; label: string; color: string; desc: string }> = [
  { max: 0.5, label: "0", color: "#94a3b8", desc: "Calm" },
  { max: 1.5, label: "1", color: "#7dd3fc", desc: "Light Air" },
  { max: 3.3, label: "2", color: "#38bdf8", desc: "Light Breeze" },
  { max: 5.5, label: "3", color: "#0ea5e9", desc: "Gentle Breeze" },
  { max: 7.9, label: "4", color: "#0284c7", desc: "Moderate Breeze" },
  { max: 10.7, label: "5", color: "#2563eb", desc: "Fresh Breeze" },
  { max: 13.8, label: "6", color: "#4f46e5", desc: "Strong Breeze" },
  { max: 17.1, label: "7", color: "#7c3aed", desc: "Near Gale" },
  { max: 20.7, label: "8", color: "#9d174d", desc: "Gale" },
  { max: 24.4, label: "9", color: "#b91c1c", desc: "Strong Gale" },
  { max: 28.4, label: "10", color: "#dc2626", desc: "Storm" },
  { max: 32.6, label: "11", color: "#ef4444", desc: "Violent Storm" },
  { max: Infinity, label: "12", color: "#f97316", desc: "Hurricane" },
];

function getBeaufort(ms: number) {
  return BEAUFORT.find(b => ms <= b.max) ?? BEAUFORT[BEAUFORT.length - 1];
}

function degToCompass(deg: number): string {
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return dirs[Math.round(deg / 22.5) % 16];
}

// SVG compass drawing constants
const CX = 110;
const CY = 110;
const R = 88; // outer ring
const TICK_OUTER = R;
const TICK_INNER_MAJOR = R - 12;
const TICK_INNER_MINOR = R - 6;
const LABEL_R = R + 18;

function polarToXY(deg: number, r: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

export const WindCompass = memo(function WindCompass({ data }: WindCompassProps) {
  const { windSpeedUnit } = usePreferences();
  const { wind } = data;

  const speedMs = wind.speed;
  const gustMs = wind.gust;
  const windDeg = wind.deg ?? 0;

  const beaufort = useMemo(() => getBeaufort(speedMs), [speedMs]);
  const gustBeaufort = useMemo(() => gustMs ? getBeaufort(gustMs) : null, [gustMs]);

  const displaySpeed = Math.round(convertWindSpeed(speedMs, windSpeedUnit));
  const displayGust = gustMs ? Math.round(convertWindSpeed(gustMs, windSpeedUnit)) : null;
  const unitLabel = { kmh: "km/h", mph: "mph", ms: "m/s" }[windSpeedUnit];

  // Framer spring for smooth needle rotation
  const rawAngle = useRef(windDeg);
  const springAngle = useSpring(windDeg, { stiffness: 60, damping: 20 });

  useEffect(() => {
    // Compute shortest rotation path
    const prev = rawAngle.current;
    let delta = ((windDeg - prev) % 360 + 360) % 360;
    if (delta > 180) delta -= 360;
    rawAngle.current = prev + delta;
    springAngle.set(prev + delta);
  }, [windDeg, springAngle]);

  const needleRotate = useTransform(springAngle, (v) => `rotate(${v}deg)`);

  // Tick marks (every 10°, major every 45°)
  const ticks = useMemo(() => {
    return Array.from({ length: 36 }).map((_, i) => {
      const deg = i * 10;
      const isMajor = deg % 45 === 0;
      const outer = polarToXY(deg, TICK_OUTER);
      const inner = polarToXY(deg, isMajor ? TICK_INNER_MAJOR : TICK_INNER_MINOR);
      return { deg, isMajor, outer, inner };
    });
  }, []);

  return (
    <motion.div
      whileHover={{ scale: 1.005, y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
    >
      <Card className="overflow-hidden border-border/50 bg-gradient-to-br from-card via-card to-card/60 h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2.5 text-base font-bold tracking-tight">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="p-1.5 rounded-xl"
                style={{ backgroundColor: `${beaufort.color}22` }}
              >
                <Wind className="h-4 w-4" style={{ color: beaufort.color }} />
              </motion.div>
              Wind Compass
            </CardTitle>
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Beaufort {beaufort.label}</p>
              <p className="text-sm font-black" style={{ color: beaufort.color }}>{beaufort.desc}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-2">
          {/* ─── COMPASS SVG ─── */}
          <div className="relative w-full" style={{ paddingBottom: "100%" }}>
            <svg
              viewBox="0 0 220 220"
              className="absolute inset-0 w-full h-full"
              aria-label={`Wind blowing from ${degToCompass(windDeg)} at ${displaySpeed} ${unitLabel}`}
            >
              <defs>
                {/* Outer ring gradient */}
                <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={beaufort.color} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={beaufort.color} stopOpacity={0.1} />
                </linearGradient>

                {/* Needle gradient */}
                <linearGradient id="needleGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="50%" stopColor="#ef4444" />
                  <stop offset="50%" stopColor="hsl(var(--muted-foreground))" />
                  <stop offset="100%" stopColor="hsl(var(--muted-foreground))" />
                </linearGradient>

                {/* Center glow */}
                <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={beaufort.color} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={beaufort.color} stopOpacity={0} />
                </radialGradient>

                {/* Inner circle gradient */}
                <radialGradient id="innerFill" cx="40%" cy="35%" r="60%">
                  <stop offset="0%" stopColor="hsl(var(--card))" stopOpacity={1} />
                  <stop offset="100%" stopColor="hsl(var(--muted))" stopOpacity={0.8} />
                </radialGradient>

                <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* ─── Outer Decorative Ring ─── */}
              <circle cx={CX} cy={CY} r={R + 4} fill="none" stroke="url(#ringGrad)" strokeWidth="2" strokeDasharray="4 3" />

              {/* ─── Background fill ─── */}
              <circle cx={CX} cy={CY} r={R} fill="url(#innerFill)" />

              {/* ─── Subtle pulsing ring for wind strength ─── */}
              <motion.circle
                cx={CX} cy={CY} r={R - 4}
                fill="none"
                stroke={beaufort.color}
                strokeWidth="1"
                strokeOpacity={0.15}
                animate={{ r: [R - 4, R + 8, R - 4], opacity: [0.15, 0, 0.15] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* ─── Tick Marks ─── */}
              {ticks.map(({ deg, isMajor, outer, inner }) => (
                <line
                  key={deg}
                  x1={inner.x} y1={inner.y}
                  x2={outer.x} y2={outer.y}
                  stroke={isMajor ? "currentColor" : "currentColor"}
                  strokeOpacity={isMajor ? 0.4 : 0.12}
                  strokeWidth={isMajor ? 1.5 : 0.8}
                  strokeLinecap="round"
                />
              ))}

              {/* ─── Cardinal Direction Labels ─── */}
              {DIRECTIONS.map(({ label, deg }) => {
                const pos = polarToXY(deg, LABEL_R);
                const isCardinal = ["N", "S", "E", "W"].includes(label);
                return (
                  <text
                    key={label}
                    x={pos.x}
                    y={pos.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={isCardinal ? "10" : "7"}
                    fontWeight={isCardinal ? "800" : "600"}
                    fill={label === "N" ? "#ef4444" : "currentColor"}
                    fillOpacity={isCardinal ? 0.85 : 0.45}
                    letterSpacing="0.03em"
                  >
                    {label}
                  </text>
                );
              })}

              {/* ─── Inner decorative rings ─── */}
              <circle cx={CX} cy={CY} r={R * 0.55} fill="none" stroke="currentColor" strokeOpacity={0.05} strokeWidth="1" />
              <circle cx={CX} cy={CY} r={R * 0.3} fill="none" stroke="currentColor" strokeOpacity={0.07} strokeWidth="1" />

              {/* ─── Crosshair lines ─── */}
              <line x1={CX} y1={CY - R * 0.7} x2={CX} y2={CY + R * 0.7} stroke="currentColor" strokeOpacity={0.05} strokeWidth="0.5" />
              <line x1={CX - R * 0.7} y1={CY} x2={CX + R * 0.7} y2={CY} stroke="currentColor" strokeOpacity={0.05} strokeWidth="0.5" />

              {/* ─── Animated Needle group ─── */}
              <motion.g
                style={{
                  originX: `${CX}px`,
                  originY: `${CY}px`,
                  rotate: needleRotate,
                }}
              >
                {/* Needle shadow/glow */}
                <motion.line
                  x1={CX} y1={CY - R * 0.72}
                  x2={CX} y2={CY + R * 0.52}
                  stroke={beaufort.color}
                  strokeWidth="4"
                  strokeOpacity={0.15}
                  strokeLinecap="round"
                  filter="url(#glow)"
                />

                {/* North arrow (red — points to where wind is blowing TOWARD) */}
                <polygon
                  points={`
                    ${CX},${CY - R * 0.72}
                    ${CX - 7},${CY - 5}
                    ${CX + 7},${CY - 5}
                  `}
                  fill="#ef4444"
                  filter="url(#glow)"
                />

                {/* South arrow (muted) */}
                <polygon
                  points={`
                    ${CX},${CY + R * 0.52}
                    ${CX - 7},${CY + 5}
                    ${CX + 7},${CY + 5}
                  `}
                  fill="hsl(var(--muted-foreground))"
                  fillOpacity={0.5}
                />
              </motion.g>

              {/* ─── Center cap ─── */}
              <circle cx={CX} cy={CY} r="12" fill="url(#centerGlow)" />
              <circle cx={CX} cy={CY} r="6" fill="hsl(var(--background))" stroke={beaufort.color} strokeWidth="1.5" />

              {/* ─── Center text (direction label) ─── */}
              {/* nothing here — shown below in DOM */}
            </svg>
          </div>

          {/* ─── Speed + Direction stats ─── */}
          <motion.div
            className="grid grid-cols-3 gap-2 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 260, damping: 26 }}
          >
            {/* Wind Speed */}
            <div className="rounded-xl border border-border/50 bg-muted/30 p-3 space-y-0.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Speed</p>
              <p className="text-xl font-black tabular-nums" style={{ color: beaufort.color }}>
                {displaySpeed}
              </p>
              <p className="text-[10px] text-muted-foreground font-medium">{unitLabel}</p>
            </div>

            {/* Direction */}
            <div className="rounded-xl border border-border/50 bg-muted/30 p-3 space-y-0.5 flex flex-col items-center justify-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">From</p>
              <motion.p
                key={degToCompass(windDeg)}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-xl font-black text-foreground"
              >
                {degToCompass(windDeg)}
              </motion.p>
              <p className="text-[10px] text-muted-foreground font-medium tabular-nums">{windDeg}°</p>
            </div>

            {/* Gust or Beaufort */}
            <div className="rounded-xl border border-border/50 bg-muted/30 p-3 space-y-0.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {displayGust ? "Gusts" : "Scale"}
              </p>
              <p
                className="text-xl font-black tabular-nums"
                style={{ color: displayGust && gustBeaufort ? gustBeaufort.color : beaufort.color }}
              >
                {displayGust ?? `B${beaufort.label}`}
              </p>
              <p className="text-[10px] text-muted-foreground font-medium">
                {displayGust ? unitLabel : "Beaufort"}
              </p>
            </div>
          </motion.div>

          {/* ─── Beaufort scale strip ─── */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Beaufort Wind Scale</p>
            <div className="flex gap-0.5 h-3 rounded-full overflow-hidden">
              {BEAUFORT.filter(b => b.max !== Infinity).map((b) => {
                const isActive = getBeaufort(speedMs).label === b.label;
                return (
                  <motion.div
                    key={b.label}
                    className="flex-1 rounded-sm"
                    style={{ backgroundColor: b.color, opacity: isActive ? 1 : 0.25 }}
                    animate={{ opacity: isActive ? [1, 0.7, 1] : 0.25 }}
                    transition={{ duration: 1.5, repeat: isActive ? Infinity : 0, ease: "easeInOut" }}
                    title={`Force ${b.label}: ${b.desc}`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-[9px] text-muted-foreground/60 font-bold px-0.5">
              <span>Calm</span>
              <span>Breeze</span>
              <span>Gale</span>
              <span>Storm</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

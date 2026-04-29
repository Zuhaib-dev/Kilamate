import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ThermometerSun,
  Wind,
  History,
  Zap,
} from "lucide-react";
import type { WeatherData } from "@/api/types";
import { useHistoricalWeather } from "@/hooks/use-historical-weather";
import { usePreferences } from "@/hooks/use-preferences";
import { convertTemperature } from "@/lib/units";
import { memo } from "react";
import type { Coordinates } from "@/api/types";

interface WeatherHistoryProps {
  data: WeatherData;
  coordinates: Coordinates;
}

function DeltaBadge({ delta, unit }: { delta: number; unit: string }) {
  const abs = Math.abs(delta);
  const isUp = delta > 0;
  const isNeutral = abs < 0.5;

  if (isNeutral) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-muted/60 text-muted-foreground border border-border/40">
        <Minus className="h-3 w-3" />
        Normal
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${
        isUp
          ? "bg-red-500/10 text-red-500 border-red-500/20"
          : "bg-blue-500/10 text-blue-400 border-blue-500/20"
      }`}
    >
      {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {isUp ? "+" : "−"}{abs.toFixed(1)}{unit}
    </span>
  );
}

function StatCard({
  icon,
  label,
  now,
  historical,
  unit,
  delta,
  color,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  now: string;
  historical: string;
  unit: string;
  delta: number;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 300, damping: 26 }}
      className="relative rounded-2xl border border-border/50 bg-muted/30 p-4 overflow-hidden space-y-3"
    >
      {/* Subtle accent line */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-0.5 rounded-full"
        style={{ backgroundColor: color }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: delay + 0.2, duration: 0.6, ease: "easeOut" }}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${color}22` }}>
            <div style={{ color }}>{icon}</div>
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
        </div>
        <DeltaBadge delta={delta} unit={unit} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">Now</p>
          <p className="text-xl font-black tabular-nums text-foreground">{now}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">5yr Avg</p>
          <p className="text-xl font-bold tabular-nums text-muted-foreground">{historical}</p>
        </div>
      </div>
    </motion.div>
  );
}

export const WeatherVsHistory = memo(function WeatherVsHistory({
  data,
  coordinates,
}: WeatherHistoryProps) {
  const { temperatureUnit } = usePreferences();
  const histQuery = useHistoricalWeather(coordinates);

  const unitSymbol = temperatureUnit === "celsius" ? "°C" : "°F";

  const nowTemp = Math.round(convertTemperature(data.main.temp, temperatureUnit));
  const nowTempMax = Math.round(convertTemperature(data.main.temp_max, temperatureUnit));
  const nowTempMin = Math.round(convertTemperature(data.main.temp_min, temperatureUnit));
  const nowWindKmh = Math.round(data.wind.speed * 3.6);

  const hist = histQuery.data;

  const histTempMid = hist
    ? Math.round(convertTemperature(hist.avgTempMid, temperatureUnit))
    : null;
  const histTempMax = hist
    ? Math.round(convertTemperature(hist.avgTempMax, temperatureUnit))
    : null;
  const histTempMin = hist
    ? Math.round(convertTemperature(hist.avgTempMin, temperatureUnit))
    : null;
  const histWindKmh = hist ? hist.avgWindspeed : null;

  const tempDelta = hist ? nowTemp - histTempMid! : 0;
  const windDelta = hist ? nowWindKmh - (histWindKmh ?? 0) : 0;

  // Chart data: last 5 years + today
  const chartData = hist
    ? [
        ...hist.yearlyData
          .slice()
          .reverse()
          .map((d) => ({
            year: d.date.slice(0, 4),
            max: Math.round(convertTemperature(d.tempMax, temperatureUnit)),
            min: Math.round(convertTemperature(d.tempMin, temperatureUnit)),
            mid: Math.round(convertTemperature((d.tempMax + d.tempMin) / 2, temperatureUnit)),
            rain: d.precipitation,
            isHistory: true,
          })),
        {
          year: "Today",
          max: nowTempMax,
          min: nowTempMin,
          mid: nowTemp,
          rain: 0, // current hour rain not available from current weather
          isHistory: false,
        },
      ]
    : [];

  // Anomaly label
  const getAnomalyLabel = (delta: number) => {
    if (Math.abs(delta) < 0.5) return { text: "Right on average — typical for today!", color: "text-muted-foreground", emoji: "✅" };
    if (delta > 4) return { text: `Significantly warmer than usual — ${delta.toFixed(1)}° above normal`, color: "text-red-500", emoji: "🔥" };
    if (delta > 1.5) return { text: `Warmer than usual for this day`, color: "text-orange-500", emoji: "☀️" };
    if (delta < -4) return { text: `Significantly colder than usual — ${Math.abs(delta).toFixed(1)}° below normal`, color: "text-blue-500", emoji: "🥶" };
    if (delta < -1.5) return { text: `Cooler than usual for this day`, color: "text-sky-400", emoji: "❄️" };
    return { text: "Slightly off average — nearly normal", color: "text-muted-foreground", emoji: "🌤️" };
  };

  const anomaly = hist ? getAnomalyLabel(tempDelta) : null;

  return (
    <motion.div
      whileHover={{ scale: 1.003, y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
    >
      <Card className="overflow-hidden border-border/50 bg-gradient-to-br from-card via-card to-card/60">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2.5 text-base font-bold tracking-tight">
              <motion.div
                animate={{ rotateY: [0, 180, 360] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", repeatDelay: 4 }}
                className="p-1.5 rounded-xl bg-violet-500/15"
              >
                <History className="h-4 w-4 text-violet-500" />
              </motion.div>
              Now vs History
            </CardTitle>
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {format(new Date(), "MMMM d")}
              </p>
              <p className="text-xs text-muted-foreground">5-year comparison</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* ─── Anomaly Banner ─── */}
          {hist && anomaly && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="flex items-center gap-3 rounded-xl border border-border/40 bg-muted/30 px-4 py-3"
            >
              <span className="text-2xl">{anomaly.emoji}</span>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Today's Climate Anomaly</p>
                <p className={`text-sm font-bold mt-0.5 ${anomaly.color}`}>{anomaly.text}</p>
              </div>
              {Math.abs(tempDelta) >= 1 && (
                <div className="ml-auto shrink-0">
                  <DeltaBadge delta={tempDelta} unit={unitSymbol} />
                </div>
              )}
            </motion.div>
          )}

          {/* ─── Stat Cards ─── */}
          {histQuery.isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[0, 1].map(i => (
                <div key={i} className="h-28 rounded-2xl bg-muted/40 animate-pulse" />
              ))}
            </div>
          )}

          {hist && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <StatCard
                icon={<ThermometerSun className="h-3.5 w-3.5" />}
                label="Temperature"
                now={`${nowTemp}${unitSymbol}`}
                historical={`${histTempMid}${unitSymbol}`}
                unit={unitSymbol}
                delta={tempDelta}
                color="#f97316"
                delay={0.2}
              />
              <StatCard
                icon={<Wind className="h-3.5 w-3.5" />}
                label="Wind Speed"
                now={`${nowWindKmh} km/h`}
                historical={`${histWindKmh} km/h`}
                unit=" km/h"
                delta={windDelta}
                color="#38bdf8"
                delay={0.3}
              />
            </div>
          )}

          {/* ─── Temperature Chart ─── */}
          {chartData.length > 0 && (
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 260, damping: 26 }}
            >
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <Zap className="h-3 w-3 text-amber-500" />
                  Temperature Range — This Day, Past 5 Years
                </p>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-2 h-2 rounded-sm bg-amber-400/50" /> Range
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-3 h-0.5 bg-orange-400 rounded-full" /> Avg
                  </span>
                </div>
              </div>

              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="barGradHist" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.1} />
                      </linearGradient>
                      <linearGradient id="barGradToday" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#a855f7" stopOpacity={0.7} />
                        <stop offset="100%" stopColor="#a855f7" stopOpacity={0.2} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.4} />
                    <XAxis
                      dataKey="year"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      stroke="hsl(var(--muted-foreground))"
                      tickFormatter={(v) => `${v}°`}
                      domain={["dataMin - 3", "dataMax + 3"]}
                    />

                    {/* Historical average reference line */}
                    {histTempMid !== null && (
                      <ReferenceLine
                        y={histTempMid}
                        stroke="#94a3b8"
                        strokeDasharray="5 4"
                        strokeWidth={1.5}
                        label={{
                          value: `Avg ${histTempMid}°`,
                          position: "insideTopRight",
                          fontSize: 9,
                          fill: "#94a3b8",
                          fontWeight: 700,
                        }}
                      />
                    )}

                    <Tooltip
                      cursor={{ fill: "hsl(var(--muted))", fillOpacity: 0.4 }}
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        const max = payload.find(p => p.name === "max");
                        const min = payload.find(p => p.name === "min");
                        const mid = payload.find(p => p.name === "mid");
                        return (
                          <div className="rounded-xl border border-border/50 bg-background/90 backdrop-blur-md p-3 shadow-xl text-xs space-y-1.5">
                            <p className="font-black uppercase tracking-wider text-muted-foreground">{label}</p>
                            {mid && <p className="font-bold text-foreground">Avg: <span className="text-orange-400">{mid.value}{unitSymbol}</span></p>}
                            {max && min && (
                              <p className="text-muted-foreground">Range: {min.value}{unitSymbol} — {max.value}{unitSymbol}</p>
                            )}
                          </div>
                        );
                      }}
                    />

                    {/* Min as base, max as stack — creates range bar effect */}
                    <Bar dataKey="min" stackId="range" fill="transparent" />
                    <Bar
                      dataKey={(d) => d.max - d.min}
                      stackId="range"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={48}
                      fill="url(#barGradHist)"
                    />

                    {/* Mid (average) line */}
                    <Line
                      type="monotone"
                      dataKey="mid"
                      stroke="#f97316"
                      strokeWidth={2.5}
                      dot={(props) => {
                        const { cx, cy, payload } = props;
                        if (payload.year === "Today") {
                          return (
                            <circle
                              key={`dot-today`}
                              cx={cx}
                              cy={cy}
                              r={6}
                              fill="#a855f7"
                              stroke="hsl(var(--background))"
                              strokeWidth={2}
                            />
                          );
                        }
                        return <circle key={`dot-${payload.year}`} cx={cx} cy={cy} r={3} fill="#f97316" stroke="hsl(var(--background))" strokeWidth={1.5} />;
                      }}
                      activeDot={{ r: 6, fill: "#f97316", stroke: "hsl(var(--background))", strokeWidth: 2 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* Legend for today vs history */}
              <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-semibold px-1">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-3 h-3 rounded-full bg-amber-400/50 border border-amber-400" />
                  Historical years
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-3 h-3 rounded-full bg-violet-400 border border-violet-400" />
                  Today
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-3 h-0.5 bg-slate-400 rounded-full border-dashed" style={{ borderTop: "2px dashed #94a3b8" }} />
                  5yr average
                </span>
              </div>
            </motion.div>
          )}

          {/* ─── Historical range strip ─── */}
          {hist && histTempMax !== null && histTempMin !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="rounded-xl border border-border/40 bg-muted/20 p-3 space-y-2"
            >
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Typical Range for {format(new Date(), "MMMM d")}
              </p>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold tabular-nums text-blue-400">{histTempMin}{unitSymbol}</span>
                <div className="flex-1 relative h-3 rounded-full bg-gradient-to-r from-blue-500/30 via-amber-400/30 to-red-500/30 border border-border/30">
                  {/* Today marker */}
                  {histTempMax !== histTempMin && (
                    <motion.div
                      className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-violet-500 border-2 border-background shadow-lg"
                      style={{
                        left: `${Math.min(100, Math.max(0, ((nowTemp - histTempMin!) / (histTempMax! - histTempMin!)) * 100))}%`,
                        translateX: "-50%",
                      }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 18, delay: 0.7 }}
                    />
                  )}
                </div>
                <span className="text-sm font-bold tabular-nums text-red-400">{histTempMax}{unitSymbol}</span>
              </div>
              <p className="text-[10px] text-muted-foreground text-center">
                Today's <span className="font-black text-violet-400">{nowTemp}{unitSymbol}</span> sits at{" "}
                {histTempMax !== histTempMin
                  ? `${Math.round(((nowTemp - histTempMin!) / (histTempMax! - histTempMin!)) * 100)}th percentile`
                  : "the average"}
              </p>
            </motion.div>
          )}

          {/* ─── Error State ─── */}
          {histQuery.isError && (
            <div className="text-center py-6 text-muted-foreground text-sm">
              <History className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p>Historical data unavailable for this location.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
});

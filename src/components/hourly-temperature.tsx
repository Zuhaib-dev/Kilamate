import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from "recharts";
import { format } from "date-fns";
import { enUS, hi } from "date-fns/locale";
import type { ForecastData } from "@/api/types";
import { usePreferences } from "@/hooks/use-preferences";
import { convertTemperature } from "@/lib/units";
import { useTranslation } from "react-i18next";
import { memo } from "react";
import { motion } from "framer-motion";

interface HourlyTemperatureProps {
  data: ForecastData;
}

interface ChartData {
  time: string;
  temp: number;
  feels_like: number;
  pop: number;
}

export const HourlyTemperature = memo(function HourlyTemperature({
  data,
}: HourlyTemperatureProps) {
  const { temperatureUnit, language } = usePreferences();
  const { t } = useTranslation();

  // Determine the correct locale for date-fns
  const getDateLocale = () => {
    switch (language) {
      case "hi": return hi;
      case "ur": return enUS; // ur locale isn't available in date-fns v4 by default, use enUS as fallback
      default: return enUS;
    }
  };
  const currentLocale = getDateLocale();

  // Helper function to format Urdu hours manually if language is Urdu
  const formatUrduTime = (date: Date) => {
    const formatted = format(date, "ha", { locale: enUS });
    let urduFormatted = formatted.replace("AM", " صبح").replace("PM", " شام");
    return urduFormatted;
  };

  // Get today's forecast data and format for chart
  const chartData: ChartData[] = data.list
    .slice(0, 8) // Get next 24 hours (3-hour intervals)
    .map((item) => ({
      time: language === "ur"
        ? formatUrduTime(new Date(item.dt * 1000))
        : format(new Date(item.dt * 1000), "ha", { locale: currentLocale }),
      temp: Math.round(convertTemperature(item.main.temp, temperatureUnit)),
      feels_like: Math.round(convertTemperature(item.main.feels_like, temperatureUnit)),
      pop: Math.round((item.pop ?? 0) * 100),
    }));

  const unitSymbol = temperatureUnit === "celsius" ? "°C" : "°F";
  const minTemp = Math.min(...chartData.map(d => d.temp));
  const maxTemp = Math.max(...chartData.map(d => d.temp));

  return (
    <motion.div
      whileHover={{ scale: 1.005, y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
    >
      <Card className="flex-1 overflow-hidden border-border/50 bg-gradient-to-b from-card to-card/50 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold tracking-tight">{t("weather.hourly")}</CardTitle>
            <div className="flex items-center gap-4 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                {t("weather.temperature")}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-full bg-sky-400/40 border border-sky-400/60" />
                {t("weather.rainChance")}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          <motion.div
            className="flex flex-col gap-0 pt-2"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ type: "spring", stiffness: 260, damping: 28, delay: 0.1 }}
          >
            <div className="h-[240px] w-full px-2 sm:px-0 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 15, right: 15, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.4} />
                  
                  <XAxis 
                    dataKey="time" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false} 
                    dy={10}
                  />
                  
                  <YAxis
                    yAxisId="temp"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}°`}
                    domain={[minTemp - 3, maxTemp + 3]}
                    dx="-10"
                  />
                  
                  <YAxis 
                    yAxisId="pop" 
                    orientation="right" 
                    hide 
                    domain={[0, 100]} 
                  />

                  <Tooltip
                    cursor={{ stroke: "hsl(var(--primary))", strokeWidth: 1, strokeDasharray: "4 4", opacity: 0.5 }}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const tempPayload = payload.find(p => p.dataKey === "temp");
                        const popPayload = payload.find(p => p.dataKey === "pop");
                        const feelsLikePayload = payload.find(p => p.dataKey === "feels_like");

                        return (
                          <div className="rounded-xl border border-border/50 bg-background/80 backdrop-blur-md p-3 shadow-xl ring-1 ring-black/5">
                            <p className="text-xs text-muted-foreground mb-2 font-bold uppercase tracking-wider">{label}</p>
                            <div className="flex flex-col gap-2">
                              {tempPayload && (
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-1.5">
                                    <span className="inline-block w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                                    <span className="text-xs text-muted-foreground font-medium">{t("weather.temperature")}</span>
                                  </div>
                                  <span className="text-sm font-black text-foreground ml-auto">{tempPayload.value}{unitSymbol}</span>
                                </div>
                              )}
                              
                              {feelsLikePayload && (
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-1.5">
                                    <span className="inline-block w-2 h-2 bg-slate-400 rounded-full" />
                                    <span className="text-xs text-muted-foreground font-medium">{t("weather.feelsLike")}</span>
                                  </div>
                                  <span className="text-sm font-bold text-muted-foreground ml-auto">{feelsLikePayload.value}{unitSymbol}</span>
                                </div>
                              )}

                              {popPayload && typeof popPayload.value === 'number' && popPayload.value > 0 && (
                                <div className="flex items-center gap-3 mt-1 pt-2 border-t border-border/50">
                                  <div className="flex items-center gap-1.5">
                                    <span className="inline-block w-2 h-2 bg-sky-500 rounded-sm" />
                                    <span className="text-xs text-sky-500 font-medium">{t("weather.rainChance")}</span>
                                  </div>
                                  <span className="text-sm font-black text-sky-500 ml-auto">{popPayload.value}%</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  
                  {/* Precipitation Bars underneath */}
                  <Bar
                    yAxisId="pop"
                    dataKey="pop"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill="url(#rainGradient)"
                        fillOpacity={entry.pop > 10 ? 0.8 : 0.2}
                      />
                    ))}
                  </Bar>

                  {/* Feels Like Line (Background) */}
                  <Area
                    yAxisId="temp"
                    type="monotone"
                    dataKey="feels_like"
                    stroke="#94a3b8"
                    strokeWidth={2}
                    fill="transparent"
                    strokeDasharray="4 4"
                    dot={false}
                    activeDot={false}
                  />

                  {/* Temperature Area (Foreground) */}
                  <Area
                    yAxisId="temp"
                    type="monotone"
                    dataKey="temp"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fill="url(#tempGradient)"
                    dot={{ r: 3, fill: "hsl(var(--background))", stroke: "#3b82f6", strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: "#3b82f6", stroke: "hsl(var(--background))", strokeWidth: 2, className: "drop-shadow-md" }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

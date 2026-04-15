import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThermometerSun } from "lucide-react";
import { useAirPollutionQuery } from "@/hooks/use-weather";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";
import {
  calculateAQI,
  getAQIDescription,
  getPollutantPercentage,
} from "@/lib/aqi-utils";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { staggerContainer, slideUp } from "@/lib/animations";

interface AirPollutionProps {
  data: ReturnType<typeof useAirPollutionQuery>["data"];
}

// Returns a tailwind bg color class based on what % of the safe limit is reached
function getPollutantBarColor(percentage: number): string {
  if (percentage <= 25) return "bg-green-500";
  if (percentage <= 50) return "bg-yellow-500";
  if (percentage <= 75) return "bg-orange-500";
  return "bg-red-500";
}

function getPollutantLevelLabel(percentage: number): { label: string; textColor: string } {
  if (percentage <= 25) return { label: "Good", textColor: "text-green-500" };
  if (percentage <= 50) return { label: "Moderate", textColor: "text-yellow-500" };
  if (percentage <= 75) return { label: "Poor", textColor: "text-orange-500" };
  return { label: "Hazardous", textColor: "text-red-500" };
}

export function AirPollution({ data }: AirPollutionProps) {
  const { t } = useTranslation();

  if (!data || !data.list || data.list.length === 0) return null;

  const current = data.list[0];
  const aqiValue = calculateAQI(current.components);
  const level = getAQIDescription(aqiValue);

  const chartData = data.list.slice(0, 24).map((item) => ({
    time: new Date(item.dt * 1000).toLocaleTimeString("en-US", {
      hour: "numeric",
    }),
    aqi: calculateAQI(item.components),
  }));

  // Helper to render a per-pollutant card with threshold-based color coding
  const renderPollutant = (
    label: string,
    value: number,
    unit: string,
    maxLimit: number = 300,
  ) => {
    const percentage = getPollutantPercentage(value, maxLimit);
    const barColor = getPollutantBarColor(percentage);
    const { label: levelLabel, textColor } = getPollutantLevelLabel(percentage);

    return (
      <motion.div
        key={label}
        className="flex flex-col gap-1.5 p-3 bg-muted/30 rounded-lg border border-muted/50"
        variants={slideUp}
        whileHover={{ scale: 1.02, y: -2, boxShadow: "0px 6px 20px rgba(0,0,0,0.1)" }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
      >
        <div className="flex justify-between items-center w-full">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {label}
          </span>
          <span className={`text-[10px] font-bold uppercase ${textColor}`}>{levelLabel}</span>
        </div>
        <div className="flex items-baseline gap-1">
          <motion.span
            className="text-xl font-bold font-mono tracking-tight"
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {value.toFixed(1)}
          </motion.span>
          <span className="text-xs text-muted-foreground">{unit}</span>
        </div>
        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${barColor}`}
            initial={{ width: 0 }}
            whileInView={{ width: `${Math.max(2, percentage)}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </motion.div>
    );
  };

  return (
    <Card className="col-span-full md:col-span-2 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <ThermometerSun className="h-5 w-5 text-primary" />
          </motion.div>
          {t("weather.aqi")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main AQI Display */}
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* AQI Circle + Label */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <motion.div
              className={`flex items-center justify-center w-20 h-20 rounded-full border-4 border-current ${level.color} bg-background shadow-lg flex-shrink-0`}
              initial={{ scale: 0, rotate: -180 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
            >
              <div className="flex flex-col items-center leading-tight">
                <motion.span
                  className="text-2xl font-black"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                >
                  {aqiValue}
                </motion.span>
                <span className="text-[9px] uppercase font-bold tracking-widest opacity-70">AQI</span>
              </div>
            </motion.div>
            <div className="flex flex-col gap-0.5">
              <span className={`text-xl font-bold ${level.color}`}>
                {t(level.labelKey)}
              </span>
              <span className="text-xs text-muted-foreground">
                {t("aqi.standardAqi")}
              </span>
              <p className="text-xs text-muted-foreground mt-1 max-w-[220px] leading-relaxed">
                {t(level.descKey)}
              </p>
            </div>
          </div>

          {/* Color-coded Pollutants Grid */}
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 w-full"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
          >
            {renderPollutant("PM2.5", current.components.pm2_5, "μg/m³", 50)}
            {renderPollutant("PM10", current.components.pm10, "μg/m³", 100)}
            {renderPollutant("SO2", current.components.so2, "μg/m³", 185)}
            {renderPollutant("NO2", current.components.no2, "μg/m³", 100)}
            {renderPollutant("O3", current.components.o3, "μg/m³", 100)}
            {renderPollutant("CO", current.components.co / 1000, "mg/m³", 15)}
          </motion.div>
        </div>

        {/* 24h AQI Forecast Chart */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-sm font-semibold text-muted-foreground">
              {t("aqi.forecast24h")}
            </span>
            <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-0.5 bg-green-500 rounded-full" />
                Good ≤50
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-0.5 bg-yellow-500 rounded-full" />
                Mod ≤100
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-0.5 bg-red-500 rounded-full" />
                Poor &gt;100
              </span>
            </div>
          </div>
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="currentColor" className={level.color.replace("text-", "text-")} stopOpacity={0.3} />
                    <stop offset="95%" stopColor="currentColor" className={level.color.replace("text-", "text-")} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="time"
                  stroke="#888888"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  interval={3}
                />
                <YAxis
                  hide
                  domain={[0, (dataMax: number) => Math.max(dataMax * 1.2, 100)]}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const val = Number(payload[0].value);
                      const lvl = getAQIDescription(val);
                      return (
                        <div className="rounded-lg border bg-background p-2.5 shadow-md text-sm">
                          <p className="text-muted-foreground text-xs mb-1">{label}</p>
                          <p className="font-bold">AQI: <span className={lvl.color}>{val}</span></p>
                          <p className={`text-xs font-medium ${lvl.color}`}>{t(lvl.labelKey)}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine y={50}  stroke="#22c55e" strokeDasharray="3 3" strokeOpacity={0.6}
                  label={{ value: "Good",     position: "insideTopRight", fontSize: 9, fill: "#22c55e", opacity: 0.8 }} />
                <ReferenceLine y={100} stroke="#eab308" strokeDasharray="3 3" strokeOpacity={0.6}
                  label={{ value: "Moderate", position: "insideTopRight", fontSize: 9, fill: "#eab308", opacity: 0.8 }} />
                <ReferenceLine y={150} stroke="#f97316" strokeDasharray="3 3" strokeOpacity={0.6}
                  label={{ value: "USG",      position: "insideTopRight", fontSize: 9, fill: "#f97316", opacity: 0.8 }} />
                <Area
                  type="monotone"
                  dataKey="aqi"
                  stroke="currentColor"
                  className={level.color}
                  fillOpacity={1}
                  fill="url(#aqiGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

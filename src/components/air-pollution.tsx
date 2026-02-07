import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThermometerSun } from "lucide-react";
import { useAirPollutionQuery } from "@/hooks/use-weather";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { calculateAQI, getAQIDescription, getPollutantPercentage } from "@/lib/aqi-utils";

interface AirPollutionProps {
  data: ReturnType<typeof useAirPollutionQuery>["data"];
}

export function AirPollution({ data }: AirPollutionProps) {
  if (!data || !data.list || data.list.length === 0) return null;

  const current = data.list[0];
  const aqiValue = calculateAQI(current.components);
  const level = getAQIDescription(aqiValue);

  const chartData = data.list.slice(0, 24).map((item) => ({
    time: new Date(item.dt * 1000).toLocaleTimeString("en-US", { hour: "numeric" }),
    aqi: calculateAQI(item.components),
  }));

  // Helper to render a simplified progress bar for pollutants
  const renderPollutant = (label: string, value: number, unit: string, maxLimit: number = 300) => {
    const percentage = getPollutantPercentage(value, maxLimit);
    // Determine color based on individual value? Maybe simpler to just stick to a neutral progress unless critical.
    // Or reuse the main AQI color logic if we had per-pollutant AQI. 
    // For simplicity, let's just show the value and a bar.
    return (
      <div className="flex flex-col gap-1 p-3 bg-muted/30 rounded-lg border border-muted/50 hover:bg-muted/50 transition-colors">
        <div className="flex justify-between items-center w-full">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
          <span className="text-xs text-muted-foreground">{unit}</span>
        </div>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-lg font-bold font-mono tracking-tight">{value.toFixed(1)}</span>
        </div>
        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden mt-2">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${level.bg}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <Card className="col-span-full md:col-span-2 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ThermometerSun className="h-5 w-5 text-primary" />
          Air Quality Index
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Main AQI Display */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left space-y-2 flex-shrink-0">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className={`flex items-center justify-center w-20 h-20 rounded-full border-4 border-current ${level.color} bg-background shadow-lg`}>
                <span className="text-4xl font-bold">{aqiValue}</span>
              </div>
              <div className="flex flex-col items-start gap-0.5">
                <span className={`text-2xl font-bold ${level.color}`}>{level.label}</span>
                <span className="text-xs text-muted-foreground font-medium">Standard AQI (US EPA)</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-3 max-w-[280px] leading-relaxed">
              {level.desc}
            </p>
          </div>

          {/* Pollutants Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full">
            {renderPollutant("PM2.5", current.components.pm2_5, "μg/m³", 50)}
            {renderPollutant("PM10", current.components.pm10, "μg/m³", 100)}
            {renderPollutant("SO2", current.components.so2, "μg/m³", 185)}
            {renderPollutant("NO2", current.components.no2, "μg/m³", 100)}
            {renderPollutant("O3", current.components.o3, "μg/m³", 100)}
            {renderPollutant("CO", current.components.co, "μg/m³", 15000)} {/* CO is high */}
          </div>
        </div>

        {/* Forecast Chart */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-sm font-medium text-muted-foreground">24-Hour Forecast</span>
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="currentColor" className={level.color.replace('text-', 'text-')} stopOpacity={0.3} />
                    <stop offset="95%" stopColor="currentColor" className={level.color.replace('text-', 'text-')} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="time"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  interval={3}
                />
                <YAxis
                  hide
                  domain={[0, (dataMax: number) => Math.max(dataMax, 100)]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "var(--radius)",
                    color: "hsl(var(--popover-foreground))",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                  }}
                  itemStyle={{ color: "hsl(var(--foreground))" }}
                  labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                />
                <Area
                  type="monotone"
                  dataKey="aqi"
                  stroke="currentColor"
                  className={level.color}
                  fillOpacity={1}
                  fill="url(#aqiGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThermometerSun } from "lucide-react";
import { useAirPollutionQuery } from "@/hooks/use-weather";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface AirPollutionProps {
  data: ReturnType<typeof useAirPollutionQuery>["data"];
}

export function AirPollution({ data }: AirPollutionProps) {
  if (!data || !data.list || data.list.length === 0) return null;

  const calculateAQI = (pm25: number) => {
    if (pm25 <= 12) return Math.round((50 / 12) * pm25);
    if (pm25 <= 35.4) return Math.round(((100 - 51) / (35.4 - 12)) * (pm25 - 12) + 51);
    if (pm25 <= 55.4) return Math.round(((150 - 101) / (55.4 - 35.4)) * (pm25 - 35.4) + 101);
    if (pm25 <= 150.4) return Math.round(((200 - 151) / (150.4 - 55.4)) * (pm25 - 55.4) + 151);
    if (pm25 <= 250.4) return Math.round(((300 - 201) / (250.4 - 150.4)) * (pm25 - 150.4) + 201);
    return 300;
  };

  const current = data.list[0];
  const aqiValue = calculateAQI(current.components.pm2_5);

  const getAQIDescription = (score: number) => {
    if (score <= 50) return { label: "Good", color: "text-green-500", desc: "Air quality is satisfactory." };
    if (score <= 100) return { label: "Moderate", color: "text-yellow-500", desc: "Air quality is acceptable." };
    if (score <= 150) return { label: "Unhealthy for Sensitive Groups", color: "text-orange-500", desc: "Members of sensitive groups may experience health effects." };
    if (score <= 200) return { label: "Unhealthy", color: "text-red-500", desc: "Everyone may begin to experience health effects." };
    if (score <= 300) return { label: "Very Unhealthy", color: "text-purple-500", desc: "Health warnings of emergency conditions." };
    return { label: "Hazardous", color: "text-red-900", desc: "Health alert: serious health effects." };
  };

  const level = getAQIDescription(aqiValue);

  const chartData = data.list.slice(0, 24).map((item) => ({
    time: new Date(item.dt * 1000).toLocaleTimeString("en-US", { hour: "numeric" }),
    aqi: calculateAQI(item.components.pm2_5),
  }));

  return (
    <Card className="col-span-full md:col-span-2"> 
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ThermometerSun className="h-5 w-5" />
          Air Quality Index
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left space-y-1">
                <div className="flex items-center justify-center md:justify-start gap-2">
                    <span className={`text-5xl font-bold ${level.color}`}>{aqiValue}</span>
                    <div className="flex flex-col items-start">
                        <span className={`text-lg font-medium ${level.color}`}>{level.label}</span>
                        <span className="text-xs text-muted-foreground">Standard US AQI</span>
                    </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2 max-w-xs">
                    {level.desc}
                </p>
            </div>
            <div className="grid grid-cols-4 gap-4 w-full md:w-auto">
                <div className="flex flex-col items-center p-2 bg-muted/50 rounded-lg">
                    <span className="text-xs text-muted-foreground">PM2.5</span>
                    <span className="font-mono text-sm font-bold">{current.components.pm2_5.toFixed(1)}</span>
                </div>
                <div className="flex flex-col items-center p-2 bg-muted/50 rounded-lg">
                    <span className="text-xs text-muted-foreground">PM10</span>
                    <span className="font-mono text-sm font-bold">{current.components.pm10.toFixed(1)}</span>
                </div>
                <div className="flex flex-col items-center p-2 bg-muted/50 rounded-lg">
                    <span className="text-xs text-muted-foreground">SO2</span>
                    <span className="font-mono text-sm font-bold">{current.components.so2.toFixed(1)}</span>
                </div>
                <div className="flex flex-col items-center p-2 bg-muted/50 rounded-lg">
                    <span className="text-xs text-muted-foreground">NO2</span>
                    <span className="font-mono text-sm font-bold">{current.components.no2.toFixed(1)}</span>
                </div>
            </div>
        </div>
        <div className="h-[200px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <XAxis 
                        dataKey="time" 
                        stroke="#888888" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false}
                    />
                    <YAxis 
                        hide 
                        domain={[0, 500]}
                    />
                    <Tooltip 
                        contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "none", color: "#fff" }}
                        itemStyle={{ color: "#fff" }}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="aqi" 
                        stroke="#f59e0b" 
                        fillOpacity={1} 
                        fill="url(#aqiGradient)" 
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
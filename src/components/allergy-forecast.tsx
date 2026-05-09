import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Wind, Trees, ShieldAlert, HeartPulse } from "lucide-react";
import type { WeatherData, AirPollutionResponse } from "@/api/types";
import { memo, useMemo } from "react";

interface AllergyForecastProps {
  weather: WeatherData;
  airPollution?: AirPollutionResponse;
}

function calculatePollenRisk(weather: WeatherData) {
  const temp = weather.main.temp;
  const humidity = weather.main.humidity;
  const wind = weather.wind.speed;
  const isRaining = weather.weather[0].main.toLowerCase().includes("rain") || weather.weather[0].main.toLowerCase().includes("drizzle");

  if (temp < 5 || isRaining) return { level: "Low", value: 15, color: "bg-green-500", text: "text-green-500" };
  
  let risk = 30; // base risk
  if (temp > 15 && temp < 28) risk += 30; // Optimal temp for pollen
  if (humidity < 50) risk += 20; // Dry air helps pollen spread
  if (wind > 3) risk += 20; // Wind spreads pollen

  if (risk < 33) return { level: "Low", value: risk, color: "bg-green-500", text: "text-green-500" };
  if (risk < 66) return { level: "Moderate", value: risk, color: "bg-yellow-500", text: "text-yellow-500" };
  if (risk < 85) return { level: "High", value: risk, color: "bg-orange-500", text: "text-orange-500" };
  return { level: "Very High", value: risk, color: "bg-red-500", text: "text-red-500" };
}

function calculateDustRisk(aqiData?: AirPollutionResponse) {
  if (!aqiData || !aqiData.list.length) return { level: "Unknown", value: 0, color: "bg-muted", text: "text-muted-foreground" };
  const pm10 = aqiData.list[0].components.pm10;
  const value = Math.min((pm10 / 100) * 100, 100);
  
  if (pm10 < 20) return { level: "Low", value: Math.max(10, value), color: "bg-green-500", text: "text-green-500" };
  if (pm10 < 50) return { level: "Moderate", value, color: "bg-yellow-500", text: "text-yellow-500" };
  if (pm10 < 100) return { level: "High", value, color: "bg-orange-500", text: "text-orange-500" };
  return { level: "Severe", value: 100, color: "bg-red-500", text: "text-red-500" };
}

function calculateRespRisk(aqiData?: AirPollutionResponse) {
  if (!aqiData || !aqiData.list.length) return { level: "Unknown", value: 0, color: "bg-muted", text: "text-muted-foreground" };
  const pm25 = aqiData.list[0].components.pm2_5;
  const o3 = aqiData.list[0].components.o3;
  
  const pm25Risk = Math.min((pm25 / 50) * 100, 100);
  const o3Risk = Math.min((o3 / 180) * 100, 100);
  const value = Math.max(pm25Risk, o3Risk); 

  if (value < 30) return { level: "Low", value: Math.max(10, value), color: "bg-green-500", text: "text-green-500" };
  if (value < 60) return { level: "Moderate", value, color: "bg-yellow-500", text: "text-yellow-500" };
  if (value < 90) return { level: "High", value, color: "bg-orange-500", text: "text-orange-500" };
  return { level: "Severe", value: 100, color: "bg-red-500", text: "text-red-500" };
}

export const AllergyForecast = memo(function AllergyForecast({ weather, airPollution }: AllergyForecastProps) {
  const pollen = useMemo(() => calculatePollenRisk(weather), [weather]);
  const dust = useMemo(() => calculateDustRisk(airPollution), [airPollution]);
  const resp = useMemo(() => calculateRespRisk(airPollution), [airPollution]);

  const indicators = [
    {
      title: "Tree & Grass Pollen",
      icon: Trees,
      data: pollen,
      desc: "Based on temperature, wind, and rain"
    },
    {
      title: "Dust & Dander",
      icon: Wind,
      data: dust,
      desc: "Based on PM10 particulate levels"
    },
    {
      title: "Respiratory Irritants",
      icon: ShieldAlert,
      data: resp,
      desc: "Based on PM2.5 and Ozone (O3) levels"
    }
  ];

  return (
    <Card className="w-full h-full border-border/50 bg-card/40 backdrop-blur-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center gap-2 font-bold tracking-tight">
          <HeartPulse className="h-5 w-5 text-rose-500" />
          Health & Allergy Risks
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {indicators.map((ind, i) => {
          const Icon = ind.icon;
          return (
            <div key={i} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold text-sm">{ind.title}</span>
                </div>
                <span className={`text-sm font-bold ${ind.data.text}`}>
                  {ind.data.level}
                </span>
              </div>
              
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div 
                  className={`h-full ${ind.data.color} transition-all duration-1000 ease-in-out`} 
                  style={{ width: `${ind.data.value}%` }}
                />
              </div>
              
              <p className="text-[11px] text-muted-foreground font-medium">
                {ind.desc}
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
});

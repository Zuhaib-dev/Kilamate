import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { 
  Shirt, 
  Umbrella, 
  Wind, 
  Sun, 
  ShieldCheck,
  Zap
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { WeatherData } from "@/api/types";
import { memo } from "react";

interface ClothingAdvisorProps {
  data: WeatherData;
}

interface ClothingItem {
  icon: React.ElementType;
  labelKey: string;
  color: string;
}

export const ClothingAdvisor = memo(function ClothingAdvisor({ data }: ClothingAdvisorProps) {
  const { t } = useTranslation();
  if (!data || !data.weather || !data.main || !data.wind || !data.sys) return null;

  const { main, wind, weather, dt, sys } = data;
  const temp = main.temp;
  const windMs = wind.speed;
  const conditionId = weather[0]?.id ?? 800;
  
  // Calculate UV roughly if not provided (reusing estimate logic)
  const isDay = sys.sunrise && sys.sunset && dt >= sys.sunrise && dt <= sys.sunset;
  let uvi = 0;
  if (isDay && sys.sunset > sys.sunrise) {
    const solarArc = Math.sin(((dt - sys.sunrise) / (sys.sunset - sys.sunrise)) * Math.PI);
    let cloud = 1;
    if (conditionId >= 200 && conditionId < 300) cloud = 0.05;
    else if (conditionId >= 300 && conditionId < 600) cloud = 0.15;
    else if (conditionId >= 600 && conditionId < 700) cloud = 0.3;
    else if (conditionId >= 700 && conditionId < 800) cloud = 0.5;
    else if (conditionId === 800) cloud = 1;
    else if (conditionId === 801) cloud = 0.85;
    else if (conditionId <= 804) cloud = 0.45;
    uvi = 10 * solarArc * cloud;
  }

  const items: ClothingItem[] = [];

  // 1. Layering Based on Temperature
  if (temp < 5) {
    items.push({ icon: Shirt, labelKey: "clothing.items.heavyCoat", color: "text-blue-500" });
    items.push({ icon: Zap, labelKey: "clothing.items.thermal", color: "text-cyan-500" });
    items.push({ icon: ShieldCheck, labelKey: "clothing.items.gloves", color: "text-slate-400" });
  } else if (temp < 15) {
    items.push({ icon: Shirt, labelKey: "clothing.items.jacket", color: "text-sky-500" });
    items.push({ icon: Shirt, labelKey: "clothing.items.pants", color: "text-slate-500" });
  } else if (temp < 22) {
    items.push({ icon: Shirt, labelKey: "clothing.items.hoodie", color: "text-emerald-500" });
  } else if (temp < 30) {
    items.push({ icon: Shirt, labelKey: "clothing.items.tshirt", color: "text-orange-400" });
  } else {
    items.push({ icon: Shirt, labelKey: "clothing.items.shorts", color: "text-red-400" });
  }

  // 2. Weather Condition Add-ons
  if (conditionId < 600 && conditionId >= 200) {
    items.push({ icon: Umbrella, labelKey: "clothing.items.umbrella", color: "text-indigo-500" });
  }

  if (windMs > 8) {
    items.push({ icon: Wind, labelKey: "clothing.items.windbreaker", color: "text-teal-500" });
  }

  if (uvi > 6) {
    items.push({ icon: Sun, labelKey: "clothing.items.sunglasses", color: "text-yellow-500" });
    items.push({ icon: ShieldCheck, labelKey: "clothing.items.sunscreen", color: "text-orange-500" });
  }

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="pb-3 border-b bg-muted/20">
        <CardTitle className="flex items-center gap-2 text-base font-bold">
          <Shirt className="h-4 w-4 text-primary" />
          {t("clothing.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-4">
        <div className="grid grid-cols-2 gap-3 h-full">
          {items.map((item, i) => (
            <div 
              key={i} 
              className="flex flex-col items-center justify-center p-3 rounded-xl border bg-card hover:bg-muted/50 transition-all group pointer-events-none"
            >
              <item.icon className={`h-8 w-8 mb-2 ${item.color} group-hover:scale-110 transition-transform`} />
              <span className="text-[11px] font-bold text-center leading-tight uppercase tracking-tight opacity-80">
                {t(item.labelKey)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

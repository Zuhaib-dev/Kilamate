import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { 
  PiThermometerFill, 
  PiTShirtFill, 
  PiHoodieFill, 
  PiSunglassesFill, 
  PiUmbrellaFill, 
  PiSprayBottleFill,
  PiWindFill
} from "react-icons/pi";
import { 
  GiWinterGloves, 
  GiShorts, 
  GiMonclerJacket,
  GiTrousers
} from "react-icons/gi";
import { TbJacket } from "react-icons/tb";
import { useTranslation } from "react-i18next";
import type { WeatherData } from "@/api/types";
import { memo } from "react";
import { motion } from "framer-motion";
import { staggerContainerFast } from "@/lib/animations";


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
    items.push({ icon: GiMonclerJacket, labelKey: "clothing.items.heavyCoat", color: "text-blue-500" });
    items.push({ icon: PiThermometerFill, labelKey: "clothing.items.thermal", color: "text-cyan-500" });
    items.push({ icon: GiWinterGloves, labelKey: "clothing.items.gloves", color: "text-slate-400" });
  } else if (temp < 15) {
    items.push({ icon: TbJacket, labelKey: "clothing.items.jacket", color: "text-sky-500" });
    items.push({ icon: GiTrousers, labelKey: "clothing.items.pants", color: "text-slate-500" });
  } else if (temp < 22) {
    items.push({ icon: PiHoodieFill, labelKey: "clothing.items.hoodie", color: "text-emerald-500" });
  } else if (temp < 30) {
    items.push({ icon: PiTShirtFill, labelKey: "clothing.items.tshirt", color: "text-orange-400" });
  } else {
    items.push({ icon: GiShorts, labelKey: "clothing.items.shorts", color: "text-red-400" });
  }

  // 2. Weather Condition Add-ons
  if (conditionId < 600 && conditionId >= 200) {
    items.push({ icon: PiUmbrellaFill, labelKey: "clothing.items.umbrella", color: "text-indigo-500" });
  }

  if (windMs > 8) {
    items.push({ icon: PiWindFill, labelKey: "clothing.items.windbreaker", color: "text-teal-500" });
  }

  if (uvi > 6) {
    items.push({ icon: PiSunglassesFill, labelKey: "clothing.items.sunglasses", color: "text-yellow-500" });
    items.push({ icon: PiSprayBottleFill, labelKey: "clothing.items.sunscreen", color: "text-orange-500" });
  }

  const tileVariant = {
    hidden: { opacity: 0, scale: 0.7, y: 10 },
    visible: {
      opacity: 1, scale: 1, y: 0,
      transition: { type: "spring", stiffness: 400, damping: 22 },
    },
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="pb-3 border-b bg-muted/20">
        <CardTitle className="flex items-center gap-2 text-base font-bold">
          <motion.div
            animate={{ rotate: [0, -8, 8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <PiTShirtFill className="h-4 w-4 text-primary" />
          </motion.div>
          {t("clothing.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-4">
        <motion.div
          className="grid grid-cols-2 gap-3 h-full"
          variants={staggerContainerFast}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
        >
          {items.map((item, i) => (
            <motion.div
              key={i}
              className="flex flex-col items-center justify-center p-3 rounded-xl border bg-card"
              variants={tileVariant}
              whileHover={{ scale: 1.06, y: -3, boxShadow: "0px 8px 24px rgba(0,0,0,0.12)" }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 24 }}
            >
              <motion.div
                whileHover={{ rotate: 15, scale: 1.2 }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
              >
                <item.icon className={`h-8 w-8 mb-2 ${item.color}`} />
              </motion.div>
              <span className="text-[11px] font-bold text-center leading-tight uppercase tracking-tight opacity-80">
                {t(item.labelKey)}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </CardContent>
    </Card>
  );
});

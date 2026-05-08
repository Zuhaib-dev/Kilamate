import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Home, Blinds, Thermometer, Droplets, Sun, Wind, Plug } from "lucide-react";
import type { WeatherData, ForecastData } from "@/api/types";
import { memo, useMemo } from "react";
import { motion } from "framer-motion";

interface SmartHomeProps {
  weather: WeatherData;
  forecast?: ForecastData;
}

export const SmartHomeAdvisor = memo(function SmartHomeAdvisor({ weather, forecast }: SmartHomeProps) {
  const recommendations = useMemo(() => {
    const temp = Math.round(weather.main.temp);
    const desc = weather.weather[0].main.toLowerCase();
    const isSunny = desc === "clear";
    const isRaining = desc.includes("rain") || desc.includes("drizzle");
    const willRain = forecast?.list.slice(0, 8).some(f => f.weather[0].main.toLowerCase().includes("rain"));
    const clouds = weather.clouds.all;
    const windSpeed = weather.wind.speed;

    const tips = [];

    // Windows & Blinds
    if (temp > 26 && isSunny) {
      tips.push({
        icon: Blinds,
        title: "Close Blinds",
        desc: "Close south-facing blinds to block heat and reduce AC usage.",
        color: "text-amber-500",
        bg: "bg-amber-500/10"
      });
    } else if (temp >= 18 && temp <= 24 && windSpeed > 2 && windSpeed < 8 && !isRaining) {
      tips.push({
        icon: Wind,
        title: "Open Windows",
        desc: "Perfect temperature and breeze. Open windows for natural ventilation.",
        color: "text-teal-500",
        bg: "bg-teal-500/10"
      });
    } else if (temp < 10 && isSunny) {
      tips.push({
        icon: Sun,
        title: "Open Blinds",
        desc: "Let sunlight in to naturally warm your home and save on heating.",
        color: "text-orange-500",
        bg: "bg-orange-500/10"
      });
    } else if (temp < 5) {
      tips.push({
        icon: Blinds,
        title: "Close Curtains",
        desc: "Draw heavy curtains to insulate windows against the freezing cold.",
        color: "text-blue-500",
        bg: "bg-blue-500/10"
      });
    }

    // Thermostat
    if (temp > 30) {
      tips.push({
        icon: Thermometer,
        title: "Optimize AC",
        desc: "Set AC to 24°C-26°C. Each degree lower increases energy consumption by 8%.",
        color: "text-rose-500",
        bg: "bg-rose-500/10"
      });
    } else if (temp < 10) {
      tips.push({
        icon: Thermometer,
        title: "Heating Efficiency",
        desc: "Set thermostat to 20°C. Lower it by 2-3 degrees when sleeping.",
        color: "text-indigo-500",
        bg: "bg-indigo-500/10"
      });
    }

    // Sprinklers
    if (isRaining || willRain) {
      tips.push({
        icon: Droplets,
        title: "Pause Sprinklers",
        desc: "Rain expected soon. Turn off automated irrigation to save water.",
        color: "text-blue-400",
        bg: "bg-blue-400/10"
      });
    } else if (temp > 28 && !willRain) {
      tips.push({
        icon: Droplets,
        title: "Water Early",
        desc: "Water gardens before 8 AM to minimize evaporation in the heat.",
        color: "text-emerald-500",
        bg: "bg-emerald-500/10"
      });
    }

    // Energy / Solar
    if (clouds < 20 && isSunny) {
      tips.push({
        icon: Plug,
        title: "Run Heavy Appliances",
        desc: "Peak solar generation. Great time to run the dishwasher or washing machine.",
        color: "text-yellow-500",
        bg: "bg-yellow-500/10"
      });
    } else if (clouds > 80) {
      tips.push({
        icon: Plug,
        title: "Conserve Energy",
        desc: "Low solar generation due to overcast skies. Delay heavy appliance use if possible.",
        color: "text-slate-500",
        bg: "bg-slate-500/10"
      });
    }

    // Fallback if empty
    if (tips.length === 0) {
      tips.push({
        icon: Home,
        title: "Standard Efficiency",
        desc: "Weather is mild. Keep your smart home systems running on their standard schedule.",
        color: "text-primary",
        bg: "bg-primary/10"
      });
    }

    return tips.slice(0, 4); // Keep to a max of 4 items for a neat 2x2 grid
  }, [weather, forecast]);

  return (
    <Card className="w-full h-full border-border/50 bg-card/40 backdrop-blur-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center gap-2 font-bold tracking-tight">
          <Home className="h-5 w-5 text-primary" />
          Smart Home & Energy
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {recommendations.map((tip, idx) => {
            const Icon = tip.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors"
              >
                <div className={`shrink-0 p-2.5 rounded-lg shadow-sm ${tip.bg}`}>
                  <Icon className={`h-5 w-5 ${tip.color}`} />
                </div>
                <div className="space-y-1 min-w-0">
                  <h4 className="text-sm font-bold text-foreground truncate">{tip.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {tip.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
});

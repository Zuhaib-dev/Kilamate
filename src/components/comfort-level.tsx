import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ThermometerSun, Droplets } from "lucide-react";
import { WeatherData } from "@/api/types";
import { memo } from "react";
import { Skeleton } from "./ui/skeleton";
import { usePreferences } from "@/hooks/use-preferences";
import { formatTemperature } from "@/lib/units";

interface ComfortLevelProps {
  data: WeatherData;
  isLoading?: boolean;
}

const getComfortStatus = (dewPoint: number) => {
  if (dewPoint < 10) return { label: "Dry & Crisp", color: "text-sky-400", bg: "bg-sky-400/10", percent: 20 };
  if (dewPoint < 15) return { label: "Very Pleasant", color: "text-emerald-400", bg: "bg-emerald-400/10", percent: 45 };
  if (dewPoint < 18) return { label: "Comfortable", color: "text-emerald-500", bg: "bg-emerald-500/10", percent: 60 };
  if (dewPoint < 20) return { label: "Humid", color: "text-amber-400", bg: "bg-amber-400/10", percent: 75 };
  if (dewPoint < 22) return { label: "Sticky", color: "text-orange-500", bg: "bg-orange-500/10", percent: 85 };
  return { label: "Oppressive", color: "text-destructive", bg: "bg-destructive/10", percent: 100 };
};

export const ComfortLevel = memo(({ data, isLoading }: ComfortLevelProps) => {
  if (isLoading) {
    return <Skeleton className="h-full w-full rounded-2xl" />;
  }

  const { temperatureUnit } = usePreferences();

  const { temp, humidity } = data.main;
  
  // Dew point approximation: Td = T - ((100 - RH)/5)
  const dewPoint = Math.round(temp - ((100 - humidity) / 5));
  const { label, color, bg, percent } = getComfortStatus(dewPoint);

  return (
    <Card className="relative overflow-hidden group rounded-2xl border-none bg-card/20 backdrop-blur-md hover:bg-card/40 transition-all border-white/5 h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-lg">
            <ThermometerSun className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-sm font-bold tracking-tight uppercase">Comfort Level</CardTitle>
        </div>
        <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${bg} ${color}`}>
          {label}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-end">
             <div className="space-y-1">
                <p className="text-3xl font-black tracking-tighter leading-none italic">
                    {formatTemperature(dewPoint, temperatureUnit)}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.1em]">
                    Dew Point
                </p>
             </div>
             <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-background/40">
                <Droplets className="h-4 w-4 text-sky-400" />
                <span className="text-xs font-black italic">{humidity}%</span>
             </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="relative h-2 w-full rounded-full bg-muted/30 overflow-hidden">
               {/* Visual gradient gauge */}
               <div 
                  className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-out rounded-full opacity-80`}
                  style={{ 
                    width: `${percent}%`,
                    background: `linear-gradient(to right, #38bdf8, #10b981, #f59e0b, #ef4444)` 
                  }}
               />
               {/* Current position indicator */}
               <div 
                  className="absolute top-0 h-full w-1.5 bg-white shadow-[0_0_10px_white] z-10 transition-all duration-1000 ease-out"
                  style={{ left: `calc(${percent}% - 4px)` }}
               />
            </div>
            <div className="flex justify-between text-[8px] text-muted-foreground font-black uppercase tracking-widest opacity-60">
                <span>Dry</span>
                <span>Neutral</span>
                <span>Moist</span>
            </div>
          </div>
        </div>
        
        {/* Subtle background icon */}
        <div className="absolute -bottom-4 -right-4 h-20 w-20 text-primary/5 -rotate-12">
            <ThermometerSun className="h-full w-full" />
        </div>
      </CardContent>
    </Card>
  );
});

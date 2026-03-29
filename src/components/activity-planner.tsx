import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { 
  Zap, 
  Bike, 
  MapPin, 
  Car, 
  Trees, 
  Activity 
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ForecastData } from "@/api/types";
import { memo } from "react";

interface ActivityPlannerProps {
  data: ForecastData;
}

interface ActivityScore {
  icon: React.ElementType;
  labelKey: string;
  score: number;
  color: string;
}

export const ActivityPlanner = memo(function ActivityPlanner({ data }: ActivityPlannerProps) {
  const { t } = useTranslation();
  
  const scores = useMemo(() => {
    if (!data?.list?.length) return [];
    
    // Analyze the next 12 hours (4 forecast points as they are 3h each)
    const next12h = data.list.slice(0, 4);
    
    const avgTemp = next12h.reduce((acc, f) => acc + f.main.temp, 0) / next12h.length;
    const maxPop = Math.max(...next12h.map(f => f.pop ?? 0));
    const avgWind = next12h.reduce((acc, f) => acc + f.wind.speed, 0) / next12h.length;
    const avgHumid = next12h.reduce((acc, f) => acc + f.main.humidity, 0) / next12h.length;

    const calculateScore = (type: "running" | "cycling" | "picnic" | "carwash" | "gardening") => {
      let score = 100;
      
      // Rain penalty (major for all)
      if (maxPop > 0.5) score -= 60;
      else if (maxPop > 0.2) score -= 30;
      
      switch (type) {
        case "running":
          if (avgTemp > 28) score -= (avgTemp - 28) * 5;
          if (avgTemp < 5) score -= (5 - avgTemp) * 5;
          if (avgHumid > 70) score -= 15;
          break;
        case "cycling":
          if (avgWind > 10) score -= (avgWind - 10) * 8;
          if (avgTemp > 32) score -= 20;
          break;
        case "picnic":
          if (avgTemp < 15 || avgTemp > 30) score -= 40;
          if (avgWind > 8) score -= 20;
          break;
        case "carwash":
          if (maxPop > 0.1) score = 0; // Don't wash if rain is coming
          if (avgTemp < 2) score -= 50;
          break;
        case "gardening":
          if (avgTemp > 35) score -= 40;
          if (avgHumid < 30) score -= 10;
          break;
      }
      return Math.max(0, Math.min(100, score));
    };

    const getScoreColor = (score: number) => {
      if (score >= 80) return "bg-green-500";
      if (score >= 50) return "bg-yellow-500";
      if (score >= 30) return "bg-orange-500";
      return "bg-red-500";
    };

    const activityList: ActivityScore[] = [
      { icon: Zap, labelKey: "activity.types.running", score: calculateScore("running"), color: getScoreColor(calculateScore("running")) },
      { icon: Bike, labelKey: "activity.types.cycling", score: calculateScore("cycling"), color: getScoreColor(calculateScore("cycling")) },
      { icon: MapPin, labelKey: "activity.types.picnic", score: calculateScore("picnic"), color: getScoreColor(calculateScore("picnic")) },
      { icon: Car, labelKey: "activity.types.carwash", score: calculateScore("carwash"), color: getScoreColor(calculateScore("carwash")) },
      { icon: Trees, labelKey: "activity.types.gardening", score: calculateScore("gardening"), color: getScoreColor(calculateScore("gardening")) },
    ];

    return activityList;
  }, [data]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 border-b bg-muted/20">
        <CardTitle className="flex items-center gap-2 text-base font-bold">
          <Activity className="h-4 w-4 text-primary" />
          {t("activity.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-4 space-y-4">
        {scores.map((activity, i) => (
          <div key={i} className="flex flex-col gap-1.5 group">
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <activity.icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="font-semibold uppercase tracking-wider">{t(activity.labelKey)}</span>
              </div>
              <span className={`font-mono font-bold ${activity.score < 50 ? 'text-muted-foreground' : ''}`}>
                {activity.score}%
              </span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden shadow-inner translate-z-0">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out ${activity.color} shadow-sm`}
                style={{ width: `${activity.score}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
});

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Shirt,
  Umbrella,
  Wind,
  Footprints,
  Camera,
  ShieldAlert,
  Bike,
  Car,
  Coffee,
  TreePine,
  Dumbbell,
} from "lucide-react";
import type { WeatherData, ForecastData, AirPollutionResponse } from "@/api/types";
import { calculateAQI } from "@/lib/aqi-utils";
import { memo } from "react";

interface DailyOutlookProps {
  weather: WeatherData;
  forecast?: ForecastData | null;
  airPollution?: AirPollutionResponse | null;
}

type RecStatus = "good" | "caution" | "bad";

interface Recommendation {
  icon: React.ElementType;
  label: string;
  detail: string;
  status: RecStatus;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getUpcomingMaxPop(forecast?: ForecastData | null): number {
  if (!forecast?.list?.length) return 0;
  return Math.max(...forecast.list.slice(0, 4).map((f) => f.pop ?? 0));
}

function estimateUVI(conditionId: number, dt: number, sunrise: number, sunset: number): number {
  if (dt < sunrise || dt > sunset) return 0;
  const solarArc = Math.sin(((dt - sunrise) / (sunset - sunrise)) * Math.PI);
  let cloud = 1;
  if (conditionId >= 200 && conditionId < 300) cloud = 0.05;
  else if (conditionId >= 300 && conditionId < 600) cloud = 0.15;
  else if (conditionId >= 600 && conditionId < 700) cloud = 0.3;
  else if (conditionId >= 700 && conditionId < 800) cloud = 0.5;
  else if (conditionId === 800) cloud = 1;
  else if (conditionId === 801) cloud = 0.85;
  else if (conditionId <= 804) cloud = 0.45;
  return Math.round(10 * solarArc * cloud * 10) / 10;
}

function getDayScore(temp: number, pop: number, windMs: number, aqi: number, uvi: number): {
  score: number;
  label: string;
  color: string;
  bg: string;
  desc: string;
} {
  let score = 100;
  // Precipitation penalty
  if (pop > 0.8) score -= 30;
  else if (pop > 0.5) score -= 20;
  else if (pop > 0.25) score -= 10;
  // Temperature extremes
  if (temp > 38 || temp < -5) score -= 25;
  else if (temp > 33 || temp < 5) score -= 12;
  // Wind
  if (windMs > 15) score -= 20;
  else if (windMs > 10) score -= 10;
  // AQI
  if (aqi > 200) score -= 30;
  else if (aqi > 150) score -= 20;
  else if (aqi > 100) score -= 10;
  // UV
  if (uvi > 10) score -= 15;
  else if (uvi > 7) score -= 8;

  score = Math.max(0, Math.min(100, score));

  if (score >= 80) return { score, label: "Great Day",   color: "text-green-500",  bg: "bg-green-500",  desc: "Ideal conditions for outdoor activities." };
  if (score >= 60) return { score, label: "Good Day",    color: "text-lime-500",   bg: "bg-lime-500",   desc: "Most activities are comfortable." };
  if (score >= 40) return { score, label: "Fair Day",    color: "text-yellow-500", bg: "bg-yellow-500", desc: "Some uncomfortable conditions — plan accordingly." };
  if (score >= 20) return { score, label: "Rough Day",   color: "text-orange-500", bg: "bg-orange-500", desc: "Limited outdoor comfort. Take precautions." };
  return                  { score, label: "Stay Indoors",color: "text-red-500",    bg: "bg-red-500",    desc: "Conditions are harsh. Minimise outdoor exposure." };
}

// ─── Component ──────────────────────────────────────────────────────────────

export const DailyOutlook = memo(function DailyOutlook({
  weather,
  forecast,
  airPollution,
}: DailyOutlookProps) {
  const { main, wind, weather: conditions, sys, dt } = weather;
  const conditionId = conditions[0]?.id ?? 800;
  const temp = main.temp;
  const windMs = wind.speed;
  const pop = getUpcomingMaxPop(forecast);
  const aqi = airPollution?.list?.[0]
    ? calculateAQI(airPollution.list[0].components)
    : 0;
  const uvi = estimateUVI(conditionId, dt, sys.sunrise, sys.sunset);

  const dayInfo = getDayScore(temp, pop, windMs, aqi, uvi);

  // ── Build recommendations ──────────────────────────────────────────────
  const recs: Recommendation[] = [];

  // Umbrella / rain
  if (pop >= 0.6) {
    recs.push({ icon: Umbrella, label: "Carry umbrella", detail: `${Math.round(pop * 100)}% chance of rain`, status: "bad" });
  } else if (pop >= 0.25) {
    recs.push({ icon: Umbrella, label: "Umbrella advisable", detail: `${Math.round(pop * 100)}% chance of showers`, status: "caution" });
  } else {
    recs.push({ icon: Umbrella, label: "No rain expected", detail: "Clear skies ahead", status: "good" });
  }

  // Outdoor exercise
  const goodForExercise = temp >= 10 && temp <= 28 && windMs <= 8 && aqi <= 100 && pop < 0.3;
  const okForExercise   = !goodForExercise && temp >= 5 && temp <= 33 && aqi <= 150 && pop < 0.5;
  if (goodForExercise) {
    recs.push({ icon: Dumbbell, label: "Great for exercise", detail: "Temp, wind & air quality are ideal", status: "good" });
  } else if (okForExercise) {
    recs.push({ icon: Footprints, label: "Light exercise ok", detail: "Avoid strenuous activity", status: "caution" });
  } else {
    recs.push({ icon: Footprints, label: "Skip outdoor workout", detail: aqi > 150 ? "Poor air quality" : "Conditions unfavourable", status: "bad" });
  }

  // Clothing layer
  if (temp < 5) {
    recs.push({ icon: Shirt, label: "Bundle up", detail: "Heavy coat & layers essential", status: "caution" });
  } else if (temp < 15) {
    recs.push({ icon: Shirt, label: "Wear a jacket", detail: "It's chilly outside", status: "caution" });
  } else if (temp > 30) {
    recs.push({ icon: Shirt, label: "Dress light", detail: "Light, breathable clothing", status: "good" });
  } else {
    recs.push({ icon: Shirt, label: "Comfortable clothing", detail: "No special layering needed", status: "good" });
  }

  // Driving / commute
  const badDriving = windMs > 12 || pop > 0.7 || conditionId >= 600 && conditionId < 700;
  const cautionDriving = windMs > 8 || pop > 0.4;
  if (badDriving) {
    recs.push({ icon: Car, label: "Drive carefully", detail: "Reduced visibility or slippery roads", status: "bad" });
  } else if (cautionDriving) {
    recs.push({ icon: Car, label: "Allow extra travel time", detail: "Wet or windy conditions", status: "caution" });
  } else {
    recs.push({ icon: Car, label: "Good commuting conditions", detail: "Roads should be clear", status: "good" });
  }

  // Photography / outdoor leisure
  const greatPhoto = pop < 0.15 && uvi < 8 && windMs < 6 && aqi < 80;
  if (greatPhoto) {
    recs.push({ icon: Camera, label: "Perfect for photography", detail: "Good light & clear skies", status: "good" });
  }

  // Wind sport / cycling
  const goodCycle = temp >= 12 && temp <= 30 && windMs <= 6 && pop < 0.2 && aqi <= 100;
  if (goodCycle) {
    recs.push({ icon: Bike, label: "Great for cycling", detail: "Low wind, mild temps", status: "good" });
  } else if (windMs > 10) {
    recs.push({ icon: Wind, label: "Strong winds", detail: `${Math.round(windMs * 3.6)} km/h — avoid cycling`, status: "bad" });
  }

  // AQI-based outdoor
  if (aqi > 150) {
    recs.push({ icon: ShieldAlert, label: "Limit outdoor time", detail: `AQI is ${aqi} — unhealthy air`, status: "bad" });
  } else if (aqi > 100) {
    recs.push({ icon: ShieldAlert, label: "Sensitive groups: stay in", detail: `AQI ${aqi} — moderate pollution`, status: "caution" });
  } else {
    recs.push({ icon: TreePine, label: "Air quality is fine", detail: `AQI ${aqi} — safe to breathe`, status: "good" });
  }

  // UV protection
  if (uvi > 7) {
    recs.push({ icon: ShieldAlert, label: "Sun protection essential", detail: `UV index: ${uvi} — wear SPF 50+`, status: "bad" });
  } else if (uvi > 3) {
    recs.push({ icon: Coffee, label: "Apply sunscreen", detail: `UV index: ${uvi} — SPF 30 recommended`, status: "caution" });
  }

  // Limit to top 6 most relevant
  const displayRecs = recs.slice(0, 6);

  const statusIcon = {
    good:    { Icon: CheckCircle2, cls: "text-green-500" },
    caution: { Icon: AlertCircle,  cls: "text-yellow-500" },
    bad:     { Icon: XCircle,      cls: "text-red-500" },
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="flex items-center justify-between">
          <span>Today's Outlook</span>
          {/* Day score badge */}
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className={`text-sm font-bold ${dayInfo.color}`}>{dayInfo.label}</p>
              <p className="text-[10px] text-muted-foreground">Score {dayInfo.score}/100</p>
            </div>
            {/* Score ring */}
            <div className="relative w-10 h-10 flex-shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeOpacity={0.1} strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15" fill="none"
                  stroke="currentColor" strokeWidth="3"
                  className={dayInfo.color}
                  strokeDasharray={`${(dayInfo.score / 100) * 94.2} 94.2`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold">
                {dayInfo.score}
              </span>
            </div>
          </div>
        </CardTitle>
        <p className="text-xs text-muted-foreground leading-relaxed">{dayInfo.desc}</p>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 pb-6">
        {/* Score gradient bar */}
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden mb-4 flex-shrink-0">
          <div
            className={`h-full rounded-full transition-all duration-700 ${dayInfo.bg}`}
            style={{ width: `${dayInfo.score}%` }}
          />
        </div>

        {/* Recommendations grid — fills all remaining height */}
        <div className="grid grid-cols-2 gap-2 flex-1" style={{ gridAutoRows: "1fr" }}>
          {displayRecs.map((rec, i) => {
            const { Icon: StatusIcon, cls } = statusIcon[rec.status];
            return (
              <div
                key={i}
                className="flex items-start gap-2.5 rounded-lg border p-3 transition-colors hover:bg-muted/40 h-full"
              >
                <div className="flex-shrink-0 mt-0.5">
                  <rec.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-tight">{rec.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{rec.detail}</p>
                </div>
                <StatusIcon className={`h-4 w-4 flex-shrink-0 mt-0.5 ${cls}`} />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
});

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
import { useTranslation } from "react-i18next";
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
  labelKey: string;
  color: string;
  bg: string;
  descKey: string;
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

  if (score >= 80) return { score, labelKey: "outlook.dayType.great", color: "text-green-500",  bg: "bg-green-500",  descKey: "outlook.desc.great" };
  if (score >= 60) return { score, labelKey: "outlook.dayType.good",  color: "text-lime-500",   bg: "bg-lime-500",   descKey: "outlook.desc.good" };
  if (score >= 40) return { score, labelKey: "outlook.dayType.fair",  color: "text-yellow-500", bg: "bg-yellow-500", descKey: "outlook.desc.fair" };
  if (score >= 20) return { score, labelKey: "outlook.dayType.rough", color: "text-orange-500", bg: "bg-orange-500", descKey: "outlook.desc.rough" };
  return                  { score, labelKey: "outlook.dayType.stay",  color: "text-red-500",    bg: "bg-red-500",    descKey: "outlook.desc.stay" };
}

// ─── Component ──────────────────────────────────────────────────────────────

export const DailyOutlook = memo(function DailyOutlook({
  weather,
  forecast,
  airPollution,
}: DailyOutlookProps) {
  const { t } = useTranslation();
  const { main, wind, weather: conditions, sys, dt } = weather;
  const conditionId = conditions[0]?.id ?? 800;
  const temp = main.temp;
  const windMs = wind.speed;
  const pop = getUpcomingMaxPop(forecast);
  const aqiValue = airPollution?.list?.[0]
    ? calculateAQI(airPollution.list[0].components)
    : 0;
  const uviValue = estimateUVI(conditionId, dt, sys.sunrise, sys.sunset);

  const dayInfo = getDayScore(temp, pop, windMs, aqiValue, uviValue);

  // ── Build recommendations ──────────────────────────────────────────────
  const recs: Recommendation[] = [];

  // Umbrella / rain
  const popPct = Math.round(pop * 100);
  if (pop >= 0.6) {
    recs.push({ icon: Umbrella, label: t("outlook.recs.umbrella.carry"), detail: t("outlook.recs.umbrella.detail_carry", { percent: popPct }), status: "bad" });
  } else if (pop >= 0.25) {
    recs.push({ icon: Umbrella, label: t("outlook.recs.umbrella.advisable"), detail: t("outlook.recs.umbrella.detail_advisable", { percent: popPct }), status: "caution" });
  } else {
    recs.push({ icon: Umbrella, label: t("outlook.recs.umbrella.none"), detail: t("outlook.recs.umbrella.detail_none"), status: "good" });
  }

  // Outdoor exercise
  const goodForExercise = temp >= 10 && temp <= 28 && windMs <= 8 && aqiValue <= 100 && pop < 0.3;
  const okForExercise   = !goodForExercise && temp >= 5 && temp <= 33 && aqiValue <= 150 && pop < 0.5;
  if (goodForExercise) {
    recs.push({ icon: Dumbbell, label: t("outlook.recs.exercise.great"), detail: t("outlook.recs.exercise.detail_great"), status: "good" });
  } else if (okForExercise) {
    recs.push({ icon: Footprints, label: t("outlook.recs.exercise.ok"), detail: t("outlook.recs.exercise.detail_ok"), status: "caution" });
  } else {
    recs.push({ icon: Footprints, label: t("outlook.recs.exercise.skip"), detail: aqiValue > 150 ? t("outlook.recs.exercise.detail_poor_aqi") : t("outlook.recs.exercise.detail_unfavourable"), status: "bad" });
  }

  // Clothing layer
  if (temp < 5) {
    recs.push({ icon: Shirt, label: t("outlook.recs.clothing.bundle"), detail: t("outlook.recs.clothing.detail_bundle"), status: "caution" });
  } else if (temp < 15) {
    recs.push({ icon: Shirt, label: t("outlook.recs.clothing.jacket"), detail: t("outlook.recs.clothing.detail_jacket"), status: "caution" });
  } else if (temp > 30) {
    recs.push({ icon: Shirt, label: t("outlook.recs.clothing.light"), detail: t("outlook.recs.clothing.detail_light"), status: "good" });
  } else {
    recs.push({ icon: Shirt, label: t("outlook.recs.clothing.comfort"), detail: t("outlook.recs.clothing.detail_comfort"), status: "good" });
  }

  // Driving / commute
  const badDriving = windMs > 12 || pop > 0.7 || conditionId >= 600 && conditionId < 700;
  const cautionDriving = windMs > 8 || pop > 0.4;
  if (badDriving) {
    recs.push({ icon: Car, label: t("outlook.recs.drive.careful"), detail: t("outlook.recs.drive.detail_bad"), status: "bad" });
  } else if (cautionDriving) {
    recs.push({ icon: Car, label: t("outlook.recs.drive.extra"), detail: t("outlook.recs.drive.detail_caution"), status: "caution" });
  } else {
    recs.push({ icon: Car, label: t("outlook.recs.drive.good"), detail: t("outlook.recs.drive.detail_good"), status: "good" });
  }

  // Photography / outdoor leisure
  const greatPhoto = pop < 0.15 && uviValue < 8 && windMs < 6 && aqiValue < 80;
  if (greatPhoto) {
    recs.push({ icon: Camera, label: t("outlook.recs.photo.perfect"), detail: t("outlook.recs.photo.detail"), status: "good" });
  }

  // Wind sport / cycling
  const goodCycle = temp >= 12 && temp <= 30 && windMs <= 6 && pop < 0.2 && aqiValue <= 100;
  if (goodCycle) {
    recs.push({ icon: Bike, label: t("outlook.recs.cycling.great"), detail: t("outlook.recs.cycling.detail"), status: "good" });
  } else if (windMs > 10) {
    recs.push({ icon: Wind, label: t("outlook.recs.cycling.strong_wind"), detail: t("outlook.recs.cycling.detail_strong_wind", { speed: Math.round(windMs * 3.6) }), status: "bad" });
  }

  // AQI-based outdoor
  if (aqiValue > 150) {
    recs.push({ icon: ShieldAlert, label: t("outlook.recs.aqi.limit"), detail: t("outlook.recs.aqi.detail_bad", { aqi: aqiValue }), status: "bad" });
  } else if (aqiValue > 100) {
    recs.push({ icon: ShieldAlert, label: t("outlook.recs.aqi.sensitive"), detail: t("outlook.recs.aqi.detail_caution", { aqi: aqiValue }), status: "caution" });
  } else {
    recs.push({ icon: TreePine, label: t("outlook.recs.aqi.fine"), detail: t("outlook.recs.aqi.detail_fine", { aqi: aqiValue }), status: "good" });
  }

  // UV protection
  if (uviValue > 7) {
    recs.push({ icon: ShieldAlert, label: t("outlook.recs.uv.essential"), detail: t("outlook.recs.uv.detail_bad", { uvi: uviValue }), status: "bad" });
  } else if (uviValue > 3) {
    recs.push({ icon: Coffee, label: t("outlook.recs.uv.apply"), detail: t("outlook.recs.uv.detail_caution", { uvi: uviValue }), status: "caution" });
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
          <span>{t("outlook.title")}</span>
          {/* Day score badge */}
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className={`text-sm font-bold ${dayInfo.color}`}>{t(dayInfo.labelKey)}</p>
              <p className="text-[10px] text-muted-foreground">{t("outlook.score", { score: dayInfo.score })}</p>
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
        <p className="text-xs text-muted-foreground leading-relaxed">{t(dayInfo.descKey)}</p>
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

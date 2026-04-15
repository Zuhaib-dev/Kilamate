import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Wind,
  Droplets,
  Eye,
  Thermometer,
  Skull,
  Zap,
  Sun,
  Sprout,
  Shirt,
  Snowflake,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";
import type { WeatherData, AirPollutionResponse, ForecastData } from "@/api/types";
import { useNotifications } from "@/hooks/use-notifications";
import { useEffect, useMemo } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { calculateAQI, getAQIDescription } from "@/lib/aqi-utils";
import { useTranslation } from "react-i18next";
import { usePreferences } from "@/hooks/use-preferences";
import { motion, AnimatePresence } from "framer-motion";
import { 
  estimateUVI, 
  getScabRisk, 
  getFrostRisk, 
  isInJandK, 
  getClothingAdvice 
} from "@/lib/weather-utils";
import { 
  staggerContainerFast, 
  slideUp, 
  cardHover, 
} from "@/lib/animations";

// How long to suppress the same alert before re-notifying (24 hours)
const ALERT_COOLDOWN_MS = 24 * 60 * 60 * 1000;
const SENT_ALERTS_KEY = "sent-weather-alerts";

type SentAlertsMap = Record<string, number>;

function wasSentRecently(sentAlerts: SentAlertsMap, key: string): boolean {
  const lastSent = sentAlerts[key];
  if (!lastSent) return false;
  return Date.now() - lastSent < ALERT_COOLDOWN_MS;
}

interface WeatherAlertsProps {
  data: WeatherData;
  airPollution?: AirPollutionResponse;
  forecast?: ForecastData;
}

interface WeatherAlert {
  id: string;
  type: "warning" | "info" | "destructive" | "success";
  category: "weather" | "aqi" | "agriculture" | "protection" | "clothing";
  severity: "high" | "medium" | "low";
  icon: React.ElementType;
  title: string;
  message: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export function WeatherAlerts({ data, airPollution, forecast }: WeatherAlertsProps) {
  const { sendNotification, permission } = useNotifications();
  const { t } = useTranslation();
  const { temperatureUnit, windSpeedUnit } = usePreferences();
  const [notificationsEnabled] = useLocalStorage("notifications-enabled", false);
  const [sentAlerts, setSentAlerts] = useLocalStorage<SentAlertsMap>(SENT_ALERTS_KEY, {});

  // Normalise to user-facing units
  const tempC  = data.main.temp;
  const windMs = data.wind.speed;

  const displayTemp = temperatureUnit === "fahrenheit"
    ? Math.round(tempC * 9 / 5 + 32)
    : Math.round(tempC);

  const displayWind = windSpeedUnit === "mph"
    ? Math.round(windMs * 2.237)
    : windSpeedUnit === "kmh"
      ? Math.round(windMs * 3.6)
      : Math.round(windMs);
  const windSymbol = windSpeedUnit === "mph" ? "mph" : windSpeedUnit === "kmh" ? "km/h" : "m/s";

  const alerts = useMemo(() => {
    const list: WeatherAlert[] = [];

    // 1. HIGH WIND
    if (windMs > 10) {
      list.push({
        id: "wind",
        type: "warning",
        category: "weather",
        severity: "medium",
        icon: Wind,
        title: t("alerts.highWind"),
        message: t("alerts.highWindMessage", { speed: displayWind, unit: windSymbol }),
        color: "text-orange-500",
        bgColor: "bg-orange-500/10",
        borderColor: "border-orange-500/20",
      });
    }

    // 2. HUMIDITY
    if (data.main.humidity > 85) {
      list.push({
        id: "humidity",
        type: "info",
        category: "weather",
        severity: "low",
        icon: Droplets,
        title: t("alerts.highHumidity"),
        message: t("alerts.highHumidityMessage", { humidity: data.main.humidity }),
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/20",
      });
    }

    // 3. VISIBILITY
    const weatherCondition = data.weather[0]?.main.toLowerCase();
    if (weatherCondition === "mist" || weatherCondition === "fog" || (data.visibility && data.visibility < 1000)) {
      list.push({
        id: "visibility",
        type: "warning",
        category: "weather",
        severity: "medium",
        icon: Eye,
        title: t("alerts.lowVisibility"),
        message: t("alerts.lowVisibilityMessage"),
        color: "text-amber-500",
        bgColor: "bg-amber-500/10",
        borderColor: "border-amber-500/20",
      });
    }

    // 4. EXTREME TEMP
    if (tempC > 35) {
      list.push({
        id: "extreme-heat",
        type: "warning",
        category: "weather",
        severity: "high",
        icon: Thermometer,
        title: t("alerts.extremeHeat"),
        message: t("alerts.extremeHeatMessage", { temp: displayTemp }),
        color: "text-red-500",
        bgColor: "bg-red-500/10",
        borderColor: "border-red-500/20",
      });
    } else if (tempC < 0) {
      list.push({
        id: "freezing",
        type: "warning",
        category: "weather",
        severity: "high",
        icon: Snowflake,
        title: t("alerts.freezing"),
        message: t("alerts.freezingMessage", { temp: displayTemp }),
        color: "text-blue-400",
        bgColor: "bg-blue-400/10",
        borderColor: "border-blue-400/20",
      });
    }

    // 5. AQI ALERTS
    if (airPollution?.list?.[0]) {
      const currentAQI = calculateAQI(airPollution.list[0].components);
      const aqiInfo = getAQIDescription(currentAQI);

      if (currentAQI > 100) {
        const isHazardous = currentAQI > 300;
        list.push({
          id: `aqi-${currentAQI}`,
          type: isHazardous ? "destructive" : "warning",
          category: "aqi",
          severity: isHazardous ? "high" : "medium",
          icon: isHazardous ? Skull : AlertTriangle,
          title: t(`aqi.${currentAQI > 200 ? 'veryUnhealthy' : currentAQI > 150 ? 'unhealthy' : 'unhealthySensitive'}`),
          message: `AQI is ${currentAQI}. ${t(aqiInfo.descKey)}`,
          color: isHazardous ? "text-red-700" : "text-orange-600",
          bgColor: isHazardous ? "bg-red-700/10" : "bg-orange-600/10",
          borderColor: isHazardous ? "border-red-700/20" : "border-orange-600/20",
        });
      }
    }

    // 6. AGRICULTURE ALERTS (J&K Specific focus)
    if (isInJandK(data)) {
      // Scab Risk
      const scab = getScabRisk(tempC, data.main.humidity, data.weather[0]?.main);
      if (scab.level >= 2) {
        list.push({
          id: "scab-risk",
          type: "warning",
          category: "agriculture",
          severity: scab.level === 3 ? "high" : "medium",
          icon: Sprout,
          title: t("agricultureAdvisor.scabRisk"),
          message: t(`agricultureAdvisor.scabDesc.${scab.level}`),
          color: "text-emerald-500",
          bgColor: "bg-emerald-500/10",
          borderColor: "border-emerald-500/20",
        });
      }

      // Frost Risk (Next 24h)
      const frost = getFrostRisk(forecast);
      if (frost) {
        list.push({
          id: "frost-risk",
          type: "warning",
          category: "agriculture",
          severity: "high",
          icon: Snowflake,
          title: t("agricultureAdvisor.frostRisk"),
          message: `Expected frost event in ${frost.hoursAway}h (${frost.temp}°C). Protect sensitive crops.`,
          color: "text-blue-400",
          bgColor: "bg-blue-400/10",
          borderColor: "border-blue-400/20",
        });
      }

      // Bloom Spray Warning (April)
      const currentMonth = new Date().getMonth();
      if (currentMonth === 3 || currentMonth === 4) { // April/May
         list.push({
          id: "bloom-warning",
          type: "info",
          category: "agriculture",
          severity: "medium",
          icon: AlertCircle,
          title: "Full Bloom Warning",
          message: "Protect pollinators! Avoid chemical sprays during full bloom to ensure bee safety and fruit set.",
          color: "text-yellow-500",
          bgColor: "bg-yellow-500/10",
          borderColor: "border-yellow-500/20",
        });
      }
    }

    // 7. SUN PROTECTION (UV)
    const uvi = estimateUVI(data);
    if (uvi > 5) {
      list.push({
        id: "uv-protection",
        type: "warning",
        category: "protection",
        severity: uvi > 8 ? "high" : "medium",
        icon: Sun,
        title: t("outlook.recs.uv.essential"),
        message: uvi > 8 ? t("outlook.recs.uv.detail_bad", { uvi: uvi.toFixed(1) }) : t("outlook.recs.uv.detail_caution", { uvi: uvi.toFixed(1) }),
        color: "text-amber-500",
        bgColor: "bg-amber-500/10",
        borderColor: "border-amber-500/20",
      });
    }

    // 8. CLOTHING ADVISOR
    const clothing = getClothingAdvice(tempC, data.weather[0]?.id);
    if (clothing.key !== "comfort") {
      list.push({
        id: "clothing-advice",
        type: "info",
        category: "clothing",
        severity: "low",
        icon: Shirt,
        title: t(`outlook.recs.clothing.${clothing.key}`),
        message: t(`outlook.recs.clothing.detail_${clothing.key}`),
        color: "text-indigo-400",
        bgColor: "bg-indigo-400/10",
        borderColor: "border-indigo-400/20",
      });
    }

    return list;
  }, [data, airPollution, forecast, displayTemp, displayWind, windMs, tempC, t, windSymbol]);

  const [notifAgri] = useLocalStorage("notifications-agriculture", true);
  const [notifProt] = useLocalStorage("notifications-protection", true);
  const [notifCloth] = useLocalStorage("notifications-clothing", true);

  // Handle Notifications
  useEffect(() => {
    if (permission === "granted" && notificationsEnabled && alerts.length > 0) {
      let updated = false;
      const newSentAlerts = { ...sentAlerts };

      alerts.forEach((alert) => {
        const alertKey = `${alert.id}-${data.name}`;
        if (!wasSentRecently(newSentAlerts, alertKey)) {
          // Check granular settings
          const isAllowed = 
            (alert.category === 'agriculture' && notifAgri) ||
            (alert.category === 'protection' && notifProt) ||
            (alert.category === 'clothing' && notifCloth) ||
            (alert.category === 'weather' || alert.category === 'aqi');

          if (isAllowed && (alert.severity !== 'low' || alert.category === 'agriculture')) {
            const categoryEmoji = 
              alert.category === 'agriculture' ? '🍎' :
              alert.category === 'protection' ? '☀️' :
              alert.category === 'clothing' ? '👕' :
              alert.category === 'aqi' ? '😷' : '⚠️';

            sendNotification({
              title: `${categoryEmoji} ${alert.title}`,
              body: alert.message,
              tag: alertKey,
            });
            newSentAlerts[alertKey] = Date.now();
            updated = true;
          }
        }
      });

      if (updated) {
        setSentAlerts(newSentAlerts);
      }
    }
  }, [alerts, permission, sendNotification, data.name, notificationsEnabled, sentAlerts, setSentAlerts, notifAgri, notifProt, notifCloth]);

  if (alerts.length === 0) return null;

  return (
    <Card className="col-span-full border-none shadow-2xl bg-gradient-to-br from-background/60 to-muted/20 backdrop-blur-2xl overflow-hidden ring-1 ring-white/5">
      <CardHeader className="pb-3 border-b flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2.5 rounded-2xl ring-1 ring-primary/20">
            <Zap className="h-5 w-5 text-primary animate-pulse" />
          </div>
          <div className="space-y-0.5">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-primary/80">
              Live Intelligence
            </CardTitle>
            <p className="text-[10px] text-muted-foreground font-medium">Smart Alerts & Local Insights</p>
          </div>
        </div>
        <div className="flex gap-1.5 items-center">
          <div className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20">
            {alerts.length} {alerts.length === 1 ? 'Alert' : 'Alerts'}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <motion.div 
          className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          variants={staggerContainerFast}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence mode="popLayout">
            {alerts.map((alert) => (
              <motion.div
                key={alert.id}
                variants={slideUp}
                whileHover={cardHover.hover}
                whileTap={cardHover.tap}
                className={`relative group flex flex-col p-4 rounded-2xl border ${alert.bgColor} ${alert.borderColor} transition-all duration-300`}
              >
                <div className="flex items-start gap-3 mb-2.5">
                  <div className={`p-2.5 rounded-xl bg-background/80 shadow-inner ring-1 ring-white/10 ${alert.color}`}>
                    <alert.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`text-sm font-black leading-tight truncate ${alert.color}`}>
                        {alert.title}
                      </h4>
                      {alert.severity === "high" && (
                        <div className="flex h-1.5 w-1.5 rounded-full bg-destructive animate-ping shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 opacity-60">
                      <div className={`h-1 w-1 rounded-full ${alert.color.replace('text-', 'bg-')}`} />
                      <p className="text-[10px] font-black uppercase tracking-[0.15em] truncate">
                        {alert.category}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground leading-relaxed font-bold tracking-tight">
                  {alert.message}
                </p>

                {/* Severity Badge */}
                <div className="mt-4 flex items-center justify-between">
                  <div className={`text-[8px] font-black uppercase tracking-[0.2em] border px-2 py-0.5 rounded-md bg-background/30 ${alert.color} ${alert.borderColor}`}>
                    {alert.severity} Priority
                  </div>
                  {alert.severity === 'high' && (
                    <div className="bg-destructive/10 text-destructive text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border border-destructive/20">
                        Critical
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </CardContent>
    </Card>
  );
}

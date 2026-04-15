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
  accentBar: string;
  bgColor: string;
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
        accentBar: "bg-orange-500",
        bgColor: "bg-orange-500/5",
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
        accentBar: "bg-blue-500",
        bgColor: "bg-blue-500/5",
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
        accentBar: "bg-amber-500",
        bgColor: "bg-amber-500/5",
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
        color: "text-rose-500",
        accentBar: "bg-rose-500",
        bgColor: "bg-rose-500/5",
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
        accentBar: "bg-blue-400",
        bgColor: "bg-blue-400/5",
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
          color: isHazardous ? "text-rose-700" : "text-orange-600",
          accentBar: isHazardous ? "bg-rose-700" : "bg-orange-600",
          bgColor: isHazardous ? "bg-rose-700/8" : "bg-orange-600/5",
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
          accentBar: "bg-emerald-500",
          bgColor: "bg-emerald-500/5",
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
          accentBar: "bg-blue-400",
          bgColor: "bg-blue-400/5",
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
          accentBar: "bg-yellow-500",
          bgColor: "bg-yellow-500/5",
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
        accentBar: "bg-amber-500",
        bgColor: "bg-amber-500/5",
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
        accentBar: "bg-indigo-400",
        bgColor: "bg-indigo-400/5",
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
    <Card className="col-span-full border-none shadow-xl bg-background/40 backdrop-blur-2xl overflow-hidden ring-1 ring-white/10 outline-none">
      <CardHeader className="py-3 px-5 flex flex-row items-center gap-3 space-y-0">
        <div className="flex items-center gap-2.5">
          <div className="bg-primary/10 p-2 rounded-xl border border-primary/20">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <CardTitle className="text-sm font-bold tracking-tight uppercase">
            Live Intelligence
          </CardTitle>
        </div>
        <div className="flex items-center h-5 bg-primary/10 px-2 rounded-full border border-primary/20">
          <span className="text-[10px] font-bold text-primary">
            {alerts.length} {alerts.length === 1 ? 'Notice' : 'Notices'}
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-1">
        <div className="flex justify-center w-full">
          <motion.div 
            className="flex flex-wrap gap-5 items-stretch justify-center w-full"
            variants={staggerContainerFast}
            initial="hidden"
            animate="visible"
          >
          <AnimatePresence mode="popLayout">
            {alerts.map((alert) => (
              <motion.div
                key={alert.id}
                variants={slideUp}
                whileHover={{ 
                  y: -5, 
                  scale: 1.02, 
                  boxShadow: "0px 12px 32px rgba(0,0,0,0.15)",
                  borderColor: "rgba(255,255,255,0.2)"
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={`relative group flex flex-col w-[320px] p-4 rounded-2xl border border-white/5 ${alert.bgColor} overflow-hidden cursor-default`}
              >
                {/* Vertical Accent Bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${alert.accentBar} opacity-60`} />

                <div className="flex items-start gap-3 mb-3 pl-1">
                  <div className={`p-2 rounded-xl bg-background shadow-inner ring-1 ring-white/5 ${alert.color}`}>
                    <alert.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`text-[13px] font-bold leading-tight truncate ${alert.color}`}>
                        {alert.title}
                      </h4>
                      {alert.severity === "high" && (
                        <div className="flex h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping shrink-0" />
                      )}
                    </div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-foreground/50 mt-1">
                      {alert.category}
                    </p>
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground/90 font-medium leading-relaxed mb-4 pl-1">
                  {alert.message}
                </p>

                {/* Severity Badge Row */}
                <div className="mt-auto flex items-center justify-between pl-1">
                  <div className={`text-[9px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 rounded-md ${alert.bgColor} border ${alert.borderColor} ${alert.color.replace('text-', 'border-').replace('text-', 'text-')}`}>
                    {alert.severity} Risk
                  </div>
                  {alert.severity === 'high' && (
                    <div className="text-[8px] font-black uppercase text-rose-500 tracking-widest bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                        Urgent
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        </div>
      </CardContent>
    </Card>
  );
}

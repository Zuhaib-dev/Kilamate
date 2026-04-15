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
    const weatherCondition = data.weather?.[0]?.main?.toLowerCase() || "";
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
      const scab = getScabRisk(tempC, data.main.humidity, data.weather?.[0]?.main || "");
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
    const clothing = getClothingAdvice(tempC, data.weather?.[0]?.id || 800);
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
    <Card className="col-span-full border border-white/5 shadow-2xl bg-gradient-to-br from-background/80 to-muted/30 backdrop-blur-3xl overflow-hidden rounded-3xl">
      <CardHeader className="py-4 px-6 flex flex-row flex-wrap items-center justify-between gap-4 border-b border-white/5 bg-background/20">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2.5 rounded-xl border border-primary/20 shadow-inner">
            <Zap className="h-5 w-5 text-primary animate-pulse drop-shadow-md" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold tracking-tight uppercase text-foreground/90">
              Live Intelligence
            </CardTitle>
            <p className="text-[11px] text-muted-foreground font-medium mt-0.5">Smart Alerts & Local Insights</p>
          </div>
        </div>
        <div className="flex items-center h-6 bg-primary/10 px-3 rounded-full border border-primary/20 shadow-sm">
          <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
            {alerts.length} {alerts.length === 1 ? 'Notice' : 'Notices'}
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <motion.div 
          className="flex flex-wrap items-stretch justify-center gap-6 w-full max-w-[1400px] mx-auto"
          variants={staggerContainerFast}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence>
            {alerts.map((alert) => (
              <motion.div
                key={alert.id}
                variants={slideUp}
                whileHover={{ 
                  y: -5, 
                  scale: 1.02, 
                  boxShadow: "0px 20px 40px -10px rgba(0,0,0,0.3)",
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={`relative group flex flex-col w-full sm:w-[340px] flex-shrink-0 p-6 rounded-[1.5rem] border border-white/10 ${alert.bgColor} backdrop-blur-md overflow-hidden transition-all duration-300 shadow-lg isolate`}
              >
                {/* Background Ambient Glows */}
                <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-30 ${alert.accentBar} mix-blend-screen transition-transform duration-700 group-hover:scale-150 group-hover:opacity-50`} />
                <div className={`absolute -bottom-10 -left-10 w-32 h-32 rounded-full blur-3xl opacity-20 ${alert.accentBar} mix-blend-screen transition-transform duration-700 group-hover:scale-150 group-hover:opacity-40`} />

                {/* Left Sleek Boundary Line */}
                <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-md ${alert.accentBar} opacity-70 transition-opacity group-hover:opacity-100`} />

                <div className="flex items-start gap-4 mb-4 pl-2 relative z-10">
                  <div className={`flex items-center justify-center shrink-0 w-11 h-11 rounded-2xl bg-background/80 backdrop-blur-sm shadow-inner ring-1 ring-white/20 ${alert.color} relative overflow-hidden group-hover:ring-white/40 transition-all`}>
                    <div className={`absolute inset-0 opacity-20 ${alert.accentBar}`} />
                    <alert.icon className="h-5 w-5 drop-shadow-md relative z-10" />
                  </div>
                  
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-start justify-between gap-3">
                      <h4 className={`text-[15px] font-bold leading-tight ${alert.color} tracking-tight drop-shadow-sm`}>
                        {alert.title}
                      </h4>
                      {alert.severity === "high" && (
                        <div className="flex relative items-center justify-center h-2 w-2 shrink-0 mt-1">
                          <span className="absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75 animate-ping" />
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500" />
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-foreground/40 mt-1.5 flex items-center gap-1.5">
                      {alert.category}
                    </p>
                  </div>
                </div>

                <p className="text-[13px] text-muted-foreground font-medium leading-relaxed mb-6 pl-2 relative z-10 flex-1">
                  {alert.message}
                </p>

                {/* Severity Badge Row */}
                <div className="mt-auto flex items-center justify-between pl-2 relative z-10">
                  <div className={`inline-flex items-center text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg bg-background/40 backdrop-blur-md border border-white/10 ${alert.color} shadow-sm group-hover:bg-background/60 transition-colors`}>
                    {alert.severity} Risk
                  </div>
                  {alert.severity === 'high' && (
                    <div className="inline-flex items-center justify-center text-[10px] font-black uppercase text-rose-500 tracking-[0.2em] bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20 shadow-sm relative overflow-hidden">
                      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-rose-500/50 to-transparent" />
                      Urgent
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

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  AlertTriangle,
  Wind,
  Droplets,
  Eye,
  Thermometer,
  Skull,
} from "lucide-react";
import type { WeatherData, AirPollutionResponse } from "@/api/types";
import { useNotifications } from "@/hooks/use-notifications";
import { useEffect } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { calculateAQI, getAQIDescription } from "@/lib/aqi-utils";
import { useTranslation } from "react-i18next";
import { usePreferences } from "@/hooks/use-preferences";

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
}

interface WeatherAlert {
  type: "warning" | "info" | "destructive";
  severity: "high" | "medium" | "low";
  icon: React.ElementType;
  title: string;
  message: string;
  color: string;
}

export function WeatherAlerts({ data, airPollution }: WeatherAlertsProps) {
  const { sendNotification, permission } = useNotifications();
  const { t } = useTranslation();
  const { temperatureUnit, windSpeedUnit } = usePreferences();
  const [notificationsEnabled] = useLocalStorage(
    "notifications-enabled",
    false,
  );
  const [sentAlerts, setSentAlerts] = useLocalStorage<SentAlertsMap>(
    SENT_ALERTS_KEY,
    {},
  );

  // Normalise to user-facing units for display + thresholding
  const tempC  = data.main.temp;         // API is always °C
  const windMs = data.wind.speed;         // API is always m/s

  // Temperature for display
  const displayTemp = temperatureUnit === "fahrenheit"
    ? Math.round(tempC * 9 / 5 + 32)
    : Math.round(tempC);
  const tempSymbol = temperatureUnit === "fahrenheit" ? "°F" : "°C";

  // Wind for display
  const displayWind = windSpeedUnit === "mph"
    ? Math.round(windMs * 2.237)
    : windSpeedUnit === "kmh"
      ? Math.round(windMs * 3.6)
      : Math.round(windMs);
  const windSymbol = windSpeedUnit === "mph" ? "mph" : windSpeedUnit === "kmh" ? "km/h" : "m/s";

  // Thresholds in raw metric (API units)
  const HIGH_WIND_MS  = 10;    // ≈ 36 km/h
  const HEAT_C        = 35;
  const FREEZE_C      = 0;

  const alerts: WeatherAlert[] = [];

  // High wind alert
  if (windMs > HIGH_WIND_MS) {
    alerts.push({
      type: "warning",
      severity: "medium",
      icon: Wind,
      title: "High Wind Alert",
      message: `Strong winds at ${displayWind} ${windSymbol}. Exercise caution outdoors.`,
      color: "text-orange-500",
    });
  }

  // High humidity alert
  if (data.main.humidity > 80) {
    alerts.push({
      type: "info",
      severity: "low",
      icon: Droplets,
      title: "High Humidity",
      message: `Humidity is at ${data.main.humidity}%. It may feel muggy outside.`,
      color: "text-blue-500",
    });
  }

  // Low visibility
  const weatherCondition = data.weather[0]?.main.toLowerCase();
  if (weatherCondition === "mist" || weatherCondition === "fog") {
    alerts.push({
      type: "warning",
      severity: "medium",
      icon: Eye,
      title: "Low Visibility",
      message:
        "Foggy conditions detected. Reduce speed and use low-beam headlights.",
      color: "text-orange-500",
    });
  }

  // Extreme temperature
  if (tempC > HEAT_C) {
    alerts.push({
      type: "warning",
      severity: "high",
      icon: Thermometer,
      title: "Extreme Heat",
      message: `Temperature is ${displayTemp}${tempSymbol}. Stay hydrated and avoid prolonged sun exposure.`,
      color: "text-red-500",
    });
  } else if (tempC < FREEZE_C) {
    alerts.push({
      type: "warning",
      severity: "high",
      icon: Thermometer,
      title: "Freezing Temperature",
      message: `Temperature is ${displayTemp}${tempSymbol}. Watch for ice and dress warmly.`,
      color: "text-blue-500",
    });
  }

  // AQI Alerts
  if (airPollution && airPollution.list && airPollution.list.length > 0) {
    const currentAQI = calculateAQI(airPollution.list[0].components);
    const aqiInfo = getAQIDescription(currentAQI);

    if (currentAQI > 300) {
      alerts.push({
        type: "destructive",
        severity: "high",
        icon: Skull,
        title: "Hazardous Air Quality",
        message: `AQI is ${currentAQI}. ${t(aqiInfo.descKey)}`,
        color: "text-red-700",
      });
    } else if (currentAQI > 200) {
      alerts.push({
        type: "destructive",
        severity: "high",
        icon: AlertTriangle,
        title: "Very Unhealthy Air",
        message: `AQI is ${currentAQI}. ${t(aqiInfo.descKey)}`,
        color: "text-red-600",
      });
    } else if (currentAQI > 150) {
      alerts.push({
        type: "destructive",
        severity: "high",
        icon: AlertTriangle,
        title: "Unhealthy Air Quality",
        message: `AQI is ${currentAQI}. ${t(aqiInfo.descKey)}`,
        color: "text-red-500",
      });
    } else if (currentAQI > 100) {
      alerts.push({
        type: "warning",
        severity: "medium",
        icon: AlertTriangle,
        title: "Sensitve Air Quality",
        message: `AQI is ${currentAQI}. Sensitive groups should reduce outdoor exertion.`,
        color: "text-orange-500",
      });
    }
  }

  // Send notifications
  useEffect(() => {
    if (permission === "granted" && notificationsEnabled && alerts.length > 0) {
      let updated = false;
      const newSentAlerts = { ...sentAlerts };

      alerts.forEach((alert) => {
        const alertKey = `${alert.title}-${data.name}`;
        if (!wasSentRecently(newSentAlerts, alertKey)) {
          sendNotification({
            title: `⚠️ ${alert.title}`,
            body: alert.message,
            tag: alertKey,
          });
          newSentAlerts[alertKey] = Date.now();
          updated = true;
        }
      });

      if (updated) {
        setSentAlerts(newSentAlerts);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alerts, permission, sendNotification, data.name, notificationsEnabled]);

  if (alerts.length === 0) {
    return null;
  }

  return (
    <Card className="col-span-full border-l-4 border-l-destructive/50 bg-gradient-to-br from-background to-muted/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <AlertTriangle className="h-6 w-6 text-destructive animate-pulse" />
          <span>Weather & Air Quality Alerts</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.map((alert, index) => (
          <div
            key={index}
            className="flex items-start gap-4 rounded-lg border bg-card/50 p-4 transition-all hover:bg-card/80"
          >
            <div
              className={`rounded-full p-2 bg-background shadow-sm ${alert.color}`}
            >
              <alert.icon className="h-6 w-6" />
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h4 className={`font-semibold text-lg ${alert.color}`}>
                  {alert.title}
                </h4>
                {alert.severity === "high" && (
                  <span className="inline-flex items-center rounded-full border border-destructive/50 bg-destructive/10 px-2.5 py-0.5 text-xs font-semibold text-destructive">
                    High Risk
                  </span>
                )}
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                {alert.message}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

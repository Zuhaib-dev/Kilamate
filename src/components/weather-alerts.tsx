import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { AlertTriangle, Wind, Droplets, Eye, Gauge, Skull } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import type { WeatherData, AirPollutionResponse } from "@/api/types";
import { useNotifications } from "@/hooks/use-notifications";
import { useEffect } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { calculateAQI, getAQIDescription } from "@/lib/aqi-utils";

// How long to suppress the same alert before re-notifying (24 hours)
const ALERT_COOLDOWN_MS = 24 * 60 * 60 * 1000;
const SENT_ALERTS_KEY = "sent-weather-alerts";

// Shape: { [alertKey: string]: number (timestamp last sent) }
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
  icon: React.ReactNode;
  title: string;
  message: string;
}

export function WeatherAlerts({ data, airPollution }: WeatherAlertsProps) {
  const { sendNotification, permission } = useNotifications();
  const [notificationsEnabled] = useLocalStorage(
    "notifications-enabled",
    false,
  );
  // Persist sent alerts across sessions: { alertKey: timestampLastSent }
  const [sentAlerts, setSentAlerts] = useLocalStorage<SentAlertsMap>(
    SENT_ALERTS_KEY,
    {},
  );
  const alerts: WeatherAlert[] = [];

  // High wind alert
  if (data.wind.speed > 10) {
    alerts.push({
      type: "warning",
      icon: <Wind className="h-4 w-4" />,
      title: "High Wind Alert",
      message: `Strong winds detected at ${Math.round(data.wind.speed)} m/s. Exercise caution outdoors.`,
    });
  }

  // High humidity alert
  if (data.main.humidity > 80) {
    alerts.push({
      type: "info",
      icon: <Droplets className="h-4 w-4" />,
      title: "High Humidity",
      message: `Humidity is at ${data.main.humidity}%. It may feel muggy outside.`,
    });
  }

  // Low visibility (if fog or mist)
  const weatherCondition = data.weather[0]?.main.toLowerCase();
  if (weatherCondition === "mist" || weatherCondition === "fog") {
    alerts.push({
      type: "warning",
      icon: <Eye className="h-4 w-4" />,
      title: "Low Visibility",
      message: "Foggy conditions detected. Drive carefully and use headlights.",
    });
  }

  // Extreme temperature
  if (data.main.temp > 35) {
    alerts.push({
      type: "warning",
      icon: <Gauge className="h-4 w-4" />,
      title: "Extreme Heat",
      message: `Temperature is ${Math.round(data.main.temp)}°C. Stay hydrated and avoid prolonged sun exposure.`,
    });
  } else if (data.main.temp < 0) {
    alerts.push({
      type: "warning",
      icon: <Gauge className="h-4 w-4" />,
      title: "Freezing Temperature",
      message: `Temperature is ${Math.round(data.main.temp)}°C. Watch for ice and dress warmly.`,
    });
  }

  // Feels like difference
  const feelsDiff = Math.abs(data.main.temp - data.main.feels_like);
  if (feelsDiff > 5) {
    alerts.push({
      type: "info",
      icon: <AlertTriangle className="h-4 w-4" />,
      title: "Temperature Perception",
      message: `Feels like ${Math.round(data.main.feels_like)}°C, different from actual temperature.`,
    });
  }

  // AQI Alerts
  if (airPollution && airPollution.list && airPollution.list.length > 0) {
    const currentAQI = calculateAQI(airPollution.list[0].components);
    const aqiInfo = getAQIDescription(currentAQI);

    if (currentAQI > 150) {
      alerts.push({
        type: "destructive",
        icon: <Skull className="h-4 w-4" />,
        title: "Hazardous Air Quality",
        message: `AQI is ${currentAQI} (${aqiInfo.label}). ${aqiInfo.desc}`,
      });
    } else if (currentAQI > 100) {
      alerts.push({
        type: "warning",
        icon: <AlertTriangle className="h-4 w-4" />,
        title: "Poor Air Quality",
        message: `AQI is ${currentAQI} (${aqiInfo.label}). Sensitive groups should reduce outdoor exertion.`,
      });
    }
  }

  // Send notifications for new alerts (deduplicated via localStorage, 24h cooldown)
  useEffect(() => {
    if (permission === "granted" && notificationsEnabled && alerts.length > 0) {
      let updated = false;
      const newSentAlerts = { ...sentAlerts };

      alerts.forEach((alert) => {
        const alertKey = `${alert.title}-${data.name}`;

        // Only send if not already sent within the last 24 hours
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
    // sentAlerts excluded from deps to avoid circular re-trigger on its own update
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alerts, permission, sendNotification, data.name, notificationsEnabled]);

  if (alerts.length === 0) {
    return null;
  }

  return (
    <Card className="col-span-full border-l-4 border-l-destructive/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          Weather & Air Quality Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert, index) => (
          <Alert
            key={index}
            variant={
              alert.type === "destructive"
                ? "destructive"
                : alert.type === "warning"
                  ? "destructive"
                  : "default"
            } // Map 'warning' to destructive style for visual emphasis if desired, or keep default
            // Reviewing variant: 'destructive' gives red background/text usually. 'default' is standard.
            // Let's explicitly map:
            // destructive -> destructive (Red)
            // warning -> destructive (Red) or maybe specific warning component if available?
            // default/info -> default (Background color usually)
          >
            {alert.icon}
            <AlertDescription>
              <strong>{alert.title}:</strong> {alert.message}
            </AlertDescription>
          </Alert>
        ))}
      </CardContent>
    </Card>
  );
}

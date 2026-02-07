import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { AlertTriangle, Wind, Droplets, Eye, Gauge, Skull } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import type { WeatherData, AirPollutionResponse } from "@/api/types";
import { useNotifications } from "@/hooks/use-notifications";
import { useEffect, useRef } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { calculateAQI, getAQIDescription } from "@/lib/aqi-utils";

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
    const [notificationsEnabled] = useLocalStorage("notifications-enabled", false);
    const notifiedAlerts = useRef<Set<string>>(new Set());
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

    // Send notifications for new alerts
    useEffect(() => {
        // Only send notifications if permission is granted AND app setting is enabled
        if (permission === "granted" && notificationsEnabled && alerts.length > 0) {
            alerts.forEach((alert) => {
                const alertKey = `${alert.title}-${data.name}`;

                // Only send notification if we haven't sent it before
                if (!notifiedAlerts.current.has(alertKey)) {
                    sendNotification({
                        title: `⚠️ ${alert.title}`,
                        body: alert.message,
                        tag: alertKey,
                    });
                    notifiedAlerts.current.add(alertKey);
                }
            });
        }
    }, [alerts, permission, sendNotification, data.name]);

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
                        variant={alert.type === "destructive" ? "destructive" : alert.type === "warning" ? "destructive" : "default"} // Map 'warning' to destructive style for visual emphasis if desired, or keep default
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

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Droplets, Gauge, Wind, Thermometer, Sunrise, Sunset } from "lucide-react";
import type { WeatherData } from "@/api/types";

interface WeatherStatsProps {
    data: WeatherData;
}

export function WeatherStats({ data }: WeatherStatsProps) {
    const stats = [
        {
            title: "Feels Like",
            value: `${Math.round(data.main.feels_like)}°`,
            icon: Thermometer,
            color: "text-orange-500",
            description: "Perceived temperature",
        },
        {
            title: "Humidity",
            value: `${data.main.humidity}%`,
            icon: Droplets,
            color: "text-blue-500",
            description: "Moisture in air",
        },
        {
            title: "Pressure",
            value: `${data.main.pressure} hPa`,
            icon: Gauge,
            color: "text-purple-500",
            description: "Atmospheric pressure",
        },
        {
            title: "Wind Speed",
            value: `${data.wind.speed} m/s`,
            icon: Wind,
            color: "text-cyan-500",
            description: "Current wind speed",
        },
        {
            title: "Sunrise",
            value: new Date(data.sys.sunrise * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            icon: Sunrise,
            color: "text-yellow-500",
            description: "Sunrise time",
        },
        {
            title: "Sunset",
            value: new Date(data.sys.sunset * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            icon: Sunset,
            color: "text-orange-600",
            description: "Sunset time",
        },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Weather Statistics</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {stats.map((stat) => (
                        <div
                            key={stat.title}
                            className="group relative overflow-hidden rounded-lg border p-4 transition-all hover:shadow-md hover:scale-105"
                        >
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {stat.title}
                                    </p>
                                    <p className="text-2xl font-bold">{stat.value}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {stat.description}
                                    </p>
                                </div>
                                <stat.icon className={`h-8 w-8 ${stat.color} opacity-80`} />
                            </div>
                            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-transparent to-muted opacity-0 transition-opacity group-hover:opacity-100" />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

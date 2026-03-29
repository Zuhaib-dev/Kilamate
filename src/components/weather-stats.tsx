import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Droplets, Gauge, Wind, Thermometer, Sunrise, Sunset } from "lucide-react";
import type { WeatherData } from "@/api/types";
import { useTranslation } from "react-i18next";

interface WeatherStatsProps {
    data: WeatherData;
}

export function WeatherStats({ data }: WeatherStatsProps) {
    const { t } = useTranslation();
    const stats: {
        title: string;
        primary: string;
        unit?: string;
        icon: typeof Thermometer;
        color: string;
        iconBg: string;
    }[] = [
        {
            title: t('weather.feelsLike'),
            primary: `${Math.round(data.main.feels_like)}`,
            unit: "°",
            icon: Thermometer,
            color: "text-orange-500",
            iconBg: "bg-orange-500/10",
        },
        {
            title: t('weather.humidity'),
            primary: `${data.main.humidity}`,
            unit: "%",
            icon: Droplets,
            color: "text-blue-500",
            iconBg: "bg-blue-500/10",
        },
        {
            title: t('weather.pressure'),
            primary: `${data.main.pressure}`,
            unit: " hPa",
            icon: Gauge,
            color: "text-purple-500",
            iconBg: "bg-purple-500/10",
        },
        {
            title: t('weather.windSpeed'),
            primary: `${data.wind.speed}`,
            unit: " m/s",
            icon: Wind,
            color: "text-cyan-500",
            iconBg: "bg-cyan-500/10",
        },
        {
            title: t('weather.sunrise'),
            primary: new Date(data.sys.sunrise * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            icon: Sunrise,
            color: "text-yellow-500",
            iconBg: "bg-yellow-500/10",
        },
        {
            title: t('weather.sunset'),
            primary: new Date(data.sys.sunset * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            icon: Sunset,
            color: "text-orange-600",
            iconBg: "bg-orange-600/10",
        },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('weather.details')}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {stats.map((stat) => (
                        <div
                            key={stat.title}
                            className="group relative overflow-hidden rounded-lg border p-4 transition-all hover:shadow-md hover:scale-[1.03]"
                        >
                            <div className="flex items-start justify-between">
                                <div className="space-y-1 min-w-0">
                                    <p className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
                                        {stat.title}
                                    </p>
                                    <p className="text-2xl font-bold leading-none tracking-tight">
                                        {stat.primary}
                                        {stat.unit && (
                                            <span className="text-base font-medium text-muted-foreground ml-0.5">
                                                {stat.unit}
                                            </span>
                                        )}
                                    </p>
                                </div>
                                <div className={`flex items-center justify-center rounded-lg p-2 ${stat.iconBg}`}>
                                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                                </div>
                            </div>
                            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-transparent to-muted opacity-0 transition-opacity group-hover:opacity-100" />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

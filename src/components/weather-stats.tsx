import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Droplets, Gauge, Wind, Thermometer, Sunrise, Sunset } from "lucide-react";
import type { WeatherData } from "@/api/types";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { staggerContainer, slideUp } from "@/lib/animations";

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
        {
            title: t('weather.windGust'),
            primary: `${data.wind.gust ?? data.wind.speed}`,
            unit: " m/s",
            icon: Wind,
            color: "text-blue-400",
            iconBg: "bg-blue-400/10",
        },
    ];

    // Helper to get cardinal direction from degrees
    const getWindDirection = (deg: number) => {
        const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
        return directions[Math.round(deg / 45) % 8];
    };

    // Filter out items that might not have data (though OWM usually provides these)
    const validStats = stats.filter(s => s.primary !== "undefined");

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('weather.details')}</CardTitle>
            </CardHeader>
            <CardContent>
                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-60px" }}
                >
                    {validStats.map((stat) => (
                        <motion.div
                            key={stat.title}
                            variants={slideUp}
                            className="group relative overflow-hidden rounded-xl border p-4"
                            whileHover={{
                                scale: 1.03,
                                y: -3,
                                boxShadow: "0px 10px 30px rgba(0,0,0,0.12)",
                            }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ type: "spring", stiffness: 400, damping: 28 }}
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div className="space-y-1.5 min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5 overflow-hidden">
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-80 truncate">
                                            {stat.title}
                                        </p>
                                        {stat.title === t('weather.windSpeed') && (
                                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-primary/10 text-primary uppercase tracking-tighter shrink-0">
                                                {getWindDirection(data.wind.deg || 0)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-baseline gap-1 overflow-hidden">
                                        <motion.span
                                            className="text-xl font-black leading-none tracking-tight truncate"
                                            initial={{ opacity: 0, y: 8 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 25 }}
                                        >
                                            {stat.primary}
                                        </motion.span>
                                        {stat.unit && (
                                            <span className="text-[10px] font-bold text-muted-foreground leading-none shrink-0">
                                                {stat.unit}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <motion.div
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl p-2 ${stat.iconBg}`}
                                    whileHover={{ scale: 1.2, rotate: 8 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                >
                                    {stat.title === t('weather.windSpeed') ? (
                                        <div
                                            className="relative flex items-center justify-center w-full h-full"
                                            style={{ transform: `rotate(${data.wind.deg || 0}deg)` }}
                                        >
                                            <stat.icon className={`h-5 w-5 ${stat.color} opacity-80`} />
                                            <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-0.5 h-2.5 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.6)]" />
                                        </div>
                                    ) : (
                                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                                    )}
                                </motion.div>
                            </div>
                            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-transparent to-muted opacity-0 transition-opacity group-hover:opacity-100" />
                        </motion.div>
                    ))}
                </motion.div>
            </CardContent>
        </Card>
    );
}

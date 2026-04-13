import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { 
  Sprout, 
  Droplets,
  Wind,
  ShieldCheck,
  ShieldAlert,
  Leaf,
  Bug,
  AlertTriangle
} from "lucide-react";
import type { WeatherData, ForecastData } from "@/api/types";
import { usePreferences } from "@/hooks/use-preferences";
import { formatWindSpeed } from "@/lib/units";
import { useTranslation } from "react-i18next";

interface AgricultureAdvisorProps {
  weather: WeatherData;
  forecast?: ForecastData | null;
}

export function AgricultureAdvisor({ weather, forecast }: AgricultureAdvisorProps) {
  const { windSpeedUnit } = usePreferences();
  const { t } = useTranslation();
  
  const isKashmir = useMemo(() => {
    // Check if the current location is in Kashmir (rough check by name or coordinates)
    const name = weather.name.toLowerCase();
    const kashmirCities = ["srinagar", "baramulla", "anantnag", "pulwama", "kupwara", "shopian", "bandipora", "ganderbal", "budgam", "kulgam"];
    return kashmirCities.some(city => name.includes(city)) || 
           (weather.coord.lat > 32 && weather.coord.lat < 35 && weather.coord.lon > 73 && weather.coord.lon < 76);
  }, [weather]);

  const insights = useMemo(() => {
    const temp = weather.main.temp;
    const humidity = weather.main.humidity;
    const windSpeed = weather.wind.speed * 3.6; // Convert m/s to km/h
    
    let isRaining = false;
    let rainExpected = false;
    
    if (weather.weather[0].main.toLowerCase() === "rain" || weather.weather[0].main.toLowerCase() === "drizzle") {
      isRaining = true;
    }

    if (forecast?.list?.length) {
      // Check next 24 hours (8 periods of 3h)
      const next24h = forecast.list.slice(0, 8);
      rainExpected = next24h.some(f => 
        f.weather[0].main.toLowerCase() === "rain" || 
        f.weather[0].main.toLowerCase() === "drizzle" ||
        (f.pop && f.pop > 0.4)
      );
    }

    // 1. Spraying Conditions
    let sprayStatus = t("agricultureInsights.spray.good");
    let sprayColor = "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    let sprayIcon = ShieldCheck;
    let sprayMessage = t("agricultureInsights.spray.msgClear");

    if (isRaining) {
      sprayStatus = t("agricultureInsights.spray.bad");
      sprayColor = "text-red-500 bg-red-500/10 border-red-500/20";
      sprayIcon = ShieldAlert;
      sprayMessage = t("agricultureInsights.spray.msgRain");
    } else if (rainExpected) {
      sprayStatus = t("agricultureInsights.spray.suboptimal");
      sprayColor = "text-orange-500 bg-orange-500/10 border-orange-500/20";
      sprayIcon = Droplets;
      sprayMessage = t("agricultureInsights.spray.msgExpected");
    } else if (windSpeed > 15) {
      sprayStatus = t("agricultureInsights.spray.windy");
      sprayColor = "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      sprayIcon = Wind;
      sprayMessage = t("agricultureInsights.spray.msgWindy", { speed: formatWindSpeed(2.78, windSpeedUnit) });
    }

    // 2. Crop Specific Advice (Tailored for Kashmir)
    let appleAdvice = t("agricultureInsights.crops.appleDefault");
    let apricotAdvice = t("agricultureInsights.crops.apricotDefault");

    if (temp > 25 && humidity > 70) {
      appleAdvice = t("agricultureInsights.crops.appleHumid");
      apricotAdvice = t("agricultureInsights.crops.apricotHumid");
    } else if (temp < 10) {
      appleAdvice = t("agricultureInsights.crops.appleCool");
      apricotAdvice = t("agricultureInsights.crops.apricotCold");
    } else if (windSpeed > 20) {
      appleAdvice = t("agricultureInsights.crops.appleWindy");
    } else if (temp >= 15 && temp <= 25 && !isRaining) {
      appleAdvice = t("agricultureInsights.crops.appleOptimal");
      apricotAdvice = t("agricultureInsights.crops.apricotOptimal");
    }

    return { 
      spray: { status: sprayStatus, color: sprayColor, icon: sprayIcon, message: sprayMessage, originalStatus: isRaining ? "Bad" : rainExpected ? "Suboptimal" : windSpeed > 15 ? "Windy" : "Good" },
      crops: { apple: appleAdvice, apricot: apricotAdvice }
    };
  }, [weather, forecast, windSpeedUnit, t]);

  return (
    <Card className="h-full overflow-hidden relative">
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
      <CardHeader className="pb-3 bg-emerald-500/5 border-b border-emerald-500/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDEiLz4KPHBhdGggZD0iTTAgMGg4djhIMHoiIGZpbGw9Im5vbmUiLz4KPC9zdmc+')] opacity-20" />
        <CardTitle className="flex items-center gap-2 text-base font-bold relative z-10 text-emerald-600 dark:text-emerald-400">
          <Sprout className="h-4 w-4" />
          {isKashmir ? t("agricultureAdvisor.titleKashmir") : t("agricultureAdvisor.titleGeneric")}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 space-y-6">
        {/* Spraying Conditions Module */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Bug className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{t("agricultureAdvisor.spraying")}</h3>
          </div>
          
          <div className={`rounded-xl border p-4 ${insights.spray.color} shadow-sm transition-all duration-300`}>
            <div className="flex items-start gap-4">
              <div className="mt-0.5 bg-background/50 p-2 rounded-full backdrop-blur-sm">
                <insights.spray.icon className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-[15px] leading-none">
                  {insights.spray.message.split('.')[0]}.
                </p>
                <p className="text-sm opacity-90 leading-relaxed font-medium">
                  {insights.spray.message.substring(insights.spray.message.indexOf('.') + 1).trim()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Crop Specific Advice Module */}
        <div className="space-y-4">
           <div className="flex items-center gap-2">
            <Leaf className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{t("agricultureAdvisor.cropAdvice")}</h3>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {/* Apple Card */}
            <div className="bg-muted/30 border rounded-xl p-4 transition-colors hover:bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-red-400" />
                <span className="font-semibold text-sm">{t("agricultureInsights.crops.appleTitle")}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {insights.crops.apple}
              </p>
              {isKashmir && insights.spray.originalStatus === "Good" && (
                <div className="mt-3 text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-1.5 rounded-md inline-flex items-center gap-1.5 font-medium border border-emerald-500/20">
                  <ShieldCheck className="h-3 w-3" />
                  {t("agricultureInsights.badges.optimalSpray")}
                </div>
              )}
              {isKashmir && insights.spray.originalStatus !== "Good" && (
                <div className="mt-3 text-xs bg-orange-500/10 text-orange-600 dark:text-orange-400 px-2 py-1.5 rounded-md inline-flex items-center gap-1.5 font-medium border border-orange-500/20">
                  <AlertTriangle className="h-3 w-3" />
                  {t("agricultureInsights.badges.delaySpray")}
                </div>
              )}
            </div>

            {/* Apricot Card */}
            <div className="bg-muted/30 border rounded-xl p-4 transition-colors hover:bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-orange-400" />
                <span className="font-semibold text-sm">{t("agricultureInsights.crops.apricotTitle")}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {insights.crops.apricot}
              </p>
              {isKashmir && forecast?.list && forecast.list.slice(0, 16).some(f => f.main.temp < 3) && (
                <div className="mt-3 text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-1.5 rounded-md inline-flex items-center gap-1.5 font-medium border border-blue-500/20">
                  <AlertTriangle className="h-3 w-3" />
                  {t("agricultureInsights.badges.frostWarning")}
                </div>
              )}
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}

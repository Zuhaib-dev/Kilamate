import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ThermometerSun, Droplets } from "lucide-react";
import { WeatherData } from "@/api/types";
import { memo } from "react";
import { Skeleton } from "./ui/skeleton";
import { usePreferences } from "@/hooks/use-preferences";
import { formatTemperature } from "@/lib/units";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

interface ComfortLevelProps {
  data: WeatherData;
  isLoading?: boolean;
}

const getComfortStatus = (dewPoint: number, t: (key: string) => string) => {
  if (dewPoint < 10) return { label: t("comfortLevel.labels.dry"), color: "text-sky-400", bg: "bg-sky-400/10", percent: 20 };
  if (dewPoint < 15) return { label: t("comfortLevel.labels.veryPleasant"), color: "text-emerald-400", bg: "bg-emerald-400/10", percent: 45 };
  if (dewPoint < 18) return { label: t("comfortLevel.labels.comfortable"), color: "text-emerald-500", bg: "bg-emerald-500/10", percent: 60 };
  if (dewPoint < 20) return { label: t("comfortLevel.labels.humid"), color: "text-amber-400", bg: "bg-amber-400/10", percent: 75 };
  if (dewPoint < 22) return { label: t("comfortLevel.labels.sticky"), color: "text-orange-500", bg: "bg-orange-500/10", percent: 85 };
  return { label: t("comfortLevel.labels.oppressive"), color: "text-destructive", bg: "bg-destructive/10", percent: 100 };
};

export const ComfortLevel = memo(({ data, isLoading }: ComfortLevelProps) => {
  const { t } = useTranslation();
  if (isLoading) {
    return <Skeleton className="h-full w-full rounded-2xl" />;
  }

  const { temperatureUnit } = usePreferences();

  const { temp, humidity } = data.main;
  
  // Dew point approximation: Td = T - ((100 - RH)/5)
  const dewPoint = Math.round(temp - ((100 - humidity) / 5));
  const { label, color, bg, percent } = getComfortStatus(dewPoint, t);

  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className="h-full"
    >
      <Card className="relative overflow-hidden rounded-2xl border-none bg-card/20 backdrop-blur-md border-white/5 h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <div className="flex items-center gap-2">
            <motion.div
              className="bg-primary/10 p-2 rounded-lg"
              animate={{ rotate: [0, 8, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <ThermometerSun className="h-5 w-5 text-primary" />
            </motion.div>
            <CardTitle className="text-sm font-bold tracking-tight uppercase">{t("comfortLevel.title")}</CardTitle>
          </div>
          <motion.div
            className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${bg} ${color}`}
            initial={{ opacity: 0, scale: 0.7 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 400, damping: 22, delay: 0.2 }}
          >
            {label}
          </motion.div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <motion.p
                  className="text-3xl font-black tracking-tighter leading-none italic"
                  initial={{ opacity: 0, scale: 0.6, y: 12 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                >
                  {formatTemperature(dewPoint, temperatureUnit)}
                </motion.p>
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.1em]">
                  {t("comfortLevel.dewPoint")}
                </p>
              </div>
              <motion.div
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-background/40"
                whileHover={{ scale: 1.08 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
              >
                <Droplets className="h-4 w-4 text-sky-400" />
                <span className="text-xs font-black italic">{humidity}%</span>
              </motion.div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="relative h-2 w-full rounded-full bg-muted/30 overflow-hidden">
                {/* Animated gradient gauge */}
                <motion.div
                  className="absolute top-0 left-0 h-full rounded-full opacity-80"
                  style={{ background: "linear-gradient(to right, #38bdf8, #10b981, #f59e0b, #ef4444)" }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${percent}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                />
                {/* Current position indicator */}
                <motion.div
                  className="absolute top-0 h-full w-1.5 bg-white shadow-[0_0_10px_white] z-10"
                  initial={{ left: "0%" }}
                  whileInView={{ left: `calc(${percent}% - 4px)` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                />
              </div>
              <div className="flex justify-between text-[8px] text-muted-foreground font-black uppercase tracking-widest opacity-60">
                <span>{t("comfortLevel.dry")}</span>
                <span>{t("comfortLevel.neutral")}</span>
                <span>{t("comfortLevel.moist")}</span>
              </div>
            </div>
          </div>

          {/* Subtle background icon */}
          <div className="absolute -bottom-4 -right-4 h-20 w-20 text-primary/5 -rotate-12">
            <ThermometerSun className="h-full w-full" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

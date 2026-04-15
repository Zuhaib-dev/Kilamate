// src/components/weather/favorite-cities.tsx
import { useNavigate } from "react-router-dom";
import { useWeatherQuery, useAirPollutionQuery } from "@/hooks/use-weather";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { X, Loader2, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/hooks/use-favorite";
import { calculateAQI, getAQIDescription } from "@/lib/aqi-utils";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { usePreferences } from "@/hooks/use-preferences";
import { formatTemperature } from "@/lib/units";
import { motion, AnimatePresence } from "framer-motion";
import { staggerContainerFast } from "@/lib/animations";


interface FavoriteCityTabletProps {
  id: string;
  name: string;
  lat: number;
  lon: number;
  onRemove: (id: string) => void;
}

function FavoriteCityTablet({
  id,
  name,
  lat,
  lon,
  onRemove,
}: FavoriteCityTabletProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { temperatureUnit } = usePreferences();
  const { data: weather, isLoading } = useWeatherQuery({ lat, lon });
  const { data: airPollution } = useAirPollutionQuery({ lat, lon });

  const handleClick = () => {
    navigate(`/city/${name}?lat=${lat}&lon=${lon}`);
  };

  const aqi = airPollution?.list?.[0] ? calculateAQI(airPollution.list[0].components) : null;
  const aqiInfo = aqi !== null ? getAQIDescription(aqi) : null;


  return (
    <motion.div
      onClick={handleClick}
      className="relative flex min-w-[250px] cursor-pointer items-center gap-3 rounded-lg border bg-card p-4 pr-8 shadow-sm"
      role="button"
      tabIndex={0}
      whileHover={{
        scale: 1.03,
        y: -4,
        boxShadow: "0px 12px 32px rgba(0,0,0,0.15)",
        borderColor: "hsl(var(--primary) / 0.4)",
      }}
      whileTap={{ scale: 0.97, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
    >
      <motion.div
        className="absolute right-1 top-1"
        whileHover={{ rotate: 90, scale: 1.2 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 rounded-full p-0 hover:text-destructive-foreground"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(id);
            toast.error(`Removed ${name} from Favorites`);
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </motion.div>

      {isLoading ? (
        <div className="flex h-8 items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="h-4 w-4" />
          </motion.div>
        </div>
      ) : weather ? (
        <>
          <div className="flex flex-col gap-1 flex-1">
            <div className="flex items-center gap-2">
              <motion.img
                src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}.png`}
                alt={weather.weather[0].description}
                className="h-10 w-10 flex-shrink-0"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="min-w-0">
                <p className="font-bold truncate text-sm leading-tight">{name}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                  {weather.sys.country}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 mt-1">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                {weather.weather[0].main}
              </span>
              {aqiInfo && (
                <div className="flex items-center gap-1">
                  <div className={`h-2 w-2 rounded-full ${aqiInfo.bg}`} title={`AQI: ${aqi}`} />
                  <span className="text-[10px] text-muted-foreground font-medium">{aqi}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-0.5">
            <p className="text-2xl font-black tabular-nums">
              {formatTemperature(weather.main.temp, temperatureUnit)}
            </p>
            <div className="flex items-center gap-2 text-[10px] font-bold">
              <span className="flex items-center text-blue-500">
                <ArrowDown className="h-2.5 w-2.5 mr-0.5" />
                {formatTemperature(weather.main.temp_min, temperatureUnit)}
              </span>
              <span className="flex items-center text-orange-500">
                <ArrowUp className="h-2.5 w-2.5 mr-0.5" />
                {formatTemperature(weather.main.temp_max, temperatureUnit)}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground font-medium">
              {t("weather.feelsLike")}: {formatTemperature(weather.main.feels_like, temperatureUnit)}
            </p>
          </div>
        </>
      ) : null}
    </motion.div>
  );
}

export function FavoriteCities() {
  const { favorites, removeFavorite } = useFavorites();
  const { t } = useTranslation();

  if (!favorites.length) {
    return null;
  }

  const childVariant = {
    hidden: { opacity: 0, x: -10, scale: 0.95 },
    visible: { opacity: 1, x: 0, scale: 1, transition: { type: "spring", stiffness: 350, damping: 28 } },
  } as const;

  return (
    <>
      <motion.h1
        className="text-xl font-bold tracking-tight mb-4"
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
      >
        {t('search.favorites')}
      </motion.h1>

      <ScrollArea className="w-full pb-4">
        <motion.div
          className="flex gap-4"
          variants={staggerContainerFast}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence>
            {favorites.map((city) => (
              <motion.div key={city.id} variants={childVariant} layout exit={{ opacity: 0, scale: 0.8, x: -20 }}>
                <FavoriteCityTablet
                  {...city}
                  onRemove={() => removeFavorite.mutate(city.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        <ScrollBar orientation="horizontal" className="mt-2" />
      </ScrollArea>
    </>
  );
}

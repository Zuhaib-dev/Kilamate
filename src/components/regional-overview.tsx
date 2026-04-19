import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useWeatherQuery } from "@/hooks/use-weather";
import { MapPin, Wind, Cloud } from "lucide-react";
import { formatTemperature, formatWindSpeed } from "@/lib/units";
import { usePreferences } from "@/hooks/use-preferences";
import { Skeleton } from "./ui/skeleton";
import { Link } from "react-router-dom";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import { STATE_CITIES, DEFAULT_STATE } from "@/lib/regional-data";



const CityWeatherCard = memo(({ cityName, lat, lon }: { cityName: string; lat: number; lon: number }) => {
  const { data, isLoading } = useWeatherQuery({ lat, lon });
  const { temperatureUnit, windSpeedUnit } = usePreferences();

  if (isLoading) {
    return <Skeleton className="h-24 w-full rounded-xl" />;
  }

  if (!data) return null;

  const temp = Math.round(data.main.temp);
  const condition = data.weather[0].main;

  return (
    <Link to={`/city/${cityName}?lat=${lat}&lon=${lon}`} className="block w-full min-w-0">
      <div className="group relative flex flex-col justify-between p-5 rounded-2xl border bg-card/40 backdrop-blur-sm border-white/5 hover:bg-muted/30 transition-all hover:shadow-lg h-full min-w-0">
        <div className="flex items-center gap-3 min-w-0 mb-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
            <MapPin className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h4 className="font-black text-sm uppercase tracking-tight">{cityName}</h4>
            <p className="text-[9px] text-muted-foreground uppercase font-black tracking-[0.2em]">{condition}</p>
          </div>
        </div>
        
        <div className="flex items-end justify-between mt-auto">
          <p className="text-2xl font-black tracking-tighter leading-none text-primary/90">
            {formatTemperature(temp, temperatureUnit)}
          </p>
          <div className="flex flex-col items-end gap-1 text-[10px] text-muted-foreground font-black uppercase tracking-tighter">
            <div className="flex items-center gap-1">
              <Wind className="h-3 w-3 opacity-60" />
              <span>{formatWindSpeed(data.wind.speed, windSpeedUnit)}</span>
            </div>
          </div>
        </div>
        
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-primary/10 p-1 rounded-full">
                <Cloud className="h-3 w-3 text-primary" />
            </div>
        </div>
      </div>
    </Link>
  );
});

export function RegionalOverview({ state }: { state?: string }) {
  const { t } = useTranslation();
  
  const currentState = (state && STATE_CITIES[state]) ? state : DEFAULT_STATE;
  const cities = STATE_CITIES[currentState];

  return (
    <Card className="border-none shadow-none bg-transparent mb-8">
      <CardHeader className="px-0 pt-0 pb-6">
        <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-lg">
                <Cloud className="h-5 w-5 text-primary" />
            </div>
            <div>
                <CardTitle className="text-xl font-black tracking-tight uppercase leading-none">
                  {currentState === DEFAULT_STATE ? t("regionalOverview.title") : `${currentState} Region Overview`}
                </CardTitle>
                <p className="text-xs text-muted-foreground font-medium mt-1">
                  {currentState === DEFAULT_STATE ? t("regionalOverview.desc") : `Weather updates for key districts in ${currentState}`}
                </p>
            </div>
        </div>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cities.map((city) => (
            <CityWeatherCard
              key={city.name}
              cityName={city.name}
              lat={city.lat}
              lon={city.lon}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

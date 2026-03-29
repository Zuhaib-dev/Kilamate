import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useWeatherQuery } from "@/hooks/use-weather";
import { MapPin, Wind, Cloud } from "lucide-react";
import { formatTemperature } from "@/lib/units";
import { usePreferences } from "@/hooks/use-preferences";
import { Skeleton } from "./ui/skeleton";
import { Link } from "react-router-dom";
import { memo } from "react";

const REGIONAL_CITIES = [
  { name: "Srinagar", lat: 34.0837, lon: 74.7973 },
  { name: "Jammu", lat: 32.7186, lon: 74.8581 },
  { name: "Gulmarg", lat: 34.0484, lon: 74.3805 },
  { name: "Leh", lat: 34.1526, lon: 77.5771 },
  { name: "Pahalgam", lat: 34.0161, lon: 75.3150 },
];

const CityWeatherCard = memo(({ cityName, lat, lon }: { cityName: string; lat: number; lon: number }) => {
  const { data, isLoading } = useWeatherQuery({ lat, lon });
  const { temperatureUnit } = usePreferences();

  if (isLoading) {
    return <Skeleton className="h-24 w-full rounded-xl" />;
  }

  if (!data) return null;

  const temp = Math.round(data.main.temp);
  const condition = data.weather[0].main;

  return (
    <Link to={`/city/${cityName}?lat=${lat}&lon=${lon}`}>
      <div className="group relative flex items-center justify-between p-3.5 rounded-xl border bg-card/50 hover:bg-muted/50 transition-all hover:shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <MapPin className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-sm truncate">{cityName}</h4>
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{condition}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-black tracking-tight">
            {formatTemperature(temp, temperatureUnit)}
          </p>
          <div className="flex items-center justify-end gap-1 text-[10px] text-muted-foreground font-bold">
            <Wind className="h-3 w-3" />
            <span>{Math.round(data.wind.speed)}m/s</span>
          </div>
        </div>
      </div>
    </Link>
  );
});

export function RegionalOverview() {
  return (
    <Card className="border-none shadow-none bg-transparent mb-6">
      <CardHeader className="px-0 pt-0 pb-4">
        <div className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-black tracking-tight uppercase">J&K Regional Overview</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground">Quick glance at weather across major districts</p>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {REGIONAL_CITIES.map((city) => (
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

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ThermometerSun } from "lucide-react";
import { useAirPollutionQuery } from "@/hooks/use-weather";

interface AirPollutionProps {
  data: ReturnType<typeof useAirPollutionQuery>["data"];
}

export function AirPollution({ data }: AirPollutionProps) {
  if (!data || !data.list || data.list.length === 0) return null;

  const current = data.list[0];
  const aqi = current.main.aqi;

  // AQI Level configuration
  const getAQIDescription = (aqi: number) => {
    switch (aqi) {
      case 1:
        return { label: "Good", color: "text-green-500", bg: "bg-green-500", range: "0-50" };
      case 2:
        return { label: "Fair", color: "text-yellow-500", bg: "bg-yellow-500", range: "51-100" };
      case 3:
        return { label: "Moderate", color: "text-orange-500", bg: "bg-orange-500", range: "101-150" };
      case 4:
        return { label: "Poor", color: "text-red-500", bg: "bg-red-500", range: "151-200" };
      case 5:
        return { label: "Very Poor", color: "text-purple-500", bg: "bg-purple-500", range: "201-300" };
      default:
        return { label: "Unknown", color: "text-muted-foreground", bg: "bg-muted", range: "" };
    }
  };

  const level = getAQIDescription(aqi);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ThermometerSun className="h-5 w-5" />
          Air Quality Index
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* AQI Indicator */}
        <div className="flex items-center justify-between">
            <div className="space-y-1">
                <span className="text-4xl font-bold">{aqi}</span>
                <p className={`text-sm font-medium ${level.color}`}>
                    {level.label}
                </p>
            </div>
        </div>

        {/* Custom Progress Bar */}
        <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
            <div 
                className={`h-full transition-all duration-500 ${level.bg}`} 
                style={{ width: `${(aqi / 5) * 100}%` }}
            />
        </div>

        {/* Pollutants Grid */}
        <div className="grid grid-cols-4 gap-4 pt-4 border-t">
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs text-muted-foreground uppercase">PM2.5</span>
            <span className="font-mono text-sm">{current.components.pm2_5.toFixed(1)}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs text-muted-foreground uppercase">PM10</span>
            <span className="font-mono text-sm">{current.components.pm10.toFixed(1)}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs text-muted-foreground uppercase">SO2</span>
            <span className="font-mono text-sm">{current.components.so2.toFixed(1)}</span>
          </div>
           <div className="flex flex-col items-center gap-1">
            <span className="text-xs text-muted-foreground uppercase">NO2</span>
            <span className="font-mono text-sm">{current.components.no2.toFixed(1)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
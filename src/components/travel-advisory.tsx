import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useWeatherQuery } from "@/hooks/use-weather";
import { Mountain, Wind, Car, AlertTriangle, CheckCircle2, CloudRain } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { usePreferences } from "@/hooks/use-preferences";
import { formatWindSpeed } from "@/lib/units";

const TRAVEL_POINTS = [
  { 
    id: "nh44", 
    name: "NH44 Highway (Ramban)", 
    lat: 33.2384, 
    lon: 75.2533, 
    icon: Car, 
    type: "Road Status" 
  },
  { 
    id: "gondola", 
    name: "Gulmarg Gondola", 
    lat: 34.0484, 
    lon: 74.3805, 
    icon: Wind, 
    type: "Cable Car" 
  },
  { 
    id: "pahalgam", 
    name: "Pahalgam/Aru Treks", 
    lat: 34.0161, 
    lon: 75.3150, 
    icon: Mountain, 
    type: "Trekking" 
  },
  { 
    id: "sonamarg", 
    name: "Sonamarg Pass", 
    lat: 34.2982, 
    lon: 75.2952, 
    icon: CloudRain, 
    type: "Pass Status" 
  },
];

const AdvisoryCard = memo(({ point }: { point: typeof TRAVEL_POINTS[0] }) => {
  const { data, isLoading } = useWeatherQuery({ lat: point.lat, lon: point.lon });
  const { windSpeedUnit } = usePreferences();

  if (isLoading) {
    return <Skeleton className="h-40 w-full rounded-2xl" />;
  }

  if (!data) return null;

  const windSpeed = data.wind.speed * 3.6; // km/h
  const rain = data.rain?.["1h"] || 0;
  const snow = data.snow?.["1h"] || 0;
  const clouds = data.clouds.all;

  let status = "FEASIBLE";
  let message = "Conditions are clear and stable.";
  let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
  let Icon = CheckCircle2;

  // Logic for NH44 Ramban (Landslide risk)
  if (point.id === "nh44") {
    if (rain > 3 || snow > 1.5) {
      status = "NOT RECOMMENDED";
      message = "High risk of landslides/shooting stones.";
      variant = "destructive";
      Icon = AlertTriangle;
    } else if (rain > 1 || snow > 0.5) {
      status = "CAUTION";
      message = "Monsoon/Snow conditions. Drive slowly.";
      variant = "secondary";
      Icon = AlertTriangle;
    }
  }

  // Logic for Gulmarg Gondola (Wind sensitivity)
  if (point.id === "gondola") {
    if (windSpeed > 35) {
      status = "SUSPENDED";
      message = "High wind speeds. Cable car likely closed.";
      variant = "destructive";
      Icon = AlertTriangle;
    } else if (windSpeed > 25) {
      status = "CAUTION";
      message = "Turbulent winds. Operations may be intermittent.";
      variant = "secondary";
      Icon = Wind;
    }
  }

  // Logic for Pahalgam Treks (Visibility and Rain)
  if (point.id === "pahalgam") {
    if (rain > 5 || clouds > 95) {
      status = "UNSAFE";
      message = "Heavy rain/Fog. High risk for high-altitude treks.";
      variant = "destructive";
      Icon = AlertTriangle;
    } else if (rain > 1 || clouds > 80) {
      status = "CAUTION";
      message = "Slippery terrain. Moderate rain forecast.";
      variant = "secondary";
      Icon = CloudRain;
    }
  }

  // Logic for Sonamarg
  if (point.id === "sonamarg") {
    if (snow > 2 || rain > 8) {
      status = "CLOSED";
      message = "Heavy snowfall or precipitation likely blocked the pass.";
      variant = "destructive";
      Icon = AlertTriangle;
    } else if (snow > 0.5) {
      status = "CAUTION";
      message = "Accumulating snow. Check with local authorities.";
      variant = "secondary";
      Icon = CloudRain;
    }
  }

  return (
    <div className="relative overflow-hidden group rounded-2xl border bg-card/30 backdrop-blur-md p-5 hover:bg-card/50 transition-all border-white/5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
            <point.icon className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm tracking-tight">{point.name}</h4>
            <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
              {point.type}
            </p>
          </div>
        </div>
        <Badge variant={variant === "destructive" ? "destructive" : "outline"} className={`text-[9px] font-black tracking-tighter uppercase px-2 py-0 h-5 ${variant === "secondary" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : ""}`}>
          {status}
        </Badge>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background/40">
          <Icon className={`h-4 w-4 shrink-0 ${variant === "destructive" ? "text-destructive" : variant === "secondary" ? "text-amber-500" : "text-emerald-500"}`} />
          <p className="text-xs font-medium leading-tight">{message}</p>
        </div>

        <div className="flex gap-4 px-1">
          <div className="flex flex-col gap-0.5">
             <span className="text-[8px] text-muted-foreground font-bold uppercase">Wind</span>
             <span className="text-xs font-black">{formatWindSpeed(data.wind.speed, windSpeedUnit)}</span>
          </div>
          <div className="flex flex-col gap-0.5">
             <span className="text-[8px] text-muted-foreground font-bold uppercase">Precip</span>
             <span className="text-xs font-black">{Math.round(rain + snow)} mm</span>
          </div>
        </div>
      </div>
      
      {/* Visual background element */}
      <div className="absolute -bottom-6 -right-6 h-24 w-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
    </div>
  );
});

export function TravelAdvisory() {
  const { t } = useTranslation();
  return (
    <Card className="border-none shadow-none bg-transparent mb-8">
      <CardHeader className="px-0 pt-0 pb-6">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="bg-primary/10 p-2 rounded-lg">
                    <Mountain className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <CardTitle className="text-xl font-black tracking-tight uppercase leading-none">{t("travelAdvisory.title")}</CardTitle>
                    <p className="text-xs text-muted-foreground font-medium mt-1">Real-time status for critical transit points and treks</p>
                </div>
            </div>
            <div className="hidden md:block">
               <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] font-bold uppercase">Live Status</Badge>
            </div>
        </div>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TRAVEL_POINTS.map((point) => (
            <AdvisoryCard key={point.id} point={point} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

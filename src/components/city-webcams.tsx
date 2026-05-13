import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Camera, LocateFixed, Loader2, PlayCircle, Wind, Thermometer, CloudRain, Gauge, Eye } from "lucide-react";
import type { Coordinates } from "@/api/types";
import { memo, useState, useEffect } from "react";
import { Button } from "./ui/button";
import { useGeolocation } from "@/hooks/use-geolocation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CityWebcamsProps {
  coordinates: Coordinates;
  locationName?: string;
}

const LAYERS = [
  { id: "webcams",     label: "Webcams",     icon: Camera,      color: "text-violet-400" },
  { id: "wind",        label: "Wind",         icon: Wind,        color: "text-blue-400" },
  { id: "rain",        label: "Rain",         icon: CloudRain,   color: "text-sky-400" },
  { id: "temp",        label: "Temperature",  icon: Thermometer, color: "text-orange-400" },
  { id: "pressure",    label: "Pressure",     icon: Gauge,       color: "text-teal-400" },
  { id: "visibility",  label: "Visibility",   icon: Eye,         color: "text-indigo-400" },
] as const;

type LayerId = typeof LAYERS[number]["id"];

function buildWindyUrl(coords: Coordinates, overlay: LayerId): string {
  const params = new URLSearchParams({
    lat: String(coords.lat),
    lon: String(coords.lon),
    zoom: "8",
    level: "surface",
    overlay,
    menu: "true",
    message: "true",
    marker: "true",
    // No `calendar` param = Windy defaults to current+future, timeline & play button both work
    pressure: "true",
    type: "map",
    location: "coordinates",
    detail: "",
    metricWind: "km/h",
    metricTemp: "°C",
    radarRange: "-1",
  });
  return `https://embed.windy.com/embed2.html?${params.toString()}`;
}

export const CityWebcams = memo(function CityWebcams({ coordinates, locationName }: CityWebcamsProps) {
  const [activeCoords, setActiveCoords] = useState<Coordinates>(coordinates);
  const [activeLayer, setActiveLayer] = useState<LayerId>("webcams");
  const [isLoaded, setIsLoaded] = useState(false);
  const [waitingForLocate, setWaitingForLocate] = useState(false);
  const { coordinates: userCoords, getLocation, isLoading: isLocating } = useGeolocation();

  useEffect(() => {
    setActiveCoords(coordinates);
    setIsLoaded(false);
  }, [coordinates]);

  const handleLocateMe = () => {
    if (userCoords) {
      setActiveCoords({ lat: userCoords.lat, lon: userCoords.lon });
      setIsLoaded(true);
    } else {
      setWaitingForLocate(true);
      getLocation();
    }
  };

  useEffect(() => {
    if (waitingForLocate && userCoords && isLocating === false) {
      setActiveCoords({ lat: userCoords.lat, lon: userCoords.lon });
      setIsLoaded(true);
      setWaitingForLocate(false);
    }
  }, [userCoords, isLocating, waitingForLocate]);

  // Rebuild the iframe key whenever coordinates OR layer changes so Windy re-renders
  const iframeKey = `${activeCoords.lat}-${activeCoords.lon}-${activeLayer}`;

  return (
    <Card className="w-full overflow-hidden border-border/50 bg-card/40 backdrop-blur-md">
      <CardHeader className="flex flex-row items-center justify-between pb-3 shrink-0 gap-2 flex-wrap">
        <div className="space-y-1">
          <CardTitle className="text-xl flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            Live Weather &amp; Webcams
          </CardTitle>
          <p className="text-xs text-muted-foreground hidden sm:block">
            Powered by Windy · {locationName || "your location"}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleLocateMe}
          disabled={isLocating}
          className="h-9 gap-2 bg-background/50 backdrop-blur-sm shadow-sm"
          title="Find cameras near me"
        >
          {isLocating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LocateFixed className="h-4 w-4" />
          )}
          <span className="hidden sm:inline font-semibold">Near Me</span>
        </Button>
      </CardHeader>

      {/* Layer selector — always visible so users can switch before/after loading */}
      <div className="flex items-center gap-1.5 px-4 pb-3 overflow-x-auto scrollbar-hide">
        {LAYERS.map((layer) => {
          const Icon = layer.icon;
          const isActive = activeLayer === layer.id;
          return (
            <button
              key={layer.id}
              onClick={() => {
                setActiveLayer(layer.id);
                // If map is already loaded, just change the layer without resetting isLoaded
              }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 border",
                isActive
                  ? "bg-primary text-primary-foreground border-primary shadow-md"
                  : "bg-muted/40 text-muted-foreground border-border/50 hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className={cn("h-3.5 w-3.5", isActive ? "text-primary-foreground" : layer.color)} />
              {layer.label}
            </button>
          );
        })}
      </div>

      <CardContent className="p-0">
        <div className="h-[520px] w-full relative bg-muted/20 overflow-hidden">
          {!isLoaded ? (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gradient-to-br from-muted/80 to-background/95 backdrop-blur-sm border-t border-border/50">
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }} />

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  className="rounded-full shadow-xl gap-3 h-14 px-8 text-base bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
                  onClick={() => setIsLoaded(true)}
                >
                  <PlayCircle className="h-6 w-6" />
                  Load Live Map
                </Button>
              </motion.div>

              <p className="text-xs text-muted-foreground mt-5 max-w-xs text-center font-medium">
                Click to load Windy's interactive map. Select a layer above to explore Webcams, Wind, Rain, Temperature and more — with the ▶ play button to animate the forecast.
              </p>
            </div>
          ) : (
            <iframe
              key={iframeKey}
              width="100%"
              height="100%"
              src={buildWindyUrl(activeCoords, activeLayer)}
              frameBorder="0"
              title={`Windy ${activeLayer} map near ${locationName || "your location"}`}
              allowFullScreen
              allow="geolocation"
              className="animate-in fade-in duration-700"
            />
          )}
        </div>

        {isLoaded && (
          <p className="text-[11px] text-center text-muted-foreground py-1.5 bg-muted/20 border-t border-border/30">
            {activeLayer === "webcams"
              ? "Webcams show live feeds · Switch to Wind, Rain or Temperature to use the ▶ play button"
              : "Use the ▶ play button inside the map to animate the forecast"}
          </p>
        )}
      </CardContent>
    </Card>
  );
});

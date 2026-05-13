import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Camera,
  LocateFixed,
  Loader2,
  PlayCircle,
  Wind,
  Thermometer,
  CloudRain,
  Gauge,
  Eye,
  Cloud,
  RefreshCw,
} from "lucide-react";
import type { Coordinates } from "@/api/types";
import { memo, useState, useEffect } from "react";
import { Button } from "./ui/button";
import { useGeolocation } from "@/hooks/use-geolocation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface CityWebcamsProps {
  coordinates: Coordinates;
  locationName?: string;
}

// All overlays supported natively by embed.windy.com/embed2.html
const LAYERS = [
  {
    id: "webcams",
    label: "Webcams",
    icon: Camera,
    color: "text-violet-400",
    glow: "bg-violet-500",
    tip: "Click any camera pin on the map to watch a live feed",
  },
  {
    id: "wind",
    label: "Wind",
    icon: Wind,
    color: "text-blue-400",
    glow: "bg-blue-500",
    tip: "Use the ▶ play button inside the map to animate the wind forecast",
  },
  {
    id: "rain",
    label: "Rain",
    icon: CloudRain,
    color: "text-sky-400",
    glow: "bg-sky-500",
    tip: "Use the ▶ play button inside the map to animate the rain forecast",
  },
  {
    id: "temp",
    label: "Temperature",
    icon: Thermometer,
    color: "text-orange-400",
    glow: "bg-orange-500",
    tip: "Use the ▶ play button inside the map to animate the temperature forecast",
  },
  {
    id: "pressure",
    label: "Pressure",
    icon: Gauge,
    color: "text-teal-400",
    glow: "bg-teal-500",
    tip: "Use the ▶ play button inside the map to animate the pressure forecast",
  },
  {
    id: "clouds",
    label: "Clouds",
    icon: Cloud,
    color: "text-slate-400",
    glow: "bg-slate-400",
    tip: "Use the ▶ play button inside the map to animate the cloud cover forecast",
  },
  {
    id: "visibility",
    label: "Visibility",
    icon: Eye,
    color: "text-indigo-400",
    glow: "bg-indigo-500",
    tip: "Use the ▶ play button inside the map to animate the visibility forecast",
  },
] as const;

type LayerId = (typeof LAYERS)[number]["id"];

/** Build a Windy embed2 URL for the given coordinates and overlay */
function buildWindyUrl(coords: Coordinates, overlay: LayerId): string {
  const params = new URLSearchParams({
    lat: String(coords.lat),
    lon: String(coords.lon),
    zoom: "8",
    level: "surface",
    overlay,
    menu: "bottom",
    message: "true",
    marker: "true",
    calendar: "default",
    pressure: "true",
    type: "map",
    location: "coordinates",
    metricWind: "km/h",
    metricTemp: "°C",
    radarRange: "-1",
  });
  return `https://embed.windy.com/embed2.html?${params.toString()}`;
}

export const CityWebcams = memo(function CityWebcams({
  coordinates,
  locationName,
}: CityWebcamsProps) {
  const [activeCoords, setActiveCoords] = useState<Coordinates>(coordinates);
  const [activeLayer, setActiveLayer] = useState<LayerId>("webcams");
  /** true = the Windy iframe is mounted and visible */
  const [isLoaded, setIsLoaded] = useState(false);
  const [waitingForLocate, setWaitingForLocate] = useState(false);

  const {
    coordinates: userCoords,
    getLocation,
    isLoading: isLocating,
  } = useGeolocation();

  // Reset when the city changes
  useEffect(() => {
    setActiveCoords(coordinates);
    setIsLoaded(false);
  }, [coordinates]);

  // "Near Me" handler
  const handleLocateMe = () => {
    if (userCoords) {
      setActiveCoords({ lat: userCoords.lat, lon: userCoords.lon });
      setIsLoaded(false);
    } else {
      setWaitingForLocate(true);
      getLocation();
    }
  };

  useEffect(() => {
    if (waitingForLocate && userCoords && !isLocating) {
      setActiveCoords({ lat: userCoords.lat, lon: userCoords.lon });
      setIsLoaded(false);
      setWaitingForLocate(false);
    }
  }, [userCoords, isLocating, waitingForLocate]);

  // Unique key per coords+layer so Windy fully reloads when either changes
  const iframeKey = `${activeCoords.lat}-${activeCoords.lon}-${activeLayer}`;

  const activeMeta = LAYERS.find((l) => l.id === activeLayer)!;

  return (
    <Card className="w-full overflow-hidden border-border/50 bg-card/40 backdrop-blur-md">
      {/* ── Header ── */}
      <CardHeader className="flex flex-row items-center justify-between pb-3 shrink-0 gap-2 flex-wrap">
        <div className="space-y-0.5">
          <CardTitle className="text-xl flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            Live Weather &amp; Webcams
          </CardTitle>
          <p className="text-xs text-muted-foreground hidden sm:block">
            Powered by Windy · {locationName || "your location"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Reload — only shown after map is live */}
          <AnimatePresence>
            {isLoaded && (
              <motion.button
                key="reload"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                onClick={() => setIsLoaded(false)}
                className="h-9 w-9 flex items-center justify-center rounded-lg border border-border/50 bg-background/50 hover:bg-muted/60 transition-colors"
                title="Reload map"
              >
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
              </motion.button>
            )}
          </AnimatePresence>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLocateMe}
            disabled={isLocating}
            className="h-9 gap-2 bg-background/50 backdrop-blur-sm shadow-sm"
            title="Show cameras near my location"
          >
            {isLocating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LocateFixed className="h-4 w-4" />
            )}
            <span className="hidden sm:inline font-semibold">Near Me</span>
          </Button>
        </div>
      </CardHeader>

      {/* ── Layer pills ── */}
      <div className="flex items-center gap-1.5 px-4 pb-3 overflow-x-auto scrollbar-hide">
        {LAYERS.map((layer) => {
          const Icon = layer.icon;
          const active = activeLayer === layer.id;
          return (
            <button
              key={layer.id}
              onClick={() => {
                if (activeLayer === layer.id) return;
                setActiveLayer(layer.id);
                // Keep map shown but reload the iframe for the new layer
                // isLoaded stays true — iframe remounts via key change
              }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 border",
                active
                  ? "bg-primary text-primary-foreground border-primary shadow-md"
                  : "bg-muted/40 text-muted-foreground border-border/50 hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-3.5 w-3.5",
                  active ? "text-primary-foreground" : layer.color
                )}
              />
              {layer.label}
            </button>
          );
        })}
      </div>

      {/* ── Map area ── */}
      <CardContent className="p-0">
        <div className="h-[520px] w-full relative bg-muted/20 overflow-hidden">
          {/* Subtle dot grid */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />

          {/* ── Placeholder (shown before user clicks Load) ── */}
          <AnimatePresence>
            {!isLoaded && (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.3 } }}
                className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gradient-to-br from-muted/80 to-background/95 backdrop-blur-sm border-t border-border/50"
              >
                {/* Ambient glow blob */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div
                    className={cn(
                      "w-72 h-72 rounded-full opacity-10 blur-3xl",
                      activeMeta.glow
                    )}
                  />
                </div>

                {/* Pulsing icon */}
                <motion.div
                  animate={{ scale: [1, 1.07, 1] }}
                  transition={{
                    duration: 2.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="mb-6 p-5 rounded-2xl border border-border/60 bg-background/50 backdrop-blur-sm shadow-xl"
                >
                  <activeMeta.icon
                    className={cn("h-12 w-12", activeMeta.color)}
                  />
                </motion.div>

                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  <Button
                    size="lg"
                    className="rounded-full shadow-xl gap-3 h-14 px-8 text-base bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
                    onClick={() => setIsLoaded(true)}
                  >
                    <PlayCircle className="h-6 w-6" />
                    Load {activeMeta.label} Map
                  </Button>
                </motion.div>

                <p className="text-xs text-muted-foreground mt-5 max-w-[280px] text-center font-medium px-4 leading-relaxed">
                  {activeLayer === "webcams"
                    ? `Click to load live webcam feeds near ${locationName || "your location"}. Tap any camera pin to watch.`
                    : `Click to load Windy's interactive ${activeMeta.label.toLowerCase()} map. Use the ▶ button inside to animate the forecast.`}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Windy iframe — always rendered once loaded ── */}
          {isLoaded && (
            <iframe
              key={iframeKey}
              width="100%"
              height="100%"
              src={buildWindyUrl(activeCoords, activeLayer)}
              frameBorder="0"
              title={`Windy ${activeLayer} map for ${locationName || "your location"}`}
              allowFullScreen
              allow="geolocation"
              className="absolute inset-0 animate-in fade-in duration-500"
            />
          )}
        </div>

        {/* ── Footer tip ── */}
        <AnimatePresence>
          {isLoaded && (
            <motion.p
              key="tip"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[11px] text-center text-muted-foreground py-1.5 bg-muted/20 border-t border-border/30"
            >
              {activeMeta.tip}
            </motion.p>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
});

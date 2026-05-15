import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Camera,
  LocateFixed,
  Loader2,
  Wind,
  Thermometer,
  CloudRain,
  Gauge,
  Eye,
  Cloud,
  RefreshCw,
} from "lucide-react";
import type { Coordinates } from "@/api/types";
import { memo, useState, useEffect, useCallback } from "react";
import { Button } from "./ui/button";
import { useGeolocation } from "@/hooks/use-geolocation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface CityWebcamsProps {
  coordinates: Coordinates;
  locationName?: string;
}

const LAYERS = [
  {
    id: "webcams",
    label: "Webcams",
    icon: Camera,
    color: "text-violet-400",
    tip: "Click any camera pin on the map to watch a live feed",
  },
  {
    id: "wind",
    label: "Wind",
    icon: Wind,
    color: "text-blue-400",
    tip: "Use ▶ inside the map to animate the wind forecast",
  },
  {
    id: "rain",
    label: "Rain",
    icon: CloudRain,
    color: "text-sky-400",
    tip: "Use ▶ inside the map to animate the rain forecast",
  },
  {
    id: "temp",
    label: "Temperature",
    icon: Thermometer,
    color: "text-orange-400",
    tip: "Use ▶ inside the map to animate the temperature forecast",
  },
  {
    id: "pressure",
    label: "Pressure",
    icon: Gauge,
    color: "text-teal-400",
    tip: "Use ▶ inside the map to animate the pressure forecast",
  },
  {
    id: "clouds",
    label: "Clouds",
    icon: Cloud,
    color: "text-slate-400",
    tip: "Use ▶ inside the map to animate the cloud cover forecast",
  },
  {
    id: "visibility",
    label: "Visibility",
    icon: Eye,
    color: "text-indigo-400",
    tip: "Use ▶ inside the map to animate the visibility forecast",
  },
] as const;

type LayerId = (typeof LAYERS)[number]["id"];

function buildWindyUrl(coords: Coordinates, overlay: LayerId): string {
  const params = new URLSearchParams({
    lat: String(coords.lat),
    lon: String(coords.lon),
    zoom: "8",
    level: "surface",
    overlay,
    menu: "",
    message: "true",
    marker: "true",
    calendar: "12",
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
  /** bump this to force-reload the iframe */
  const [reloadKey, setReloadKey] = useState(0);
  const [iframeReady, setIframeReady] = useState(false);
  const [waitingForLocate, setWaitingForLocate] = useState(false);

  const {
    coordinates: userCoords,
    getLocation,
    isLoading: isLocating,
  } = useGeolocation();

  // When the searched city changes, update coords & reset iframe readiness
  useEffect(() => {
    setActiveCoords(coordinates);
    setIframeReady(false);
    setReloadKey((k) => k + 1);
  }, [coordinates]);

  const handleLocateMe = () => {
    if (userCoords) {
      setActiveCoords({ lat: userCoords.lat, lon: userCoords.lon });
      setIframeReady(false);
      setReloadKey((k) => k + 1);
    } else {
      setWaitingForLocate(true);
      getLocation();
    }
  };

  useEffect(() => {
    if (waitingForLocate && userCoords && !isLocating) {
      setActiveCoords({ lat: userCoords.lat, lon: userCoords.lon });
      setIframeReady(false);
      setReloadKey((k) => k + 1);
      setWaitingForLocate(false);
    }
  }, [userCoords, isLocating, waitingForLocate]);

  const handleLayerChange = useCallback((id: LayerId) => {
    if (id === activeLayer) return;
    setActiveLayer(id);
    setIframeReady(false);
  }, [activeLayer]);

  const handleReload = () => {
    setIframeReady(false);
    setReloadKey((k) => k + 1);
  };

  // Unique key: forces Windy to fully remount on coords or layer change
  const iframeKey = `${reloadKey}-${activeCoords.lat}-${activeCoords.lon}-${activeLayer}`;
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
          {/* Reload button */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleReload}
            className="h-9 w-9 flex items-center justify-center rounded-lg border border-border/50 bg-background/50 hover:bg-muted/60 transition-colors"
            title="Reload map"
          >
            <RefreshCw
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform duration-700",
                !iframeReady && "animate-spin"
              )}
            />
          </motion.button>

          {/* Near Me button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleLocateMe}
            disabled={isLocating}
            className="h-9 gap-2 bg-background/50 backdrop-blur-sm shadow-sm"
            title="Show map near my location"
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
              onClick={() => handleLayerChange(layer.id)}
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
        <div className="h-[520px] w-full relative bg-muted/20 overflow-hidden rounded-b-xl">
          {/* Loading shimmer — shown until iframe signals it's ready */}
          <AnimatePresence>
            {!iframeReady && (
              <motion.div
                key="shimmer"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.5 } }}
                className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gradient-to-br from-muted/70 to-background/90 backdrop-blur-sm"
              >
                {/* Dot grid */}
                <div
                  className="absolute inset-0 opacity-[0.04] pointer-events-none"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)",
                    backgroundSize: "24px 24px",
                  }}
                />

                {/* Spinner + icon */}
                <div className="relative mb-4">
                  <div className="h-16 w-16 rounded-full border-2 border-border/40 border-t-primary animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <activeMeta.icon
                      className={cn("h-6 w-6", activeMeta.color)}
                    />
                  </div>
                </div>

                <p className="text-sm font-semibold text-foreground">
                  Loading {activeMeta.label} map…
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {locationName || "your location"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Windy iframe — always mounted, no gate ── */}
          <iframe
            key={iframeKey}
            width="100%"
            height="100%"
            src={buildWindyUrl(activeCoords, activeLayer)}
            frameBorder="0"
            title={`Windy ${activeLayer} map for ${locationName || "your location"}`}
            allowFullScreen
            allow="geolocation"
            className="absolute inset-0"
            onLoad={() => setIframeReady(true)}
          />
        </div>

        {/* ── Footer tip ── */}
        <AnimatePresence>
          {iframeReady && (
            <motion.p
              key="tip"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
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

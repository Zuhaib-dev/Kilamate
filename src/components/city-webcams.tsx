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
  Maximize2,
  Minimize2,
  Info,
  X,
  Waves,
  Snowflake,
  Zap,
} from "lucide-react";
import type { Coordinates } from "@/api/types";
import { memo, useState, useEffect, useCallback, useRef } from "react";
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
    gradient: "from-violet-500/20 to-violet-600/10",
    border: "border-violet-500/40",
    tip: "Click any camera 📷 pin on the map to watch a live feed",
    desc: "Live webcam feeds from around your location",
  },
  {
    id: "wind",
    label: "Wind",
    icon: Wind,
    color: "text-blue-400",
    gradient: "from-blue-500/20 to-blue-600/10",
    border: "border-blue-500/40",
    tip: "Press ▶ inside the map to animate the wind forecast",
    desc: "Real-time wind speed & direction at the surface",
  },
  {
    id: "rain",
    label: "Rain",
    icon: CloudRain,
    color: "text-sky-400",
    gradient: "from-sky-500/20 to-sky-600/10",
    border: "border-sky-500/40",
    tip: "Press ▶ inside the map to animate the rain forecast",
    desc: "Precipitation intensity radar overlay",
  },
  {
    id: "temp",
    label: "Temperature",
    icon: Thermometer,
    color: "text-orange-400",
    gradient: "from-orange-500/20 to-orange-600/10",
    border: "border-orange-500/40",
    tip: "Press ▶ inside the map to animate the temperature forecast",
    desc: "Surface temperature heat map & forecast",
  },
  {
    id: "pressure",
    label: "Pressure",
    icon: Gauge,
    color: "text-teal-400",
    gradient: "from-teal-500/20 to-teal-600/10",
    border: "border-teal-500/40",
    tip: "Press ▶ inside the map to animate the pressure forecast",
    desc: "Atmospheric pressure patterns & fronts",
  },
  {
    id: "clouds",
    label: "Clouds",
    icon: Cloud,
    color: "text-slate-400",
    gradient: "from-slate-500/20 to-slate-600/10",
    border: "border-slate-500/40",
    tip: "Press ▶ inside the map to animate the cloud cover forecast",
    desc: "Cloud cover and cloud base height",
  },
  {
    id: "visibility",
    label: "Visibility",
    icon: Eye,
    color: "text-indigo-400",
    gradient: "from-indigo-500/20 to-indigo-600/10",
    border: "border-indigo-500/40",
    tip: "Press ▶ inside the map to animate the visibility forecast",
    desc: "Horizontal visibility conditions map",
  },
  {
    id: "waves",
    label: "Waves",
    icon: Waves,
    color: "text-cyan-400",
    gradient: "from-cyan-500/20 to-cyan-600/10",
    border: "border-cyan-500/40",
    tip: "Coastal & ocean wave height and direction",
    desc: "Significant wave height from ocean models",
  },
  {
    id: "snow",
    label: "Snow",
    icon: Snowflake,
    color: "text-blue-200",
    gradient: "from-blue-200/20 to-blue-300/10",
    border: "border-blue-300/40",
    tip: "Press ▶ inside the map to animate the snowfall forecast",
    desc: "Snowfall accumulation and snow depth",
  },
  {
    id: "thunder",
    label: "Lightning",
    icon: Zap,
    color: "text-yellow-400",
    gradient: "from-yellow-500/20 to-yellow-600/10",
    border: "border-yellow-500/40",
    tip: "Live lightning strike detections worldwide",
    desc: "Real-time lightning & thunderstorm tracker",
  },
] as const;

type LayerId = (typeof LAYERS)[number]["id"];

/**
 * Builds the correct Windy embed URL using the current (non-deprecated) embed.html endpoint.
 * The old embed2.html is blocked by desktop browsers' stricter CSP enforcement.
 */
function buildWindyUrl(coords: Coordinates, overlay: LayerId): string {
  const params = new URLSearchParams({
    type: "map",
    location: "coordinates",
    lat: coords.lat.toFixed(4),
    lon: coords.lon.toFixed(4),
    zoom: "8",
    overlay,
    level: "surface",
    metricWind: "km/h",
    metricTemp: "°C",
    metricRain: "mm",
  });
  return `https://embed.windy.com/embed.html?${params.toString()}`;
}

export const CityWebcams = memo(function CityWebcams({
  coordinates,
  locationName,
}: CityWebcamsProps) {
  const [activeCoords, setActiveCoords] = useState<Coordinates>(coordinates);
  const [activeLayer, setActiveLayer] = useState<LayerId>("webcams");
  const [reloadKey, setReloadKey] = useState(0);
  const [iframeReady, setIframeReady] = useState(false);
  const [waitingForLocate, setWaitingForLocate] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    coordinates: userCoords,
    getLocation,
    isLoading: isLocating,
  } = useGeolocation();

  // When the searched city changes, update coords & reset iframe
  useEffect(() => {
    setActiveCoords(coordinates);
    setIframeReady(false);
    setIframeError(false);
    setReloadKey((k) => k + 1);
  }, [coordinates]);

  const handleLocateMe = () => {
    if (userCoords) {
      setActiveCoords({ lat: userCoords.lat, lon: userCoords.lon });
      setIframeReady(false);
      setIframeError(false);
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
      setIframeError(false);
      setReloadKey((k) => k + 1);
      setWaitingForLocate(false);
    }
  }, [userCoords, isLocating, waitingForLocate]);

  const handleLayerChange = useCallback(
    (id: LayerId) => {
      if (id === activeLayer) return;
      setActiveLayer(id);
      setIframeReady(false);
      setIframeError(false);
    },
    [activeLayer]
  );

  const handleReload = () => {
    setIframeReady(false);
    setIframeError(false);
    setReloadKey((k) => k + 1);
  };

  // Toggle native fullscreen on the card container
  const handleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      try {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } catch {
        // Fallback: expand height visually if Fullscreen API is unavailable
        setIsFullscreen((v) => !v);
      }
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // Safety timeout: mark iframe ready after 12s even if onLoad never fires
  useEffect(() => {
    if (iframeReady || iframeError) return;
    const timer = setTimeout(() => {
      setIframeReady(true);
    }, 12000);
    return () => clearTimeout(timer);
  }, [reloadKey, activeLayer, iframeReady, iframeError]);

  const iframeKey = `${reloadKey}-${activeCoords.lat}-${activeCoords.lon}-${activeLayer}`;
  const activeMeta = LAYERS.find((l) => l.id === activeLayer)!;

  const mapHeight = isFullscreen
    ? "h-[calc(100vh-160px)]"
    : "h-[520px] md:h-[580px]";

  return (
    <div ref={containerRef} className={cn(isFullscreen && "bg-background")}>
      <Card
        className={cn(
          "w-full overflow-hidden border-border/50 bg-card/40 backdrop-blur-md transition-all duration-300",
          isFullscreen && "rounded-none border-0 h-screen"
        )}
      >
        {/* ── Header ── */}
        <CardHeader className="flex flex-row items-center justify-between pb-2 shrink-0 gap-2 flex-wrap">
          <div className="space-y-0.5 min-w-0">
            <CardTitle className="text-xl flex items-center gap-2">
              <Camera className="h-5 w-5 text-primary flex-shrink-0" />
              <span className="truncate">Live Weather &amp; Webcams</span>
            </CardTitle>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Powered by Windy ·{" "}
              <span className="font-medium">{locationName || "your location"}</span>
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Info toggle */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setShowInfo((v) => !v)}
              className={cn(
                "h-9 w-9 flex items-center justify-center rounded-lg border transition-colors",
                showInfo
                  ? "border-primary/60 bg-primary/10 text-primary"
                  : "border-border/50 bg-background/50 hover:bg-muted/60 text-muted-foreground"
              )}
              title="Layer info"
            >
              {showInfo ? (
                <X className="h-4 w-4" />
              ) : (
                <Info className="h-4 w-4" />
              )}
            </motion.button>

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

            {/* Fullscreen toggle */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={handleFullscreen}
              className="h-9 w-9 flex items-center justify-center rounded-lg border border-border/50 bg-background/50 hover:bg-muted/60 transition-colors"
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Maximize2 className="h-4 w-4 text-muted-foreground" />
              )}
            </motion.button>
          </div>
        </CardHeader>

        {/* ── Info panel ── */}
        <AnimatePresence>
          {showInfo && (
            <motion.div
              key="info-panel"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div
                className={cn(
                  "mx-4 mb-3 p-3 rounded-xl border text-sm",
                  activeMeta.gradient,
                  activeMeta.border,
                  "bg-gradient-to-r"
                )}
              >
                <p className="font-semibold flex items-center gap-1.5 mb-0.5">
                  <activeMeta.icon
                    className={cn("h-4 w-4", activeMeta.color)}
                  />
                  {activeMeta.label} Layer
                </p>
                <p className="text-muted-foreground text-xs">
                  {activeMeta.desc}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Layer pills ── */}
        <div className="flex items-center gap-1.5 px-4 pb-3 overflow-x-auto scrollbar-hide">
          {LAYERS.map((layer) => {
            const Icon = layer.icon;
            const active = activeLayer === layer.id;
            return (
              <motion.button
                key={layer.id}
                onClick={() => handleLayerChange(layer.id)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 border",
                  active
                    ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
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
              </motion.button>
            );
          })}
        </div>

        {/* ── Map area ── */}
        <CardContent className="p-0">
          <div
            className={cn(
              "w-full relative bg-muted/20 overflow-hidden",
              mapHeight,
              !isFullscreen && "rounded-b-xl"
            )}
          >
            {/* Loading shimmer */}
            <AnimatePresence>
              {!iframeReady && !iframeError && (
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
                  <p className="text-[10px] text-muted-foreground/60 mt-3">
                    Powered by Windy
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error state */}
            <AnimatePresence>
              {iframeError && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm gap-3"
                >
                  <Camera className="h-10 w-10 text-muted-foreground/40" />
                  <p className="text-sm font-semibold">Map failed to load</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReload}
                    className="gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Retry
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Windy iframe ── */}
            {/* Uses embed.html (not deprecated embed2.html) for desktop browser compatibility */}
            <iframe
              key={iframeKey}
              width="100%"
              height="100%"
              src={buildWindyUrl(activeCoords, activeLayer)}
              frameBorder="0"
              title={`Windy ${activeLayer} map for ${locationName || "your location"}`}
              allowFullScreen
              allow="geolocation; fullscreen"
              referrerPolicy="no-referrer-when-downgrade"
              className={cn(
                "absolute inset-0 transition-opacity duration-500",
                iframeReady && !iframeError ? "opacity-100" : "opacity-0"
              )}
              onLoad={() => {
                setIframeReady(true);
                setIframeError(false);
              }}
              onError={() => {
                setIframeError(true);
              }}
            />
          </div>

          {/* ── Footer tip ── */}
          <AnimatePresence>
            {iframeReady && !iframeError && (
              <motion.div
                key="tip"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-between px-4 py-2 bg-muted/20 border-t border-border/30"
              >
                <p className="text-[11px] text-muted-foreground">
                  💡 {activeMeta.tip}
                </p>
                <span className="text-[10px] text-muted-foreground/50 hidden sm:block font-mono">
                  {activeCoords.lat.toFixed(2)}°N {activeCoords.lon.toFixed(2)}°E
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
});

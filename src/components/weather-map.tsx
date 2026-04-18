import { useEffect, useRef, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Map as MapIcon, Layers, LocateFixed } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import type { Coordinates } from "@/api/types";
import { useTheme } from "next-themes";

// Custom pin icon — avoids Vite's leaflet asset path issues
const customIcon = L.divIcon({
  html: `<div style="color: #ef4444; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.5)); display: flex; justify-content: center; align-items: center;"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="white" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3" fill="currentColor"/></svg></div>`,
  className: "custom-map-icon bg-transparent border-none",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

interface WeatherMapProps {
  coordinates: Coordinates;
}

const LAYERS = [
  { id: "precipitation_new", name: "Precipitation" },
  { id: "clouds_new", name: "Clouds" },
  { id: "temp_new", name: "Temperature" },
  { id: "wind_new", name: "Wind Speed" },
  { id: "pressure_new", name: "Pressure" },
];

// Flies map to target coordinates whenever coordinates prop changes
function MapUpdater({ coordinates }: { coordinates: Coordinates }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([coordinates.lat, coordinates.lon], 8, { duration: 1.2 });
  }, [coordinates, map]);
  return null;
}

// Handles the "Locate Me" button inside the map context
function LocateMeControl({
  coordinates,
  onLocate,
}: {
  coordinates: Coordinates;
  onLocate: () => void;
}) {
  const map = useMap();

  const handleClick = useCallback(() => {
    map.flyTo([coordinates.lat, coordinates.lon], 8, { duration: 1.2 });
    onLocate();
  }, [map, coordinates, onLocate]);

  return (
    <div
      className="leaflet-top leaflet-right"
      style={{ marginTop: "10px", marginRight: "10px" }}
    >
      <div className="leaflet-control">
        <button
          onClick={handleClick}
          title="Fly to my location"
          aria-label="Fly to my location"
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "50%",
            background: "white",
            border: "2px solid rgba(0,0,0,0.2)",
            boxShadow: "0 1px 5px rgba(0,0,0,0.35)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#2563eb",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background = "#eff6ff")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background = "white")
          }
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="2" x2="12" y2="6" />
            <line x1="12" y1="18" x2="12" y2="22" />
            <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
            <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
            <line x1="2" y1="12" x2="6" y2="12" />
            <line x1="18" y1="12" x2="22" y2="12" />
            <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
            <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
            <circle cx="12" cy="12" r="4" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Handles touch-drag on mobile — two-finger scroll zooms, one-finger scrolls the page
function MobileTouchHandler() {
  const map = useMap();

  useEffect(() => {
    const isMobile = window.matchMedia("(pointer: coarse)").matches;
    if (!isMobile) return;

    // Disable single-touch drag (let page scroll naturally)
    map.dragging.disable();

    let touchStartCount = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartCount = e.touches.length;
      if (e.touches.length >= 2) {
        // Two fingers → enable map interaction for pinch-zoom
        map.dragging.enable();
        map.touchZoom.enable();
      } else {
        map.dragging.disable();
      }
    };

    const handleTouchEnd = () => {
      if (touchStartCount < 2) {
        map.dragging.disable();
      }
      touchStartCount = 0;
    };

    const container = map.getContainer();
    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [map]);

  return null;
}

export function WeatherMap({ coordinates }: WeatherMapProps) {
  const [activeLayer, setActiveLayer] = useState(LAYERS[0]);
  const [tilesLoading, setTilesLoading] = useState(true);
  const { theme } = useTheme();
  const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

  const isDark = theme === "dark";
  const baseMapUrl = isDark
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

  const handleLocate = useCallback(() => {
    setTilesLoading(false); // dismiss skeleton on re-locate too
  }, []);

  return (
    <Card className="w-full overflow-hidden flex flex-col border-border/50 bg-card/40 backdrop-blur-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl flex items-center gap-2">
          <MapIcon className="h-5 w-5 text-primary" />
          Interactive Radar
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-2 bg-background/50 backdrop-blur-sm">
              <Layers className="h-4 w-4" />
              {activeLayer.name}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {LAYERS.map((layer) => (
              <DropdownMenuItem
                key={layer.id}
                onClick={() => setActiveLayer(layer)}
                className={activeLayer.id === layer.id ? "bg-accent" : ""}
              >
                {layer.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="p-0">
        {/* Mobile hint */}
        <p className="text-[11px] text-center text-muted-foreground py-1.5 md:hidden bg-muted/30">
          Use two fingers to pan &amp; zoom the map
        </p>

        <div className="h-[400px] w-full relative z-0">
          {/* Loading skeleton — disappears once tiles load */}
          {tilesLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-muted/60 backdrop-blur-sm animate-pulse">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapIcon className="h-5 w-5 animate-spin" style={{ animationDuration: '2s' }} />
                <span className="text-sm font-medium">Loading map tiles…</span>
              </div>
              <div className="grid grid-cols-4 gap-1 opacity-30">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="h-14 w-20 rounded bg-muted-foreground/20" />
                ))}
              </div>
            </div>
          )}
          <MapContainer
            center={[coordinates.lat, coordinates.lon]}
            zoom={8}
            scrollWheelZoom={false}
            style={{ height: "100%", width: "100%" }}
            className="z-0"
            whenReady={() => {
              // Mark loaded once base tiles start streaming in
              setTimeout(() => setTilesLoading(false), 600);
            }}
          >
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">Carto</a>'
              url={baseMapUrl}
            />
            <TileLayer
              key={activeLayer.id}
              url={`https://tile.openweathermap.org/map/${activeLayer.id}/{z}/{x}/{y}.png?appid=${API_KEY}`}
              opacity={0.8}
            />
            <Marker position={[coordinates.lat, coordinates.lon]} icon={customIcon} />
            <MapUpdater coordinates={coordinates} />
            <MobileTouchHandler />
            <LocateMeControl coordinates={coordinates} onLocate={handleLocate} />
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  );
}

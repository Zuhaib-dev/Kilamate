import { useEffect, useState, useCallback, useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMap, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Map as MapIcon, Layers, LocateFixed, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import type { Coordinates } from "@/api/types";
import { useTheme } from "next-themes";
import { useGeolocation } from "@/hooks/use-geolocation";

// Standard searched city pin (Red)
const cityIcon = L.divIcon({
  html: `<div style="color: #ef4444; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.5)); display: flex; justify-content: center; align-items: center;"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="white" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3" fill="currentColor"/></svg></div>`,
  className: "custom-map-icon bg-transparent border-none",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

interface WeatherMapProps {
  coordinates: Coordinates;
}

const LAYERS = [
  { id: "precipitation_new", name: "Precipitation", unit: "mm/h" },
  { id: "clouds_new", name: "Clouds", unit: "%" },
  { id: "temp_new", name: "Temperature", unit: "°C" },
  { id: "wind_new", name: "Wind Speed", unit: "m/s" },
  { id: "pressure_new", name: "Pressure", unit: "hPa" },
];

function MapUpdater({ coordinates, activeCoords }: { coordinates: Coordinates; activeCoords: Coordinates | null }) {
  const map = useMap();
  useEffect(() => {
    const target = activeCoords || coordinates;
    map.flyTo([target.lat, target.lon], 8, { duration: 1.5 });
  }, [coordinates, activeCoords, map]);
  return null;
}

function RadarLegend({ layerId }: { layerId: string }) {
  const legendData = useMemo(() => {
    switch (layerId) {
      case "precipitation_new":
        return {
          title: "Precipitation",
          colors: ["#78c679", "#41ab5d", "#238443", "#005a32", "#fee391", "#fec44f", "#fe9929", "#ec7014", "#cc4c02", "#8c2d04"],
          labels: ["Light", "", "", "Medium", "", "", "Heavy", "", "", "Extreme"]
        };
      case "temp_new":
        return {
          title: "Temperature",
          colors: ["#08306b", "#08519c", "#2171b5", "#4292c6", "#6baed6", "#9ecae1", "#c6dbef", "#fdd0a2", "#fdae6b", "#fd8d3c", "#f16913", "#d94801", "#a63603", "#7f2704"],
          labels: ["Cold", "", "", "", "", "Mild", "", "", "", "", "Hot", "", "", "Extreme"]
        };
      case "clouds_new":
        return {
          title: "Cloud Cover",
          colors: ["#f7f7f7", "#cccccc", "#969696", "#525252", "#252525"],
          labels: ["Clear", "", "", "", "Overcast"]
        };
      default:
        return null;
    }
  }, [layerId]);

  if (!legendData) return null;

  return (
    <div className="absolute bottom-4 right-4 z-[1000] bg-background/80 backdrop-blur-md border border-border p-2 rounded-lg shadow-lg max-w-[150px]">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">{legendData.title}</p>
      <div className="flex h-2 w-full rounded-full overflow-hidden mb-1">
        {legendData.colors.map((c, i) => (
          <div key={i} className="flex-1" style={{ backgroundColor: c }} />
        ))}
      </div>
      <div className="flex justify-between w-full">
        <span className="text-[9px] text-muted-foreground font-medium">{legendData.labels[0]}</span>
        <span className="text-[9px] text-muted-foreground font-medium">{legendData.labels[legendData.labels.length - 1]}</span>
      </div>
    </div>
  );
}

// Handles touch-drag on mobile
function MobileTouchHandler() {
  const map = useMap();
  useEffect(() => {
    const isMobile = window.matchMedia("(pointer: coarse)").matches;
    if (!isMobile) return;
    map.dragging.disable();
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length >= 2) {
        map.dragging.enable();
        map.touchZoom.enable();
      } else {
        map.dragging.disable();
      }
    };
    const container = map.getContainer();
    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    return () => container.removeEventListener("touchstart", handleTouchStart);
  }, [map]);
  return null;
}

export function WeatherMap({ coordinates }: WeatherMapProps) {
  const [activeLayer, setActiveLayer] = useState(LAYERS[0]);
  const [tilesLoading, setTilesLoading] = useState(true);
  const [activeCoords, setActiveCoords] = useState<Coordinates | null>(null);
  const { theme } = useTheme();
  const { coordinates: userCoords, getLocation, isLoading: isLocating } = useGeolocation();
  const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

  const isDark = theme === "dark";
  const baseMapUrl = isDark
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

  const handleLocateMe = useCallback(() => {
    if (userCoords) {
      setActiveCoords({ ...userCoords, _t: Date.now() } as any);
    } else {
      getLocation();
    }
  }, [userCoords, getLocation]);

  // If userCoords update while we are "waiting" for them, focus map on them
  useEffect(() => {
    if (userCoords && isLocating === false) {
      setActiveCoords(userCoords);
    }
  }, [userCoords, isLocating]);

  return (
    <Card className="w-full overflow-hidden flex flex-col border-border/50 bg-card/40 backdrop-blur-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 shrink-0">
        <CardTitle className="text-xl flex items-center gap-2">
          <MapIcon className="h-5 w-5 text-primary" />
          Interactive Radar
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLocateMe}
            disabled={isLocating}
            className="h-8 w-8 p-0 bg-background/50 backdrop-blur-sm"
            title="Locate me"
          >
            {isLocating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LocateFixed className="h-4 w-4" />
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-2 bg-background/50 backdrop-blur-sm">
                <Layers className="h-4 w-4" />
                <span className="hidden sm:inline">{activeLayer.name}</span>
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
        </div>
      </CardHeader>

      <CardContent className="p-0 relative">
        <p className="text-[11px] text-center text-muted-foreground py-1 md:hidden bg-muted/20">
          Use two fingers to pan & zoom
        </p>

        <div className="h-[400px] w-full relative z-0">
          {tilesLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background/40 backdrop-blur-sm animate-pulse">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Loading Radar...</span>
            </div>
          )}
          
          <MapContainer
            center={[coordinates.lat, coordinates.lon]}
            zoom={8}
            scrollWheelZoom={false}
            style={{ height: "100%", width: "100%" }}
            className="z-0"
            whenReady={() => setTimeout(() => setTilesLoading(false), 800)}
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
            
            {/* Search City Marker */}
            <Marker position={[coordinates.lat, coordinates.lon]} icon={cityIcon} />
            
            {/* User Location Marker (Blue Dot) */}
            {userCoords && (
              <>
                <Circle 
                  center={[userCoords.lat, userCoords.lon]} 
                  radius={1000} 
                  pathOptions={{ fillColor: '#3b82f6', color: '#3b82f6', weight: 1, fillOpacity: 0.2 }} 
                />
                <Marker 
                  position={[userCoords.lat, userCoords.lon]} 
                  icon={L.divIcon({
                    html: `<div class="relative flex items-center justify-center"><div class="absolute w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-lg z-10"></div><div class="absolute w-6 h-6 bg-blue-500 rounded-full animate-ping opacity-30"></div></div>`,
                    className: "user-location-icon",
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                  })} 
                />
              </>
            )}

            <MapUpdater coordinates={coordinates} activeCoords={activeCoords} />
            <MobileTouchHandler />
          </MapContainer>
          
          <RadarLegend layerId={activeLayer.id} />
        </div>
      </CardContent>
    </Card>
  );
}

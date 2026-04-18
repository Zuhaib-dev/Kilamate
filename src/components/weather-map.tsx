import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Map as MapIcon, Layers } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import type { Coordinates } from "@/api/types";
import { useTheme } from "next-themes";

// Custom icon using lucide styling to avoid leaflet default icon path issues in Vite
const customIcon = L.divIcon({
  html: `<div style="color: #ef4444; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.5)); display: flex; justify-content: center; align-items: center;"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="white" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3" fill="currentColor"/></svg></div>`,
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

function MapUpdater({ coordinates }: { coordinates: Coordinates }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([coordinates.lat, coordinates.lon], 8);
  }, [coordinates, map]);
  return null;
}

export function WeatherMap({ coordinates }: WeatherMapProps) {
  const [activeLayer, setActiveLayer] = useState(LAYERS[0]);
  const { theme } = useTheme();
  const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

  // Choose a base map that looks good in dark or light mode
  const isDark = theme === "dark";
  const baseMapUrl = isDark
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

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
        <div className="h-[400px] w-full relative z-0">
          <MapContainer
            center={[coordinates.lat, coordinates.lon]}
            zoom={8}
            scrollWheelZoom={false}
            style={{ height: "100%", width: "100%" }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">Carto</a>'
              url={baseMapUrl}
            />
            {/* Leaflet uses the key prop to re-render the TileLayer when the URL changes */}
            <TileLayer
              key={activeLayer.id}
              url={`https://tile.openweathermap.org/map/${activeLayer.id}/{z}/{x}/{y}.png?appid=${API_KEY}`}
              opacity={0.8}
            />
            <Marker position={[coordinates.lat, coordinates.lon]} icon={customIcon} />
            <MapUpdater coordinates={coordinates} />
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  );
}

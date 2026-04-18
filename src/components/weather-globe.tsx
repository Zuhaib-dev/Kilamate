import { useEffect, useRef, useState } from "react";
import Globe from "react-globe.gl";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Globe2 } from "lucide-react";
import type { Coordinates } from "@/api/types";
import { useFavorites } from "@/hooks/use-favorite";

interface WeatherGlobeProps {
  coordinates: Coordinates;
}

export function WeatherGlobe({ coordinates }: WeatherGlobeProps) {
  const globeEl = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 400 });
  const [isTouch, setIsTouch] = useState(false);
  const { theme, systemTheme } = useTheme();
  const { favorites } = useFavorites();

  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDark = currentTheme === "dark";

  // Handle responsive sizing
  useEffect(() => {
    const observeTarget = containerRef.current;
    if (!observeTarget) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: 400 // fixed height
        });
      }
    });

    resizeObserver.observe(observeTarget);
    return () => resizeObserver.unobserve(observeTarget);
  }, []);

  // Detect touch device
  useEffect(() => {
    setIsTouch(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  // Set initial point of view and interaction settings
  useEffect(() => {
    if (globeEl.current) {
      // interaction settings for mobile
      const controls = globeEl.current.controls();
      if (controls && isTouch) {
        controls.enabled = false; // Start disabled on mobile to allow scrolling
      }

      // Center on the coordinates
      globeEl.current.pointOfView({ lat: coordinates.lat, lng: coordinates.lon, altitude: 1.5 }, 1000);
      
      // Auto rotate slowly
      if (controls) {
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.5;
        controls.enableDamping = true;
      }
    }
  }, [coordinates, isTouch]);

  // Handle touch interactions for mobile (two-finger rotation)
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isTouch) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length >= 2) {
        const controls = globeEl.current?.controls();
        if (controls) controls.enabled = true;
      } else {
        const controls = globeEl.current?.controls();
        if (controls) controls.enabled = false;
      }
    };

    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    return () => container.removeEventListener("touchstart", handleTouchStart);
  }, [isTouch]);

  // Primary coordinate ring (Glowing Red)
  const ringsData = [
    {
      lat: coordinates.lat,
      lng: coordinates.lon,
      color: "#ef4444", 
      maxR: 5,
      propagationSpeed: 2,
      repeatPeriod: 1000,
    }
  ];

  // Secondary rings for favorite cities (Glowing Blue)
  if (favorites) {
    favorites.forEach((fav) => {
      // Don't duplicate if it's the currently selected coordinate
      const isCurrent = Math.abs(fav.lat - coordinates.lat) < 0.1 && Math.abs(fav.lon - coordinates.lon) < 0.1;
      
      if (!isCurrent) {
        ringsData.push({
          lat: fav.lat,
          lng: fav.lon,
          color: "#3b82f6", 
          maxR: 3,
          propagationSpeed: 1,
          repeatPeriod: 1500,
        });
      }
    });
  }

  // Textures
  const globeImageUrl = isDark 
    ? "//unpkg.com/three-globe/example/img/earth-night.jpg"
    : "//unpkg.com/three-globe/example/img/earth-blue-marble.jpg";
    
  const bumpImageUrl = "//unpkg.com/three-globe/example/img/earth-topology.png";

  return (
    <Card className="w-full overflow-hidden flex flex-col border-border/50 bg-card/40 backdrop-blur-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl flex items-center gap-2">
          <Globe2 className="h-5 w-5 text-primary" />
          Interactive 3D Earth
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isTouch && (
          <p className="text-[11px] text-center text-muted-foreground py-1 bg-muted/20 border-b border-border/10">
            Use two fingers to rotate the world
          </p>
        )}
        <div 
          ref={containerRef} 
          className="w-full h-[400px] flex justify-center items-center cursor-grab active:cursor-grabbing overflow-hidden relative"
          style={{ background: isDark ? 'radial-gradient(circle, rgba(30,41,59,1) 0%, rgba(2,8,23,1) 100%)' : 'radial-gradient(circle, rgba(248,250,252,1) 0%, rgba(219,234,254,1) 100%)' }}
        >
          {dimensions.width > 0 && (
            <Globe
              ref={globeEl}
              width={dimensions.width}
              height={dimensions.height}
              globeImageUrl={globeImageUrl}
              bumpImageUrl={bumpImageUrl}
              // Data mappings
              ringsData={ringsData}
              ringColor={(d: any) => d.color}
              ringMaxRadius={(d: any) => d.maxR}
              ringPropagationSpeed={(d: any) => d.propagationSpeed}
              ringRepeatPeriod={(d: any) => d.repeatPeriod}
              // Atmosphere
              atmosphereColor={isDark ? "#3b82f6" : "#0ea5e9"}
              atmosphereAltitude={0.15}
              backgroundColor="rgba(0,0,0,0)" // Transparent to show gradient div behind
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

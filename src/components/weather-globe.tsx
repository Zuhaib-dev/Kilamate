import { useEffect, useRef, useState, useMemo, memo } from "react";
import Globe from "react-globe.gl";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Globe2, Crosshair, Sparkles } from "lucide-react";
import type { Coordinates } from "@/api/types";
import { useFavorites } from "@/hooks/use-favorite";
import * as THREE from "three";
import { useNavigate } from "react-router-dom";
import { useInView } from "framer-motion";

interface WeatherGlobeProps {
  coordinates: Coordinates;
  locationName?: string;
  onCitySelect?: (lat: number, lon: number, name: string) => void;
}

export const WeatherGlobe = memo(function WeatherGlobe({ coordinates, locationName }: WeatherGlobeProps) {
  const globeEl = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [dimensions, setDimensions] = useState({ width: 0, height: 350 });
  const [isTouch, setIsTouch] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const { theme, systemTheme } = useTheme();
  const { favorites } = useFavorites();
  const isInView = useInView(containerRef, { margin: "200px" });
  const inViewRef = useRef(isInView);
  
  useEffect(() => {
    inViewRef.current = isInView;
  }, [isInView]);

  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDark = currentTheme === "dark";

  // Handle responsive sizing
  useEffect(() => {
    const observeTarget = containerRef.current;
    if (!observeTarget) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const width = entry.contentRect.width;
        const height = width < 640 ? 320 : width < 1024 ? 400 : 450;
        setDimensions({ width, height });
      }
    });

    resizeObserver.observe(observeTarget);
    return () => resizeObserver.unobserve(observeTarget);
  }, []);

  // Detect touch device
  useEffect(() => {
    setIsTouch(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  // Smart Auto-Rotation & Camera Focus
  useEffect(() => {
    if (globeEl.current) {
      const controls = globeEl.current.controls();
      
      // Smoothly zoom to the current point
      globeEl.current.pointOfView({ 
        lat: coordinates.lat, 
        lng: coordinates.lon, 
        altitude: isTouch ? 2.5 : 1.8 
      }, 1500); // Increased duration for smoother cinematic feel
      
      if (controls) {
        controls.enabled = true;
        controls.autoRotate = !isInteracting && isInView;
        controls.autoRotateSpeed = 0.5; // Slower, more premium feel
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enableZoom = true;
        controls.minDistance = 150;
        controls.maxDistance = 600;
        controls.rotateSpeed = isTouch ? 1.5 : 1.0;
      }
    }
  }, [coordinates.lat, coordinates.lon, isTouch, isInteracting, isInView]);

  // Add Clouds Layer
  useEffect(() => {
    if (globeEl.current) {
      const globe = globeEl.current;
      const cloudsUrl = "//unpkg.com/three-globe/example/img/earth-clouds.png";
      const CLOUDS_ALT = 0.005;
      const CLOUDS_ROTATION_SPEED = -0.012;

      new THREE.TextureLoader().load(cloudsUrl, (clouds) => {
        const cloudsObj = new THREE.Mesh(
          new THREE.SphereGeometry(globe.getGlobeRadius() * (1 + CLOUDS_ALT), 32, 32),
          new THREE.MeshPhongMaterial({ map: clouds, transparent: true, opacity: 0.8 })
        );
        globe.scene().add(cloudsObj);

        const rotateClouds = () => {
          if (inViewRef.current) {
            cloudsObj.rotation.y += (CLOUDS_ROTATION_SPEED * Math.PI) / 180;
          }
          requestAnimationFrame(rotateClouds);
        };
        rotateClouds();
      });
    }
  }, []);

  // Generate Data Layers
  const { labelsData, arcsData, hexData } = useMemo(() => {
    // 1. Labels
    const labels = (favorites || []).map(fav => ({
      lat: fav.lat,
      lng: fav.lon,
      text: `🏙️ ${fav.name}`,
      size: 0.8,
      color: '#60a5fa'
    }));

    labels.push({
      lat: coordinates.lat,
      lng: coordinates.lon,
      text: locationName ? `📍 ${locationName}` : "📍 Current Location",
      size: 1.1,
      color: '#ef4444'
    });

    // 2. Arcs (Connections from current position to favorites)
    const arcs = (favorites || []).map(fav => ({
      startLat: coordinates.lat,
      startLng: coordinates.lon,
      endLat: fav.lat,
      endLng: fav.lon,
      color: ['#ef4444', '#3b82f6'],
      dashLength: 0.4,
      dashGap: 4,
      dashAnimateTime: 2000 + Math.random() * 2000
    }));

    // 3. Simulated Global Patterns (Hex Bins)
    const hex = [...Array(40).keys()].map(() => ({
      lat: (Math.random() - 0.5) * 160,
      lng: (Math.random() - 0.5) * 360,
      weight: Math.random()
    }));

    return { labelsData: labels, arcsData: arcs, hexData: hex };
  }, [favorites, coordinates]);

  const handleFocusCurrent = () => {
    if (globeEl.current) {
      globeEl.current.pointOfView({ 
        lat: coordinates.lat, 
        lng: coordinates.lon, 
        altitude: 1.8 
      }, 1000);
    }
  };

  const globeImageUrl = isDark 
    ? "//unpkg.com/three-globe/example/img/earth-night.jpg"
    : "//unpkg.com/three-globe/example/img/earth-blue-marble.jpg";
    
  const bumpImageUrl = "//unpkg.com/three-globe/example/img/earth-topology.png";
  const starsUrl = "//unpkg.com/three-globe/example/img/night-sky.png";

  return (
    <Card className="w-full overflow-hidden flex flex-col border-border/40 bg-card/30 backdrop-blur-xl shadow-2xl transition-all duration-700">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 bg-gradient-to-r from-primary/10 via-transparent to-transparent">
        <div className="space-y-1">
          <CardTitle className="text-xl flex items-center gap-2 group">
            <Globe2 className="h-5 w-5 text-primary group-hover:rotate-12 transition-transform duration-500" />
            Weather Globe
          </CardTitle>
          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-60">Global Atmospheric View</p>
        </div>
        <div className="flex gap-2">
           <button 
            onClick={handleFocusCurrent}
            className="p-2 rounded-xl bg-muted/50 hover:bg-primary/20 text-muted-foreground hover:text-primary transition-all"
            title="Focus Current Location"
          >
            <Crosshair className="h-4 w-4" />
          </button>
           <button 
            onClick={() => setIsInteracting(!isInteracting)}
            className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-tight transition-all flex items-center gap-2 ${
              isInteracting 
                ? "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(59,130,246,0.5)]" 
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <Sparkles className="h-3 w-3" />
            {isInteracting ? "Locked" : "Explore"}
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-0 relative">
        <div 
          ref={containerRef} 
          className="w-full h-[320px] sm:h-[400px] lg:h-[450px] flex justify-center items-center cursor-grab active:cursor-grabbing overflow-hidden relative"
          style={{ 
            background: isDark ? 'radial-gradient(circle at center, #0f172a 0%, #020617 100%)' : 'radial-gradient(circle at center, #f8fafc 0%, #cbd5e1 100%)',
          }}
        >
          <style dangerouslySetInnerHTML={{ __html: `
            .globe-container canvas { 
              touch-action: ${isInteracting ? 'none' : 'pan-y'} !important;
              pointer-events: ${isInteracting ? 'auto' : 'none'} !important;
            }
          `}} />

          {/* Interaction Guard Overlay */}
          {!isInteracting && (
            <div 
              className="absolute inset-0 z-10 flex items-center justify-center bg-black/5 backdrop-blur-[1px] group"
              onClick={() => {
                setIsInteracting(true);
              }}
            >
              <div className="bg-background/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-3">
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                <span className="text-xs font-black uppercase tracking-widest text-foreground">Click to unlock 3D earth</span>
              </div>
            </div>
          )}

          {dimensions.width > 0 && (
            <div className="globe-container">
              <Globe
                ref={globeEl}
                width={dimensions.width}
                height={dimensions.height}
                globeImageUrl={globeImageUrl}
                bumpImageUrl={bumpImageUrl}
                backgroundImageUrl={isDark ? starsUrl : undefined}
                // Atmosphere
                atmosphereColor={isDark ? "#3b82f6" : "#4fc3f7"}
                atmosphereAltitude={0.15}
                // Arcs
                arcsData={arcsData}
                arcColor={(d: any) => d.color}
                arcDashLength={(d: any) => d.dashLength}
                arcDashGap={(d: any) => d.dashGap}
                arcDashAnimateTime={(d: any) => d.dashAnimateTime}
                arcAltitude={0.15}
                arcStroke={0.5}
                // Hex Bins
                hexBinPointsData={hexData}
                hexBinPointWeight="weight"
                hexBinResolution={4}
                hexMargin={0.2}
                hexTopColor={() => isDark ? "rgba(59, 130, 246, 0.4)" : "rgba(14, 165, 233, 0.4)"}
                hexSideColor={() => isDark ? "rgba(59, 130, 246, 0.1)" : "rgba(14, 165, 233, 0.1)"}
                // Labels
                labelsData={labelsData}
                labelLat={(d: any) => d.lat}
                labelLng={(d: any) => d.lng}
                labelText={(d: any) => d.text}
                labelSize={(d: any) => d.size}
                labelDotRadius={0.6}
                labelColor={(d: any) => d.color}
                onLabelClick={(label: any) => {
                  if (isInteracting) {
                    const cleanName = label.text.replace(/🏙️ |📍 /, "");
                    navigate(`/city/${encodeURIComponent(cleanName)}?lat=${label.lat}&lon=${label.lng}`);
                  }
                }}
                backgroundColor="rgba(0,0,0,0)" 
              />
            </div>
          )}
        </div>
        
        {/* Legend */}
        <div className="absolute bottom-6 left-6 z-20 flex flex-col gap-3">
          <div className="bg-background/60 backdrop-blur-md p-3 rounded-2xl border border-border/40 shadow-xl space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444] shadow-[0_0_8px_#ef4444]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Active Point</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-[#3b82f6] shadow-[0_0_8px_#3b82f6]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Favorites</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});


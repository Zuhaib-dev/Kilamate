import { useEffect, useRef, useState } from "react";
import Globe from "react-globe.gl";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Globe2 } from "lucide-react";
import type { Coordinates } from "@/api/types";
import { useFavorites } from "@/hooks/use-favorite";
import * as THREE from "three";
import { useNavigate } from "react-router-dom";

interface WeatherGlobeProps {
  coordinates: Coordinates;
  onCitySelect?: (lat: number, lon: number, name: string) => void;
}

export function WeatherGlobe({ coordinates }: WeatherGlobeProps) {
  const globeEl = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [dimensions, setDimensions] = useState({ width: 0, height: 350 });
  const [isTouch, setIsTouch] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [showInteractionTip, setShowInteractionTip] = useState(true);
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
        const width = entry.contentRect.width;
        // Adjust height based on width for better mobile aspect ratio
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


  // Smart Auto-Rotation & Interaction
  useEffect(() => {
    if (globeEl.current) {
      const controls = globeEl.current.controls();
      
      // Center on the coordinates
      globeEl.current.pointOfView({ 
        lat: coordinates.lat, 
        lng: coordinates.lon, 
        altitude: isTouch ? 2.5 : 1.8 
      }, 1000);
      
      if (controls) {
        controls.enabled = true;
        controls.autoRotate = !isInteracting;
        controls.autoRotateSpeed = 0.8;
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enableZoom = true;
        controls.minDistance = 150;
        controls.maxDistance = 600;
        // Adjust for mobile feel
        controls.rotateSpeed = isTouch ? 1.5 : 1.0;
        controls.zoomSpeed = isTouch ? 1.2 : 1.0;
      }
    }
  }, [coordinates, isTouch, isInteracting]);

  // Add Clouds Layer
  useEffect(() => {
    if (globeEl.current) {
      const globe = globeEl.current;
      const cloudsUrl = "//unpkg.com/three-globe/example/img/earth-clouds.png";
      const CLOUDS_ALT = 0.004;
      const CLOUDS_ROTATION_SPEED = -0.01; // deg/frame

      new THREE.TextureLoader().load(cloudsUrl, (clouds) => {
        const cloudsObj = new THREE.Mesh(
          new THREE.SphereGeometry(globe.getGlobeRadius() * (1 + CLOUDS_ALT), 75, 75),
          new THREE.MeshPhongMaterial({ map: clouds, transparent: true })
        );
        globe.scene().add(cloudsObj);

        const rotateClouds = () => {
          cloudsObj.rotation.y += (CLOUDS_ROTATION_SPEED * Math.PI) / 180;
          requestAnimationFrame(rotateClouds);
        };
        rotateClouds();
      });
    }
  }, []);


  // Labels and data for the globe
  const labelsData = (favorites || []).map(fav => ({
    lat: fav.lat,
    lng: fav.lon,
    text: fav.name,
    size: 1.0,
    color: '#3b82f6'
  }));

  // Add current location label
  labelsData.push({
    lat: coordinates.lat,
    lng: coordinates.lon,
    text: "You are here",
    size: 1.2,
    color: '#ef4444'
  });

  const handleInteractionToggle = () => {
    setIsInteracting(!isInteracting);
    if (showInteractionTip) setShowInteractionTip(false);
  };


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
  const starsUrl = "//unpkg.com/three-globe/example/img/night-sky.png";

  return (
    <Card className="w-full overflow-hidden flex flex-col border-border/50 bg-card/40 backdrop-blur-md shadow-xl transition-all duration-500 hover:shadow-primary/5">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-transparent via-primary/5 to-transparent">
        <CardTitle className="text-xl flex items-center gap-2">
          <Globe2 className="h-5 w-5 text-primary animate-pulse" />
          Interactive 3D Earth
        </CardTitle>
        <div className="flex gap-2">
           <button 
            onClick={handleInteractionToggle}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              isInteracting 
                ? "bg-primary text-primary-foreground shadow-lg" 
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {isInteracting ? "Interaction Locked" : "Click to Explore"}
          </button>
        </div>
      </CardHeader>
      <CardContent className="p-0 relative group">
        {!isInteracting && showInteractionTip && (
           <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none transition-opacity duration-1000">
             <div className="bg-black/60 backdrop-blur-md text-white text-[10px] px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
               Tap 'Explore' to rotate and zoom
             </div>
           </div>
        )}

        <div 
          ref={containerRef} 
          className="w-full h-[320px] sm:h-[400px] lg:h-[450px] flex justify-center items-center cursor-grab active:cursor-grabbing overflow-hidden relative"
          style={{ 
            background: isDark ? 'radial-gradient(circle at center, #1e293b 0%, #020617 100%)' : 'radial-gradient(circle at center, #f8fafc 0%, #e2e8f0 100%)',
          }}
        >
          {/* Forced CSS to ensure canvas respects scroll when not interacting */}
          <style dangerouslySetInnerHTML={{ __html: `
            .globe-container canvas { 
              touch-action: ${isInteracting ? 'none' : 'pan-y'} !important;
              pointer-events: ${isInteracting ? 'auto' : 'none'} !important;
            }
          `}} />

          {/* Interaction Guard Overlay */}
          <div 
            className={`absolute inset-0 z-10 transition-colors duration-500 ${isInteracting ? "pointer-events-none" : "bg-black/0 cursor-default"}`}
            onMouseDown={() => !isInteracting && setShowInteractionTip(true)}
          />

          {dimensions.width > 0 && (
            <div className="globe-container">
              <Globe
                ref={globeEl}
                width={dimensions.width}
                height={dimensions.height}
                globeImageUrl={globeImageUrl}
                bumpImageUrl={bumpImageUrl}
                backgroundImageUrl={isDark ? starsUrl : undefined}
                // Data mappings
                ringsData={ringsData}
                ringColor={(d: any) => d.color}
                ringMaxRadius={(d: any) => d.maxR}
                ringPropagationSpeed={(d: any) => d.propagationSpeed}
                ringRepeatPeriod={(d: any) => d.repeatPeriod}
                // Labels
                labelsData={labelsData}
                labelLat={(d: any) => d.lat}
                labelLng={(d: any) => d.lng}
                labelText={(d: any) => d.text}
                labelSize={(d: any) => d.size}
                labelDotRadius={0.5}
                labelColor={(d: any) => d.color}
                onLabelClick={(label: any) => {
                  navigate(`/city/${encodeURIComponent(label.text)}?lat=${label.lat}&lon=${label.lng}`);
                }}
                // Atmosphere
                atmosphereColor={isDark ? "#3b82f6" : "#4fc3f7"}
                atmosphereAltitude={0.2}
                backgroundColor="rgba(0,0,0,0)" 
              />
            </div>
          )}
        </div>
        
        <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2">
          <div className="bg-background/80 backdrop-blur-sm p-2 rounded-lg border border-border/50 text-[10px] space-y-1 shadow-lg">
            <div className="flex items-center gap-2 text-muted-foreground uppercase tracking-tight font-bold">
              <div className="w-2 h-2 rounded-full bg-[#ef4444]" />
              Current Location
            </div>
            <div className="flex items-center gap-2 text-muted-foreground uppercase tracking-tight font-bold">
              <div className="w-2 h-2 rounded-full bg-[#3b82f6]" />
              Favorite Cities
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

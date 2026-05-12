import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Camera, LocateFixed, Loader2, PlayCircle } from "lucide-react";
import type { Coordinates } from "@/api/types";
import { memo, useState, useEffect } from "react";
import { Button } from "./ui/button";
import { useGeolocation } from "@/hooks/use-geolocation";
import { motion } from "framer-motion";

interface CityWebcamsProps {
  coordinates: Coordinates;
  locationName?: string;
}

export const CityWebcams = memo(function CityWebcams({ coordinates, locationName }: CityWebcamsProps) {
  const [activeCoords, setActiveCoords] = useState<Coordinates>(coordinates);
  const [isLoaded, setIsLoaded] = useState(false);
  const [waitingForLocate, setWaitingForLocate] = useState(false);
  const { coordinates: userCoords, getLocation, isLoading: isLocating } = useGeolocation();

  // If props.coordinates change (e.g., user searches new city), reset to those
  useEffect(() => {
    setActiveCoords(coordinates);
    setIsLoaded(false); // Reset to save bandwidth when switching cities
  }, [coordinates]);

  const handleLocateMe = () => {
    if (userCoords) {
      // Force an update with a new object reference just in case
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

  return (
    <Card className="w-full overflow-hidden border-border/50 bg-card/40 backdrop-blur-md">
      <CardHeader className="flex flex-row items-center justify-between pb-4 shrink-0">
        <div className="space-y-1">
          <CardTitle className="text-xl flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            Live City Webcams
          </CardTitle>
          <p className="text-xs text-muted-foreground hidden sm:block">
            Immersive live views around {locationName || "your location"}
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
      
      <CardContent className="p-0">
        <div className="h-[400px] w-full relative bg-muted/20 overflow-hidden">
          {!isLoaded ? (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gradient-to-br from-muted/80 to-background/95 backdrop-blur-sm border-t border-border/50">
               {/* Decorative background pattern */}
               <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
               
               <motion.div 
                 whileHover={{ scale: 1.05 }}
                 whileTap={{ scale: 0.95 }}
               >
                 <Button 
                   size="lg" 
                   className="rounded-full shadow-xl gap-3 h-14 px-8 text-base bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
                   onClick={() => setIsLoaded(true)}
                 >
                   <PlayCircle className="h-6 w-6" />
                   Load Interactive Cameras
                 </Button>
               </motion.div>
               <p className="text-xs text-muted-foreground mt-5 max-w-xs text-center font-medium">
                 Click to load the live map. This helps save your bandwidth and battery until you're ready to explore.
               </p>
            </div>
          ) : (
            <iframe
              key={`${activeCoords.lat}-${activeCoords.lon}`}
              width="100%"
              height="100%"
              src={`https://embed.windy.com/embed2.html?lat=${activeCoords.lat}&lon=${activeCoords.lon}&zoom=11&level=surface&overlay=webcams&menu=bottom&message=true&marker=true&calendar=default&city=&type=map&location=coordinates&detail=&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1`}
              frameBorder="0"
              title={`Live Webcams in ${locationName || 'this area'}`}
              allowFullScreen
              className="animate-in fade-in duration-700"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
});

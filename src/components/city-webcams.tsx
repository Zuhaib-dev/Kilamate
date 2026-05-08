import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Camera } from "lucide-react";
import type { Coordinates } from "@/api/types";
import { memo } from "react";

interface CityWebcamsProps {
  coordinates: Coordinates;
  locationName?: string;
}

export const CityWebcams = memo(function CityWebcams({ coordinates, locationName }: CityWebcamsProps) {
  return (
    <Card className="w-full overflow-hidden border-border/50 bg-card/40 backdrop-blur-md">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="space-y-1">
          <CardTitle className="text-xl flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            Live City Webcams
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Immersive live views around {locationName || "your location"}
          </p>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[400px] w-full relative bg-muted/30">
          <iframe
            width="100%"
            height="100%"
            src={`https://embed.windy.com/embed2.html?lat=${coordinates.lat}&lon=${coordinates.lon}&zoom=11&level=surface&overlay=webcams&menu=&message=true&marker=true&calendar=now&city=&type=map&location=coordinates&detail=&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1`}
            frameBorder="0"
            title={`Live Webcams in ${locationName || 'this area'}`}
            loading="lazy"
            allowFullScreen
          />
        </div>
      </CardContent>
    </Card>
  );
});

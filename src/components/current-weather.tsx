import { Card, CardContent } from "./ui/card";
import { ArrowDown, ArrowUp, Droplets, Wind } from "lucide-react";
import type { WeatherData, GeocodingResponse } from "@/api/types";
import { usePreferences } from "@/hooks/use-preferences";
import { formatTemperature, formatWindSpeed } from "@/lib/units";
import { useTranslation } from "react-i18next";
import { translateCityName, translateStateName } from "@/lib/translate-city";

interface CurrentWeatherProps {
  data: WeatherData;
  locationName?: GeocodingResponse;
}

import { memo } from "react";

export const CurrentWeather = memo(function CurrentWeather({ data, locationName }: CurrentWeatherProps) {
  const { temperatureUnit, windSpeedUnit, language } = usePreferences();
  const { t } = useTranslation();

  const {
    weather: [currentWeather],
    main: { temp, feels_like, temp_min, temp_max, humidity },
    wind: { speed },
  } = data;

  // Format temperature with user's preferred unit
  const formatTemp = (temp: number) => formatTemperature(temp, temperatureUnit);

  // Dynamically generating the image URL
  const weatherIconUrl = `https://openweathermap.org/img/wn/${currentWeather.icon}@4x.png`;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center">
                <h2 className="text-2xl font-bold tracking-tight">
                  {translateCityName(locationName?.name || '', language)}
                </h2>
                {locationName?.state && (
                  <span className="text-muted-foreground">
                    , {translateStateName(locationName.state, language)}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {locationName?.country}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <p className="text-6xl font-bold tracking-tighter">
                {formatTemp(temp)}
              </p>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {t('weather.feelsLike')} {formatTemp(feels_like)}
                </p>
                <div className="flex gap-2 text-sm font-medium">
                  <span className="flex items-center gap-1 text-blue-500">
                    <ArrowDown className="h-3 w-3" />
                    {formatTemp(temp_min)}
                  </span>
                  <span className="flex items-center gap-1 text-red-500">
                    <ArrowUp className="h-3 w-3" />
                    {formatTemp(temp_max)}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-blue-500" />
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">{t('weather.humidity')}</p>
                  <p className="text-sm text-muted-foreground">{humidity}%</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="h-4 w-4 text-blue-500" />
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">{t('weather.windSpeed')}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatWindSpeed(speed, windSpeedUnit)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center">
            <div className="relative flex aspect-square w-full max-w-[200px] items-center justify-center">
              <img
                src={weatherIconUrl}
                alt={currentWeather.description}
                className="h-full w-full object-contain"
                {...({ fetchpriority: "high" } as React.ImgHTMLAttributes<HTMLImageElement>)}
                loading="eager"
                width="200"
                height="200"
                decoding="async"
              />
              <div className="absolute bottom-0 text-center">
                <p className="text-sm font-medium capitalize">
                  {currentWeather.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
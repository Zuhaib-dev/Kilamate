import { Card, CardContent } from "./ui/card";
import { Sparkles, Bot } from "lucide-react";
import type { WeatherData, ForecastData, AirPollutionData } from "@/api/types";
import { memo, useMemo, useState, useEffect } from "react";

interface AIBriefingProps {
  weather: WeatherData;
  forecast?: ForecastData;
  airPollution?: AirPollutionData;
}

function generateBriefing(weather: WeatherData, forecast?: ForecastData, aqiData?: AirPollutionData) {
  const currentHour = new Date().getHours();
  let greeting = "Good evening";
  if (currentHour < 12) greeting = "Good morning";
  else if (currentHour < 17) greeting = "Good afternoon";

  const temp = Math.round(weather.main.temp);
  const desc = weather.weather[0].description;
  const isRaining = weather.weather[0].main.toLowerCase().includes("rain") || weather.weather[0].main.toLowerCase().includes("drizzle");
  
  let tempAdjective = "comfortable";
  if (temp < 5) tempAdjective = "freezing";
  else if (temp < 15) tempAdjective = "chilly";
  else if (temp > 30) tempAdjective = "hot";
  else if (temp > 25) tempAdjective = "warm";

  let text = `${greeting}! It's currently a ${tempAdjective} ${temp}°C with ${desc}. `;

  if (isRaining) {
    text += "You'll definitely want an umbrella if you're heading out. ";
  } else if (temp < 15) {
    text += "Grab a jacket to stay warm today. ";
  } else if (temp > 28 && weather.weather[0].main === "Clear") {
    text += "Don't forget your sunglasses and sunscreen today! ";
  } else if (temp >= 15 && temp <= 25 && !isRaining) {
    text += "It's gorgeous outside, great weather for a walk. ";
  }

  // Forecast context (next 12 hours)
  if (forecast && forecast.list.length > 0) {
    const next12Hours = forecast.list.slice(0, 4); // 3-hour intervals, 4 items = 12 hours
    const maxUpcomingTemp = Math.max(...next12Hours.map(f => f.main.temp));
    const minUpcomingTemp = Math.min(...next12Hours.map(f => f.main.temp));
    const willRain = next12Hours.some(f => f.weather[0].main.toLowerCase().includes("rain"));
    
    if (!isRaining && willRain) {
      text += "Expect some rain later today, so plan your outdoor activities accordingly. ";
    } else if (maxUpcomingTemp > temp + 3) {
      text += `Temperatures are expected to rise to around ${Math.round(maxUpcomingTemp)}°C later. `;
    } else if (minUpcomingTemp < temp - 3) {
      text += `It's going to cool down to around ${Math.round(minUpcomingTemp)}°C, so bundle up if you're out late. `;
    }
  }

  // AQI context
  if (aqiData && aqiData.list.length > 0) {
    const aqi = aqiData.list[0].main.aqi;
    if (aqi === 1 || aqi === 2) {
      text += "The air quality is excellent right now—a perfect time to open the windows or go for a run.";
    } else if (aqi === 4 || aqi === 5) {
      text += "Heads up: the air quality is poor today. Consider limiting intense outdoor activities.";
    }
  }

  return text.trim();
}

export const AIWeatherBriefing = memo(function AIWeatherBriefing({ weather, forecast, airPollution }: AIBriefingProps) {
  const briefingText = useMemo(() => {
    return generateBriefing(weather, forecast, airPollution);
  }, [weather, forecast, airPollution]);

  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    setDisplayedText("");
    setIsTyping(true);
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(briefingText.slice(0, i + 1));
      i++;
      if (i > briefingText.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 25); // typing speed
    return () => clearInterval(interval);
  }, [briefingText]);

  return (
    <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card shadow-sm">
       {/* Animated Accent */}
       <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-primary/30" />
       
       <CardContent className="p-5 pl-6">
         <div className="flex gap-4 items-start">
            <div className="mt-1 p-2.5 bg-primary/15 rounded-xl shadow-inner relative">
              <Bot className="h-5 w-5 text-primary" />
              <Sparkles className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 text-primary animate-pulse" />
            </div>
            <div className="flex-1 space-y-1.5">
              <h3 className="text-[13px] font-black uppercase tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60 flex items-center gap-2">
                Live Intelligence Briefing
              </h3>
              <p className="text-sm md:text-base text-foreground/90 leading-relaxed font-medium min-h-[48px]">
                {displayedText}
                {isTyping && <span className="inline-block w-1.5 h-4 ml-0.5 align-middle bg-primary animate-pulse" />}
              </p>
            </div>
         </div>
       </CardContent>
    </Card>
  );
});

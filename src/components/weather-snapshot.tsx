import { forwardRef } from "react";
import { formatTemperature } from "@/lib/units";
import { format } from "date-fns";
import { Droplets, Wind, MapPin } from "lucide-react";
import type { WeatherData } from "@/api/types";
import type { TemperatureUnit } from "@/hooks/use-preferences";

interface WeatherSnapshotProps {
  weather: WeatherData;
  locationName: string;
  temperatureUnit: TemperatureUnit;
}

function getGradientByWeather(id: number, isDay: boolean): string {
  if (!isDay) {
    return "bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#020617]"; // Night
  }
  if (id >= 200 && id < 300) return "bg-gradient-to-br from-[#1e293b] via-[#334155] to-[#0f172a]"; // Thunderstorm
  if (id >= 300 && id < 600) return "bg-gradient-to-br from-[#475569] via-[#64748b] to-[#334155]"; // Rain
  if (id >= 600 && id < 700) return "bg-gradient-to-br from-[#94a3b8] via-[#cbd5e1] to-[#e2e8f0]"; // Snow
  if (id >= 700 && id < 800) return "bg-gradient-to-br from-[#64748b] via-[#94a3b8] to-[#cbd5e1]"; // Haze/Mist
  if (id === 800)             return "bg-gradient-to-br from-[#38bdf8] via-[#0ea5e9] to-[#0284c7]"; // Clear
  return "bg-gradient-to-br from-[#7dd3fc] via-[#38bdf8] to-[#0ea5e9]"; // Clouds
}

export const WeatherSnapshot = forwardRef<HTMLDivElement, WeatherSnapshotProps>(
  ({ weather, locationName, temperatureUnit }, ref) => {
    const {
      weather: [currentWeather],
      main: { temp, temp_max, temp_min, humidity },
      wind: { speed },
      sys: { sunrise, sunset },
    } = weather;

    const formatTemp = (t: number) => formatTemperature(t, temperatureUnit);
    const weatherIconUrl = `https://openweathermap.org/img/wn/${currentWeather.icon}@4x.png`;
    
    const now = new Date().getTime() / 1000;
    const isDay = now > sunrise && now < sunset;
    const gradient = getGradientByWeather(currentWeather.id, isDay);
    const isLightBackground = currentWeather.id >= 600 && currentWeather.id < 800 && isDay;
    const textColor = isLightBackground ? "text-slate-900" : "text-white";
    const subtextColor = isLightBackground ? "text-slate-700" : "text-slate-200";
    const borderColor = isLightBackground ? "border-slate-900/10" : "border-white/10";
    const glassBg = isLightBackground ? "bg-white/40" : "bg-black/20";

    return (
      <div
        ref={ref}
        className={`w-[1080px] h-[1080px] ${gradient} ${textColor} flex flex-col items-center justify-between p-24 font-sans overflow-hidden relative`}
        style={{
          position: "absolute",
          left: "-9999px",
          top: 0,
        }}
      >
        {/* Decorative elements */}
        <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-white/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-150px] left-[-150px] w-[600px] h-[600px] bg-black/10 blur-[150px] rounded-full pointer-events-none" />

        {/* Top Section */}
        <div className="w-full flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-3xl ${glassBg} backdrop-blur-xl border ${borderColor} shadow-2xl`}>
              <MapPin className="w-12 h-12" />
            </div>
            <div>
              <h1 className="text-5xl font-black tracking-tight">{locationName}</h1>
              <p className={`text-2xl font-bold uppercase tracking-widest mt-2 ${subtextColor}`}>
                {format(new Date(), "EEEE, MMMM do")}
              </p>
            </div>
          </div>
          <div className={`px-6 py-3 rounded-full ${glassBg} backdrop-blur-md border ${borderColor}`}>
            <span className="text-xl font-bold uppercase tracking-widest">
              Kilamate Weather
            </span>
          </div>
        </div>

        {/* Middle Section */}
        <div className="flex flex-col items-center justify-center z-10 w-full flex-1 my-16">
          <div className={`w-full max-w-[800px] rounded-[3rem] ${glassBg} backdrop-blur-2xl border ${borderColor} p-16 shadow-2xl flex items-center justify-between`}>
            <div className="flex flex-col">
              <span className="text-[12rem] font-black leading-none tracking-tighter" style={{ textShadow: "0 20px 40px rgba(0,0,0,0.15)" }}>
                {formatTemp(temp)}
              </span>
              <p className="text-4xl font-bold capitalize mt-4 tracking-tight">
                {currentWeather.description}
              </p>
              <div className={`flex items-center gap-6 mt-8 text-2xl font-bold ${subtextColor}`}>
                <span className="flex items-center gap-2">
                  H: {formatTemp(temp_max)}
                </span>
                <span className="w-2 h-2 rounded-full bg-current opacity-30" />
                <span className="flex items-center gap-2">
                  L: {formatTemp(temp_min)}
                </span>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full transform scale-150" />
              <img
                src={weatherIconUrl}
                alt={currentWeather.description}
                className="w-80 h-80 object-contain relative z-10 drop-shadow-[0_20px_30px_rgba(0,0,0,0.3)]"
                style={{ filter: "brightness(1.1) contrast(1.1)" }}
              />
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="w-full flex items-center justify-center gap-12 z-10">
          <div className={`flex items-center gap-6 px-10 py-6 rounded-3xl ${glassBg} backdrop-blur-xl border ${borderColor}`}>
            <Droplets className="w-10 h-10" />
            <div>
              <p className={`text-xl font-bold uppercase tracking-wider ${subtextColor}`}>Humidity</p>
              <p className="text-3xl font-black">{humidity}%</p>
            </div>
          </div>
          <div className={`flex items-center gap-6 px-10 py-6 rounded-3xl ${glassBg} backdrop-blur-xl border ${borderColor}`}>
            <Wind className="w-10 h-10" />
            <div>
              <p className={`text-xl font-bold uppercase tracking-wider ${subtextColor}`}>Wind</p>
              <p className="text-3xl font-black">{Math.round(speed * 3.6)} km/h</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

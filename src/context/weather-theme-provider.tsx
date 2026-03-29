import React, { createContext, useContext, useState } from "react";

export type WeatherTheme = 
  | "default" 
  | "clear-day" 
  | "clear-night" 
  | "clouds" 
  | "rain" 
  | "drizzle" 
  | "thunderstorm" 
  | "snow" 
  | "mist";

interface WeatherThemeState {
  theme: WeatherTheme;
  setWeatherTheme: (theme: WeatherTheme) => void;
  setThemeByCondition: (id: number, isDay: boolean) => void;
}

const WeatherThemeContext = createContext<WeatherThemeState | undefined>(undefined);

export function WeatherThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<WeatherTheme>("default");

  const setThemeByCondition = (id: number, isDay: boolean) => {
    if (id === 800) {
      setTheme(isDay ? "clear-day" : "clear-night");
    } else if (id >= 801 && id <= 804) {
      setTheme("clouds");
    } else if (id >= 500 && id <= 531) {
      setTheme("rain");
    } else if (id >= 300 && id <= 321) {
      setTheme("drizzle");
    } else if (id >= 200 && id <= 232) {
      setTheme("thunderstorm");
    } else if (id >= 600 && id <= 622) {
      setTheme("snow");
    } else if (id >= 701 && id <= 781) {
      setTheme("mist");
    } else {
      setTheme("default");
    }
  };

  return (
    <WeatherThemeContext.Provider value={{ theme, setWeatherTheme: setTheme, setThemeByCondition }}>
      {children}
    </WeatherThemeContext.Provider>
  );
}

export function useWeatherTheme() {
  const context = useContext(WeatherThemeContext);
  if (!context) {
    throw new Error("useWeatherTheme must be used within a WeatherThemeProvider");
  }
  return context;
}

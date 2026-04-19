import type { WeatherData } from "@/api/types";

export const JK_CITIES = [
  "srinagar", "baramulla", "anantnag", "pulwama", "kupwara", "shopian", "bandipora", "ganderbal", "budgam", "kulgam",
  "jammu", "udhampur", "rajouri", "poonch", "doda", "ramban", "kishtwar", "reasi", "samba", "kathua",
  "leh", "kargil",
];

export function isInJandK(weather: WeatherData): boolean {
  if (!weather) return false;
  const name = weather.name.toLowerCase();
  
  // Check by city name
  if (JK_CITIES.some(c => name.includes(c))) return true;
  
  // Check by coordinates (Rough bounding box for J&K and Ladakh)
  const { lat, lon } = weather.coord;
  return lat > 32 && lat < 37.5 && lon > 73 && lon < 80;
}

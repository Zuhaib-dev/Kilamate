import type { WeatherData, AirPollutionResponse, ForecastData } from "@/api/types";

/**
 * Estimates UV Index based on weather condition and time of day.
 * Reused from ClothingAdvisor logic but generalized.
 */
export function estimateUVI(data: WeatherData): number {
  const { weather, dt, sys } = data;
  const conditionId = weather[0]?.id ?? 800;
  
  const isDay = sys.sunrise && sys.sunset && dt >= sys.sunrise && dt <= sys.sunset;
  if (!isDay || sys.sunset <= sys.sunrise) return 0;

  const solarArc = Math.sin(((dt - sys.sunrise) / (sys.sunset - sys.sunrise)) * Math.PI);
  let cloudFactor = 1;

  if (conditionId >= 200 && conditionId < 300) cloudFactor = 0.05;
  else if (conditionId >= 300 && conditionId < 600) cloudFactor = 0.15;
  else if (conditionId >= 600 && conditionId < 700) cloudFactor = 0.3;
  else if (conditionId >= 700 && conditionId < 800) cloudFactor = 0.5;
  else if (conditionId === 800) cloudFactor = 1;
  else if (conditionId === 801) cloudFactor = 0.85;
  else if (conditionId <= 804) cloudFactor = 0.45;

  return Math.max(0, 10 * solarArc * cloudFactor);
}

/**
 * Calculates Apple Scab risk (Simplified Mills Period)
 */
export function getScabRisk(temp: number, humidity: number, condition: string) {
  const isRaining = ["rain", "drizzle"].includes(condition.toLowerCase());
  if (temp < 2 || temp > 30) return { level: 0, label: "None" };
  
  const wetCondition = isRaining || humidity >= 90;
  const inRange = temp >= 6 && temp <= 24;

  if (inRange && wetCondition) {
    if (humidity >= 95 || (isRaining && temp >= 10 && temp <= 20))
      return { level: 3, label: "High" };
    return { level: 2, label: "Moderate" };
  }
  if (wetCondition && !inRange) return { level: 1, label: "Low" };
  return { level: 0, label: "None" };
}

/**
 * Checks for frost risk in the next 24 hours
 */
export function getFrostRisk(forecast?: ForecastData | null) {
  if (!forecast?.list?.length) return null;
  const now = Date.now() / 1000;
  const frostEntry = forecast.list.find(f => f.dt > now && f.dt < now + 86400 && f.main.temp < 3);
  if (!frostEntry) return null;

  return {
    hoursAway: Math.round((frostEntry.dt - now) / 3600),
    temp: Math.round(frostEntry.main.temp)
  };
}

/**
 * J&K District boundary check
 */
export const JK_CITIES = [
  "srinagar","baramulla","anantnag","pulwama","kupwara","shopian","bandipora","ganderbal","budgam","kulgam",
  "jammu","udhampur","rajouri","poonch","doda","ramban","kishtwar","reasi","samba","kathua",
  "leh","kargil",
];

export function isInJandK(weather: WeatherData): boolean {
  const name = weather.name.toLowerCase();
  if (JK_CITIES.some(c => name.includes(c))) return true;
  const { lat, lon } = weather.coord;
  return lat > 32 && lat < 37.5 && lon > 73 && lon < 80;
}

/**
 * Returns prioritized clothing advice based on temperature and conditions.
 */
export function getClothingAdvice(temp: number, conditionId: number) {
  if (temp < 5) return { key: "bundle", icon: "GiMonclerJacket" };
  if (temp < 15) return { key: "jacket", icon: "TbJacket" };
  if (conditionId < 600 && conditionId >= 200) return { key: "umbrella", icon: "PiUmbrellaFill" };
  if (temp > 25) return { key: "light", icon: "PiTShirtFill" };
  return { key: "comfort", icon: "PiTShirtFill" };
}

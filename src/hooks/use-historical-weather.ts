import { useQuery } from "@tanstack/react-query";
import type { Coordinates } from "@/api/types";
import { format, subYears } from "date-fns";

interface HistoricalDay {
  date: string;
  tempMax: number;
  tempMin: number;
  precipitation: number;
  windspeedMax: number;
}

export interface HistoricalAverage {
  avgTempMax: number;
  avgTempMin: number;
  avgTempMid: number;
  avgPrecipitation: number;
  avgWindspeed: number;
  yearlyData: HistoricalDay[];
}

async function fetchHistoricalWeather(
  coords: Coordinates
): Promise<HistoricalAverage> {
  const today = new Date();
  const YEARS_BACK = 5;

  // Build date ranges: same day/month for each of the past 5 years
  const dateRanges = Array.from({ length: YEARS_BACK }).map((_, i) => {
    const d = subYears(today, i + 1);
    const formatted = format(d, "yyyy-MM-dd");
    return { start: formatted, end: formatted };
  });

  // Fetch all years in parallel from Open-Meteo archive API (no API key needed)
  const responses = await Promise.all(
    dateRanges.map(({ start, end }) => {
      const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${coords.lat}&longitude=${coords.lon}&start_date=${start}&end_date=${end}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max&timezone=auto`;
      return fetch(url).then(r => r.json());
    })
  );

  // Parse each response
  const yearlyData: HistoricalDay[] = responses
    .map((res, i) => {
      const date = dateRanges[i].start;
      if (!res?.daily?.temperature_2m_max?.[0]) return null;
      return {
        date,
        tempMax: res.daily.temperature_2m_max[0] as number,
        tempMin: res.daily.temperature_2m_min[0] as number,
        precipitation: res.daily.precipitation_sum[0] as number ?? 0,
        windspeedMax: res.daily.windspeed_10m_max[0] as number ?? 0,
      };
    })
    .filter((d): d is HistoricalDay => d !== null);

  if (!yearlyData.length) throw new Error("No historical data available");

  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

  return {
    avgTempMax: Math.round(avg(yearlyData.map(d => d.tempMax)) * 10) / 10,
    avgTempMin: Math.round(avg(yearlyData.map(d => d.tempMin)) * 10) / 10,
    avgTempMid: Math.round(avg(yearlyData.map(d => (d.tempMax + d.tempMin) / 2)) * 10) / 10,
    avgPrecipitation: Math.round(avg(yearlyData.map(d => d.precipitation)) * 10) / 10,
    avgWindspeed: Math.round(avg(yearlyData.map(d => d.windspeedMax)) * 10) / 10,
    yearlyData,
  };
}

export function useHistoricalWeather(coordinates: Coordinates | null) {
  return useQuery({
    queryKey: ["historical-weather", coordinates?.lat, coordinates?.lon],
    queryFn: () => fetchHistoricalWeather(coordinates!),
    enabled: !!coordinates,
    staleTime: 1000 * 60 * 60 * 6, // Cache for 6 hours — history doesn't change!
    retry: 2,
  });
}

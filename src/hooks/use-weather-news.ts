import { useQuery } from "@tanstack/react-query";

const GNEWS_KEY = import.meta.env.VITE_GNEWS_API_KEY as string;

export interface NewsArticle {
  title: string;
  description: string;
  content: string;
  url: string;
  image: string | null;
  publishedAt: string;
  source: {
    name: string;
    url: string;
  };
}

async function fetchWeatherNews(locationName: string): Promise<NewsArticle[]> {
  // Build a smart query: location-specific + general weather/climate
  const query = `${locationName} weather OR climate OR storm OR flood OR drought`;
  const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=8&sortby=publishedAt&apikey=${GNEWS_KEY}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`GNews error: ${res.statusText}`);

  const data = await res.json();
  return (data.articles ?? []) as NewsArticle[];
}

export function useWeatherNews(locationName: string | undefined) {
  return useQuery({
    queryKey: ["weather-news", locationName],
    queryFn: () => fetchWeatherNews(locationName!),
    enabled: !!locationName && !!GNEWS_KEY,
    staleTime: 1000 * 60 * 30, // Cache 30 minutes — news doesn't refresh every second
    retry: 1,
  });
}

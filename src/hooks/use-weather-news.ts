import { useQuery } from "@tanstack/react-query";

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
  const query = `${locationName} weather OR climate OR storm OR flood OR drought`;

  // In production → call our own Netlify serverless proxy (no CORS)
  // In dev → call GNews directly (localhost is allowed)
  const isDev = import.meta.env.DEV;
  const GNEWS_KEY = import.meta.env.VITE_GNEWS_API_KEY as string;

  let url: string;
  if (isDev && GNEWS_KEY) {
    url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=8&sortby=publishedAt&apikey=${GNEWS_KEY}`;
  } else {
    // Netlify function at /.netlify/functions/news
    url = `/.netlify/functions/news?q=${encodeURIComponent(query)}`;
  }

  const res = await fetch(url);
  if (!res.ok) throw new Error(`News fetch error: ${res.statusText}`);

  const data = await res.json();
  return (data.articles ?? []) as NewsArticle[];
}

export function useWeatherNews(locationName: string | undefined) {
  return useQuery({
    queryKey: ["weather-news", locationName],
    queryFn: () => fetchWeatherNews(locationName!),
    enabled: !!locationName,
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });
}


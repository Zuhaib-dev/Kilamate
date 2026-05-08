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

async function fetchWeatherNews(locationName: string, state?: string): Promise<NewsArticle[]> {
  const baseLocation = state ? `("${locationName}" OR "${state}")` : `"${locationName}"`;
  const query = `${baseLocation} AND (weather OR climate OR storm OR flood OR drought)`;

  const isDev = import.meta.env.DEV;
  const GNEWS_KEY = import.meta.env.VITE_GNEWS_API_KEY as string;

  // Calculate 3 days ago for fresher news
  const fromDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();

  let url: string;
  if (isDev && GNEWS_KEY) {
    url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=8&sortby=publishedAt&from=${fromDate}&apikey=${GNEWS_KEY}`;
  } else {
    // Netlify function at /.netlify/functions/news
    url = `/.netlify/functions/news?q=${encodeURIComponent(query)}&from=${fromDate}`;
  }

  const res = await fetch(url);
  if (!res.ok) throw new Error(`News fetch error: ${res.statusText}`);

  const data = await res.json();
  return (data.articles ?? []) as NewsArticle[];
}

export function useWeatherNews(locationName: string | undefined, state?: string) {
  return useQuery({
    queryKey: ["weather-news", locationName, state],
    queryFn: () => fetchWeatherNews(locationName!, state),
    enabled: !!locationName,
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });
}


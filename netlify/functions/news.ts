import type { Handler, HandlerEvent } from "@netlify/functions";

const GNEWS_KEY = process.env.VITE_GNEWS_API_KEY;

export const handler: Handler = async (event: HandlerEvent) => {
  const query = event.queryStringParameters?.q;

  if (!query) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing query parameter 'q'" }),
    };
  }

  if (!GNEWS_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "GNews API key not configured on server" }),
    };
  }

  const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=8&sortby=publishedAt&apikey=${GNEWS_KEY}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      return {
        statusCode: res.status,
        body: JSON.stringify({ error: `GNews responded with ${res.status}` }),
      };
    }
    const data = await res.json();
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch from GNews" }),
    };
  }
};

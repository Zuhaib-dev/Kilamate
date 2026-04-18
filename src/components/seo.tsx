import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    ogImage?: string;
    ogType?: string;
    canonicalUrl?: string;
    structuredData?: object | object[];
}

export function SEO({
    title = "Kilamate | Weather Forecast in Jammu & Kashmir",
    description = "Get accurate weather forecasts, real-time Air Quality Index (AQI), and a specialized Kashmir Apple Farming Advisory for Jammu & Kashmir with Kilamate.",
    keywords = "Weather in Srinagar, AQI in Srinagar, Air Quality Index Jammu Kashmir, Jammu Kashmir weather forecast, live weather J&K, Kilamate weather app, Zuhaib Rashid, real-time AQI, Agriculture Advisor J&K, Kashmir Apple Farming, SKUAST Spray Schedule, Apple Scab Risk",
    ogImage = "https://www.zuhaibrashid.com/SEO.png",
    ogType = "website",
    canonicalUrl = "https://kilamate.netlify.app/",
    structuredData,
}: SEOProps) {
    const { i18n } = useTranslation();

    return (
        <Helmet>
            {/* HTML Language Sync */}
            <html lang={i18n.language} />

            {/* Primary Meta Tags */}
            <title>{title}</title>
            <meta name="title" content={title} />
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            <meta name="author" content="Zuhaib Rashid" />
            <meta name="publisher" content="Kilamate" />
            <meta name="robots" content="index, follow" />
            
            {/* Theme Colors */}
            <meta name="theme-color" content="#09090b" media="(prefers-color-scheme: dark)" />
            <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />

            {/* Canonical URL */}
            <link rel="canonical" href={canonicalUrl} />

            {/* Apple / PWA */}
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="default" />
            <meta name="apple-mobile-web-app-title" content="Kilamate" />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={ogType} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={ogImage} />
            <meta property="og:site_name" content="Kilamate Weather" />
            <meta property="og:locale" content={i18n.language === 'en' ? 'en_US' : i18n.language === 'hi' ? 'hi_IN' : 'ur_PK'} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={canonicalUrl} />
            <meta property="twitter:title" content={title} />
            <meta property="twitter:description" content={description} />
            <meta property="twitter:image" content={ogImage} />
            <meta name="twitter:creator" content="@xuhaib_x9" />

            {/* Structured Data */}
            {structuredData && (
                <script type="application/ld+json">
                    {Array.isArray(structuredData) 
                        ? JSON.stringify(structuredData.map(s => ({ ...s })))
                        : JSON.stringify(structuredData)
                    }
                </script>
            )}
        </Helmet>
    );
}

// --- Schema Templates ---

export const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Kilamate",
    "url": "https://kilamate.netlify.app",
    "logo": "https://www.zuhaibrashid.com/SEO.png",
    "sameAs": ["https://www.zuhaibrashid.com"]
};

export const webApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Kilamate Weather App",
    "url": "https://kilamate.netlify.app",
    "applicationCategory": "WeatherApplication",
    "operatingSystem": "Any"
};

/**
 * Creates a breadcrumb schema for search engines
 */
export const createBreadcrumbSchema = (items: { name: string; item: string }[]) => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        "item": item.item
    }))
});

/**
 * Creates a localized Weather Forecast schema for rich snippets
 */
export const createWeatherSchema = (
    city: string, 
    country: string, 
    temp: number, 
    condition: string, 
    lat: number, 
    lon: number,
    humidity?: number,
    windSpeed?: number,
    aqi?: number
) => ({
    "@context": "https://schema.org",
    "@type": "Place",
    "name": city,
    "geo": {
        "@type": "GeoCoordinates",
        "latitude": lat,
        "longitude": lon
    },
    "mainEntity": {
        "@type": "WeatherReport",
        "name": `Weather in ${city}`,
        "description": `Current weather condition in ${city} is ${condition} with a temperature of ${temp}°C.`,
        "url": `https://kilamate.netlify.app/?lat=${lat}&lon=${lon}`,
        "datePublished": new Date().toISOString(),
        "temperature": {
            "@type": "QuantitativeValue",
            "value": temp,
            "unitCode": "CEL"
        },
        "humidity": humidity ? `${humidity}%` : undefined,
        "windSpeed": windSpeed ? {
            "@type": "QuantitativeValue",
            "value": Math.round(windSpeed * 3.6 * 10) / 10,
            "unitCode": "KMH"
        } : undefined,
        "airQualityIndex": aqi,
        "address": {
            "@type": "PostalAddress",
            "addressLocality": city,
            "addressCountry": country
        }
    }
});

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
    title = "Kilamate | Premium Weather Forecast in Jammu & Kashmir",
    description = "Kilamate provides ultra-accurate weather forecasts, real-time Air Quality Index (AQI), and specialized Agriculture advisories for Jammu & Kashmir. Stay ahead with live weather insights and Kashmir Apple farming guides.",
    keywords = "Weather in Srinagar, AQI Srinagar, Air Quality Index Jammu Kashmir, J&K weather forecast, live weather J&K, Kilamate weather app, Zuhaib Rashid, real-time AQI, Agriculture Advisor J&K, Kashmir Apple Farming, SKUAST Spray Schedule, Apple Scab Risk, Weather Forecast Kashmir, Srinagar Weather Update",
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
            <meta name="robots" content="index, follow, max-image-preview:large" />
            <meta name="language" content={i18n.language === 'en' ? 'English' : i18n.language === 'hi' ? 'Hindi' : 'Urdu'} />
            
            {/* Theme Colors */}
            <meta name="theme-color" content="#09090b" media="(prefers-color-scheme: dark)" />
            <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />

            {/* Canonical URL */}
            <link rel="canonical" href={canonicalUrl} />

            {/* Apple / PWA */}
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
            <meta name="apple-mobile-web-app-title" content="Kilamate" />
            <meta name="mobile-web-app-capable" content="yes" />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={ogType} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={ogImage} />
            <meta property="og:image:secure_url" content={ogImage} />
            <meta property="og:image:alt" content="Kilamate Weather App Interface" />
            <meta property="og:image:type" content="image/png" />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:site_name" content="Kilamate Weather" />
            <meta property="og:locale" content={i18n.language === 'en' ? 'en_US' : i18n.language === 'hi' ? 'hi_IN' : 'ur_PK'} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={canonicalUrl} />
            <meta property="twitter:title" content={title} />
            <meta property="twitter:description" content={description} />
            <meta property="twitter:image" content={ogImage} />
            <meta property="twitter:image:alt" content="Kilamate Weather App Interface" />
            <meta name="twitter:site" content="@xuhaib_x9" />
            <meta name="twitter:creator" content="@xuhaib_x9" />

            {/* Extra Meta */}
            <meta name="format-detection" content="telephone=no, address=no, email=no" />

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

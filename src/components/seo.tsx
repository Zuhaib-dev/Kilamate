import { Helmet } from "react-helmet-async";

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    ogImage?: string;
    ogType?: string;
    canonicalUrl?: string;
    structuredData?: object;
}

export function SEO({
    title = "Kilamate | Weather Forecast in Jammu & Kashmir",
    description = "Get accurate weather forecasts and real-time Air Quality Index (AQI) for all districts of Jammu & Kashmir including Srinagar, Budgam, Baramulla, Pulwama, Anantnag, Kupwara, Ganderbal, Shopian, Bandipora, Kulgam, Chadoora and more with Kilamate weather app.",
    keywords = "Weather in Srinagar, AQI in Srinagar, Air Quality Index Jammu Kashmir, Weather in Budgam, Weather in Chadoora, Weather in Baramulla, Weather in Pulwama, Weather in Anantnag, Weather in Kupwara, Weather in Ganderbal, Weather in Shopian, Weather in Bandipora, Weather in Kulgam, Jammu Kashmir weather forecast, live weather J&K, Kilamate weather app, Zuhaib Rashid, real-time AQI, pollution levels",
    ogImage = "https://www.zuhaibrashid.com/SEO.png",
    ogType = "website",
    canonicalUrl = "https://kilamate.netlify.app/",
    structuredData,
}: SEOProps) {
    return (
        <Helmet>
            {/* Primary Meta Tags */}
            <title>{title}</title>
            <meta name="title" content={title} />
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />

            {/* Canonical URL */}
            <link rel="canonical" href={canonicalUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={ogType} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={ogImage} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={canonicalUrl} />
            <meta property="twitter:title" content={title} />
            <meta property="twitter:description" content={description} />
            <meta property="twitter:image" content={ogImage} />

            {/* Structured Data */}
            {structuredData && (
                <script type="application/ld+json">
                    {JSON.stringify(structuredData)}
                </script>
            )}
        </Helmet>
    );
}

// Structured Data Templates
export const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Kilamate",
    "url": "https://kilamate.netlify.app",
    "logo": "https://www.zuhaibrashid.com/SEO.png",
    "description": "Weather forecasting application for Jammu & Kashmir",
    "founder": {
        "@type": "Person",
        "name": "Zuhaib Rashid"
    },
    "sameAs": [
        "https://www.zuhaibrashid.com"
    ]
};

export const webApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Kilamate Weather App",
    "url": "https://kilamate.netlify.app",
    "applicationCategory": "Weather",
    "operatingSystem": "Any",
    "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
    },
    "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "150"
    }
};

export const createCitySchema = (cityName: string, lat: number, lon: number) => ({
    "@context": "https://schema.org",
    "@type": "Place",
    "name": cityName,
    "geo": {
        "@type": "GeoCoordinates",
        "latitude": lat,
        "longitude": lon
    },
    "address": {
        "@type": "PostalAddress",
        "addressRegion": "Jammu and Kashmir",
        "addressCountry": "IN"
    }
});

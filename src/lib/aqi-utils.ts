export interface PollutantData {
    pm2_5: number;
    pm10: number;
    o3: number;
    no2: number;
    so2: number;
    co: number;
}

interface AQIBreakpoint {
    low: number;
    high: number;
    aqiLow: number;
    aqiHigh: number;
}

// US EPA AQI Breakpoints (truncated for key pollutants)
const BREAKPOINTS: Record<keyof PollutantData, AQIBreakpoint[]> = {
    pm2_5: [
        { low: 0, high: 12, aqiLow: 0, aqiHigh: 50 },
        { low: 12.1, high: 35.4, aqiLow: 51, aqiHigh: 100 },
        { low: 35.5, high: 55.4, aqiLow: 101, aqiHigh: 150 },
        { low: 55.5, high: 150.4, aqiLow: 151, aqiHigh: 200 },
        { low: 150.5, high: 250.4, aqiLow: 201, aqiHigh: 300 },
        { low: 250.5, high: 500.4, aqiLow: 301, aqiHigh: 500 },
    ],
    pm10: [
        { low: 0, high: 54, aqiLow: 0, aqiHigh: 50 },
        { low: 55, high: 154, aqiLow: 51, aqiHigh: 100 },
        { low: 155, high: 254, aqiLow: 101, aqiHigh: 150 },
        { low: 255, high: 354, aqiLow: 151, aqiHigh: 200 },
        { low: 355, high: 424, aqiLow: 201, aqiHigh: 300 },
        { low: 425, high: 604, aqiLow: 301, aqiHigh: 500 },
    ],
    o3: [
        { low: 0, high: 54, aqiLow: 0, aqiHigh: 50 },
        { low: 55, high: 70, aqiLow: 51, aqiHigh: 100 },
        { low: 71, high: 85, aqiLow: 101, aqiHigh: 150 },
        { low: 86, high: 105, aqiLow: 151, aqiHigh: 200 },
        { low: 106, high: 200, aqiLow: 201, aqiHigh: 300 },
    ],
    no2: [
        { low: 0, high: 53, aqiLow: 0, aqiHigh: 50 },
        { low: 54, high: 100, aqiLow: 51, aqiHigh: 100 },
        { low: 101, high: 360, aqiLow: 101, aqiHigh: 150 },
        { low: 361, high: 649, aqiLow: 151, aqiHigh: 200 },
        { low: 650, high: 1249, aqiLow: 201, aqiHigh: 300 },
    ],
    so2: [
        { low: 0, high: 35, aqiLow: 0, aqiHigh: 50 },
        { low: 36, high: 75, aqiLow: 51, aqiHigh: 100 },
        { low: 76, high: 185, aqiLow: 101, aqiHigh: 150 },
        { low: 186, high: 304, aqiLow: 151, aqiHigh: 200 },
        { low: 305, high: 604, aqiLow: 201, aqiHigh: 300 },
    ],
    co: [
        { low: 0, high: 4.4, aqiLow: 0, aqiHigh: 50 },
        { low: 4.5, high: 9.4, aqiLow: 51, aqiHigh: 100 },
        { low: 9.5, high: 12.4, aqiLow: 101, aqiHigh: 150 },
        { low: 12.5, high: 15.4, aqiLow: 151, aqiHigh: 200 },
        { low: 15.5, high: 30.4, aqiLow: 201, aqiHigh: 300 },
    ],
};

function calculateIndividualAQI(pollutant: keyof PollutantData, value: number): number {
    const breakpoints = BREAKPOINTS[pollutant];
    if (!breakpoints) return 0;

    const breakpoint = breakpoints.find((bp) => value >= bp.low && value <= bp.high);

    // If value exceeds max defined range, use the max AQI calculation or cap it
    if (!breakpoint) {
        // very simple fallback for extreme values
        return 500;
    }

    const { low, high, aqiLow, aqiHigh } = breakpoint;
    return Math.round(((aqiHigh - aqiLow) / (high - low)) * (value - low) + aqiLow);
}

export function calculateAQI(pollutants: PollutantData): number {
    let maxAQI = 0;
    // We prioritize PM2.5 and PM10 as they are most common, but check all
    (Object.keys(pollutants) as Array<keyof PollutantData>).forEach((key) => {
        // OpenWeatherMap returns CO in μg/m3, but US AQI uses ppm.
        // Conversion factor for CO: 1 ppm = 1145 μg/m3 (approx at 25°C) -> so divide by 1150 roughly
        // O3, NO2, SO2 also different units? OpenWeatherMap provides all in μg/m3.
        // US EPA breakpoints are often in ppb or ppm.
        // SIMPLIFICATION: We will stick to the provided PM2.5 and PM10 for the main driving factor 
        // if the others require complex unit conversion that might be error prone without temp/pressure.
        // However, let's try to include at least PM10.
        // Actually, let's check units.
        // OpenWeatherMap: CO (μg/m3), NO (μg/m3), NO2 (μg/m3), O3 (μg/m3), SO2 (μg/m3), PM2.5 (μg/m3), PM10 (μg/m3), NH3 (μg/m3).

        // EPA Breakpoints above are based on standard concentrations. 
        // PM2.5 and PM10 are in μg/m3 (matches OWM).
        // NO2 standard is ppb. 1 ppb NO2 = 1.88 μg/m3.
        // SO2 standard is ppb. 1 ppb SO2 = 2.62 μg/m3.
        // O3 standard is ppb. 1 ppb O3 = 2.00 μg/m3.
        // CO standard is ppm. 1 ppm CO = 1145 μg/m3.

        // So we need to convert before calculating if we want to be accurate with EPA tables, 
        // OR find μg/m3 breakpoints.

        // Let's implement conversion for improved accuracy.
        let value = pollutants[key];

        if (key === 'co') value = value / 1145; // μg/m3 to ppm
        else if (key === 'no2') value = value / 1.88; // μg/m3 to ppb
        else if (key === 'so2') value = value / 2.62; // μg/m3 to ppb
        else if (key === 'o3') value = value / 2.00; // μg/m3 to ppb

        // Ensure we don't pass negative values (though unlikely from API)
        if (value < 0) value = 0;

        const aqi = calculateIndividualAQI(key, value);
        if (aqi > maxAQI) {
            maxAQI = aqi;
        }
    });

    return maxAQI;
}

export function getAQIDescription(aqi: number) {
    if (aqi <= 50) {
        return {
            label: "Good",
            color: "text-green-500",
            bg: "bg-green-500",
            desc: "Air quality is satisfactory, and air pollution poses little or no risk.",
        };
    }
    if (aqi <= 100) {
        return {
            label: "Moderate",
            color: "text-yellow-500",
            bg: "bg-yellow-500",
            desc: "Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution.",
        };
    }
    if (aqi <= 150) {
        return {
            label: "Unhealthy for Sensitive Groups",
            color: "text-orange-500",
            bg: "bg-orange-500",
            desc: "Members of sensitive groups may experience health effects. The general public is less likely to be affected.",
        };
    }
    if (aqi <= 200) {
        return {
            label: "Unhealthy",
            color: "text-red-500",
            bg: "bg-red-500",
            desc: "Some members of the general public may experience health effects; members of sensitive groups may experience more serious health effects.",
        };
    }
    if (aqi <= 300) {
        return {
            label: "Very Unhealthy",
            color: "text-purple-500",
            bg: "bg-purple-500",
            desc: "Health alert: The risk of health effects is increased for everyone.",
        };
    }
    return {
        label: "Hazardous",
        color: "text-red-900",
        bg: "bg-red-900",
        desc: "Health warning of emergency conditions: everyone is more likely to be affected.",
    };
}

export function getPollutantPercentage(value: number, max: number = 300) {
    // Returns a simplified percentage for progress bars, capped at 100
    const percentage = (value / max) * 100;
    return Math.min(Math.max(percentage, 0), 100);
}

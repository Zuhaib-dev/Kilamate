import type { TemperatureUnit, WindSpeedUnit } from '@/hooks/use-preferences';

export function convertTemperature(celsius: number, unit: TemperatureUnit): number {
    if (unit === 'fahrenheit') {
        return (celsius * 9) / 5 + 32;
    }
    return celsius;
}

export function formatTemperature(celsius: number, unit: TemperatureUnit): string {
    const temp = Math.round(convertTemperature(celsius, unit));
    const symbol = unit === 'celsius' ? '°C' : '°F';
    return `${temp}${symbol}`;
}

export function convertWindSpeed(ms: number, unit: WindSpeedUnit): number {
    switch (unit) {
        case 'kmh':
            return ms * 3.6;
        case 'mph':
            return ms * 2.237;
        case 'ms':
        default:
            return ms;
    }
}

export function formatWindSpeed(ms: number, unit: WindSpeedUnit): string {
    const speed = Math.round(convertWindSpeed(ms, unit));
    const unitLabel = {
        kmh: 'km/h',
        mph: 'mph',
        ms: 'm/s',
    }[unit];
    return `${speed} ${unitLabel}`;
}

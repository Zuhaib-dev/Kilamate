import { describe, it, expect } from 'vitest';
import { convertTemperature, convertWindSpeed, formatTemperature } from '@/lib/units';

describe('Unit Conversion Utils', () => {
    describe('convertTemperature', () => {
        it('should return celsius as is when unit is celsius', () => {
            expect(convertTemperature(25, 'celsius')).toBe(25);
        });

        it('should convert celsius to fahrenheit correctly', () => {
            // (0°C × 9/5) + 32 = 32°F
            expect(convertTemperature(0, 'fahrenheit')).toBe(32);
            // (100°C × 9/5) + 32 = 212°F
            expect(convertTemperature(100, 'fahrenheit')).toBe(212);
        });
    });

    describe('formatTemperature', () => {
        it('should format celsius correctly', () => {
            expect(formatTemperature(25, 'celsius')).toBe('25°C');
        });

        it('should format fahrenheit correctly', () => {
            expect(formatTemperature(0, 'fahrenheit')).toBe('32°F');
        });
    });

    describe('convertWindSpeed', () => {
        it('should return m/s as is when unit is ms', () => {
            expect(convertWindSpeed(10, 'ms')).toBe(10);
        });

        it('should convert m/s to km/h correctly', () => {
            // 10 m/s * 3.6 = 36 km/h
            expect(convertWindSpeed(10, 'kmh')).toBe(36);
        });

        it('should convert m/s to mph correctly', () => {
            // 10 m/s * 2.237 = 22.37 mph
            expect(convertWindSpeed(10, 'mph')).toBe(22.37);
        });
    });
});

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type WindSpeedUnit = 'kmh' | 'mph' | 'ms';
export type Language = 'en' | 'hi' | 'ur';

interface PreferencesState {
    temperatureUnit: TemperatureUnit;
    windSpeedUnit: WindSpeedUnit;
    language: Language;
    setTemperatureUnit: (unit: TemperatureUnit) => void;
    setWindSpeedUnit: (unit: WindSpeedUnit) => void;
    setLanguage: (lang: Language) => void;
}

export const usePreferences = create<PreferencesState>()(
    persist(
        (set) => ({
            temperatureUnit: 'celsius',
            windSpeedUnit: 'kmh',
            language: 'en',
            setTemperatureUnit: (unit) => set({ temperatureUnit: unit }),
            setWindSpeedUnit: (unit) => set({ windSpeedUnit: unit }),
            setLanguage: (lang) => set({ language: lang }),
        }),
        {
            name: 'weather-preferences',
        }
    )
);

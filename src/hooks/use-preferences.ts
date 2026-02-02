import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type WindSpeedUnit = 'kmh' | 'mph' | 'ms';

interface PreferencesState {
    temperatureUnit: TemperatureUnit;
    windSpeedUnit: WindSpeedUnit;
    setTemperatureUnit: (unit: TemperatureUnit) => void;
    setWindSpeedUnit: (unit: WindSpeedUnit) => void;
}

export const usePreferences = create<PreferencesState>()(
    persist(
        (set) => ({
            temperatureUnit: 'celsius',
            windSpeedUnit: 'kmh',
            setTemperatureUnit: (unit) => set({ temperatureUnit: unit }),
            setWindSpeedUnit: (unit) => set({ windSpeedUnit: unit }),
        }),
        {
            name: 'weather-preferences',
        }
    )
);

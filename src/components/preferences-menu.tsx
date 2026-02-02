import { Settings } from "lucide-react";
import { Button } from "./ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { usePreferences } from "@/hooks/use-preferences";
import { useTranslation } from "react-i18next";

export function PreferencesMenu() {
    const { temperatureUnit, windSpeedUnit, setTemperatureUnit, setWindSpeedUnit } =
        usePreferences();
    const { t } = useTranslation();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Settings">
                    <Settings className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{t('preferences.title')}</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                    {t('preferences.temperature')}
                </DropdownMenuLabel>
                <DropdownMenuItem
                    onClick={() => setTemperatureUnit("celsius")}
                    className={temperatureUnit === "celsius" ? "bg-accent" : ""}
                >
                    {t('preferences.celsius')} (°C)
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setTemperatureUnit("fahrenheit")}
                    className={temperatureUnit === "fahrenheit" ? "bg-accent" : ""}
                >
                    {t('preferences.fahrenheit')} (°F)
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                    {t('preferences.windSpeed')}
                </DropdownMenuLabel>
                <DropdownMenuItem
                    onClick={() => setWindSpeedUnit("kmh")}
                    className={windSpeedUnit === "kmh" ? "bg-accent" : ""}
                >
                    {t('preferences.kilometersPerHour')}
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setWindSpeedUnit("mph")}
                    className={windSpeedUnit === "mph" ? "bg-accent" : ""}
                >
                    {t('preferences.milesPerHour')}
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setWindSpeedUnit("ms")}
                    className={windSpeedUnit === "ms" ? "bg-accent" : ""}
                >
                    {t('preferences.metersPerSecond')}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

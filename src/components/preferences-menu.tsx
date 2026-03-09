import { Settings } from "lucide-react";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "./ui/tooltip";
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

const KBD_CLASS = "ml-2 px-1 py-0.5 text-[10px] uppercase font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500";

export function PreferencesMenu() {
    const { temperatureUnit, windSpeedUnit, setTemperatureUnit, setWindSpeedUnit } =
        usePreferences();
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const handleOpen = () => setOpen(true);
        window.addEventListener("open-settings", handleOpen);
        return () => window.removeEventListener("open-settings", handleOpen);
    }, []);

    return (
        <TooltipProvider>
            <Tooltip>
                <DropdownMenu open={open} onOpenChange={setOpen}>
                    <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" aria-label="Settings">
                                <Settings className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{t('preferences.title') || 'Settings'} <kbd className={KBD_CLASS}>S</kbd></p>
                    </TooltipContent>
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
            </Tooltip>
        </TooltipProvider>
    );
}

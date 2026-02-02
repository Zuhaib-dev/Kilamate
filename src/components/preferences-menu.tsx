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

export function PreferencesMenu() {
    const { temperatureUnit, windSpeedUnit, setTemperatureUnit, setWindSpeedUnit } =
        usePreferences();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Settings">
                    <Settings className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Preferences</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                    Temperature Unit
                </DropdownMenuLabel>
                <DropdownMenuItem
                    onClick={() => setTemperatureUnit("celsius")}
                    className={temperatureUnit === "celsius" ? "bg-accent" : ""}
                >
                    Celsius (°C)
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setTemperatureUnit("fahrenheit")}
                    className={temperatureUnit === "fahrenheit" ? "bg-accent" : ""}
                >
                    Fahrenheit (°F)
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                    Wind Speed Unit
                </DropdownMenuLabel>
                <DropdownMenuItem
                    onClick={() => setWindSpeedUnit("kmh")}
                    className={windSpeedUnit === "kmh" ? "bg-accent" : ""}
                >
                    Kilometers per hour (km/h)
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setWindSpeedUnit("mph")}
                    className={windSpeedUnit === "mph" ? "bg-accent" : ""}
                >
                    Miles per hour (mph)
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setWindSpeedUnit("ms")}
                    className={windSpeedUnit === "ms" ? "bg-accent" : ""}
                >
                    Meters per second (m/s)
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

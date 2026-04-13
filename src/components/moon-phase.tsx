import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Moon } from "lucide-react";
import { memo } from "react";
import { Badge } from "./ui/badge";
import { useTranslation } from "react-i18next";

// Common moon phases
const PHASES = [
    { name: "New Moon", icon: "🌑", range: [0, 0.03] },
    { name: "Waxing Crescent", icon: "🌒", range: [0.03, 0.22] },
    { name: "First Quarter", icon: "🌓", range: [0.22, 0.28] },
    { name: "Waxing Gibbous", icon: "🌔", range: [0.28, 0.47] },
    { name: "Full Moon", icon: "🌕", range: [0.47, 0.53] },
    { name: "Waning Gibbous", icon: "🌖", range: [0.53, 0.72] },
    { name: "Last Quarter", icon: "🌗", range: [0.72, 0.78] },
    { name: "Waning Crescent", icon: "🌘", range: [0.78, 0.97] },
    { name: "New Moon", icon: "🌑", range: [0.97, 1] }
];

function getMoonPhase() {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    let c = 0, e = 0, jd = 0;
    let y = year, m = month;

    if (m < 3) { y--; m += 12; }
    m++;
    c = 365.25 * y;
    e = 30.6 * m;
    jd = c + e + day - 694039.09; // Days since 1970ish base
    jd /= 29.5305882; // Divide by lunar cycle
    let fraction = jd - Math.floor(jd); // Current fraction in cycle
    
    // Determine phase name
    const phase = PHASES.find(p => fraction >= p.range[0] && fraction < p.range[1]) || PHASES[0];
    const illumination = fraction <= 0.5 ? fraction * 200 : (1 - fraction) * 200;

    return { 
        name: phase.name, 
        icon: phase.icon, 
        illumination: Math.round(illumination),
        fraction 
    };
}

export const MoonPhase = memo(() => {
    const { name, icon, illumination } = getMoonPhase();
    const { t } = useTranslation();
    
    // Mocking next full moon for display (simplified)
    const nextFullMoon = "14 Days";

    return (
        <Card className="relative overflow-hidden group rounded-2xl border-none bg-card/20 backdrop-blur-md hover:bg-card/40 transition-all border-white/5 h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
                <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-2 rounded-lg">
                        <Moon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-sm font-bold tracking-tight uppercase">{t("moonPhase.title")}</CardTitle>
                </div>
                <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter">
                    {name}
                </Badge>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center py-4 relative">
                    {/* Glowing background effect */}
                    <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
                    
                    <div className="text-6xl mb-4 filter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] animate-pulse">
                        {icon}
                    </div>
                    
                    <div className="text-center space-y-1 z-10">
                        <p className="text-2xl font-black tracking-tighter leading-none">
                            {illumination}%
                        </p>
                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.1em]">
                            {t("moonPhase.illumination")}
                        </p>
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t border-white/5">
                    <div className="flex justify-between items-center text-[10px]">
                        <span className="text-muted-foreground font-bold uppercase tracking-wider">Next Full Moon</span>
                        <span className="font-black text-primary uppercase">{nextFullMoon}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
});

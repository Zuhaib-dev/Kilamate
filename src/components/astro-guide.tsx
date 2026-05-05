import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Telescope, Star, Moon, Eye, Cloud, MapPin, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { memo, useMemo } from "react";
import { Badge } from "./ui/badge";
import type { WeatherData, ForecastData } from "@/api/types";

interface AstroGuideProps {
  weather: WeatherData;
  forecast?: ForecastData | null;
}

export const AstroGuide = memo(function AstroGuide({ weather }: AstroGuideProps) {
  const astroData = useMemo(() => {
    const clouds = weather.clouds.all;
    const visibility = (weather.visibility || 10000) / 1000; // km
    const humidity = weather.main.humidity;
    
    // Stargazing Quality Logic
    // 0-100 score
    let score = 100;
    score -= clouds * 0.8; // Clouds are the biggest killer
    if (visibility < 5) score -= (5 - visibility) * 10;
    if (humidity > 70) score -= (humidity - 70) * 0.5;
    
    const finalScore = Math.max(0, Math.min(100, score));
    
    let quality = "Excellent";
    let color = "#10b981"; // Emerald
    let glow = "rgba(16, 185, 129, 0.4)";
    if (finalScore < 30) { quality = "Poor"; color = "#ef4444"; glow = "rgba(239, 68, 68, 0.4)"; }
    else if (finalScore < 60) { quality = "Fair"; color = "#f59e0b"; glow = "rgba(245, 158, 11, 0.4)"; }
    else if (finalScore < 85) { quality = "Good"; color = "#3b82f6"; glow = "rgba(59, 130, 246, 0.4)"; }

    // Mock Planetary Visibility (Simplified for UI/UX)
    const planets = [
      { name: "Venus", status: "Visible", time: "Sunset", color: "#f59e0b", icon: <Star className="w-4 h-4" /> }, // amber
      { name: "Mars", status: "Late Night", time: "2:00 AM", color: "#ef4444", icon: <Moon className="w-4 h-4" /> }, // red
      { name: "Jupiter", status: "All Night", time: "Evening", color: "#8b5cf6", icon: <Star className="w-4 h-4" /> }, // purple
    ];

    return {
      score: Math.round(finalScore),
      quality,
      color,
      glow,
      clouds,
      visibility,
      planets,
      bortle: clouds > 50 ? "Class 7-8 (City)" : "Class 4-5 (Rural)", // Mock estimation
    };
  }, [weather]);

  return (
    <Card className="premium-card group overflow-hidden h-full relative border bg-card text-card-foreground">
      {/* Background Gradient Effect - Theme adaptive */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent pointer-events-none" />
      
      {/* Star Field Background Effect (Subtle in both light/dark) */}
      <div className="absolute inset-0 opacity-20 dark:opacity-40 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute rounded-full bg-indigo-500 dark:bg-white"
            initial={{ 
              top: `${Math.random() * 100}%`, 
              left: `${Math.random() * 100}%`, 
              width: Math.random() * 2 + 0.5, 
              height: Math.random() * 2 + 0.5,
              opacity: Math.random() 
            }}
            animate={{ 
              opacity: [0.1, 0.5, 0.1],
              scale: [1, 1.5, 1]
            }}
            transition={{ 
              duration: 3 + Math.random() * 4, 
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut"
            }}
          />
        ))}
        {/* Shooting Star */}
        <motion.div
          className="absolute h-0.5 w-12 bg-gradient-to-r from-transparent via-indigo-500 dark:via-white to-transparent rotate-[45deg]"
          initial={{ top: "-10%", left: "110%", opacity: 0 }}
          animate={{ top: "110%", left: "-10%", opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 7, ease: "linear" }}
        />
      </div>

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 relative z-10">
        <div className="flex items-center gap-3">
          <motion.div 
            whileHover={{ rotate: 15 }}
            className="bg-indigo-500/10 p-2.5 rounded-xl border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.1)] relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-indigo-400/20 blur-md animate-pulse" />
            <Telescope className="h-6 w-6 text-indigo-500 dark:text-indigo-400 relative z-10" />
          </motion.div>
          <div>
            <CardTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
              Astro Guide
              <Sparkles className="w-4 h-4 text-indigo-500 dark:text-indigo-400 animate-pulse" />
            </CardTitle>
            <p className="text-xs text-muted-foreground font-medium">Stargazing & Planetary Overview</p>
          </div>
        </div>
        <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.05)]">
          Deep Sky
        </Badge>
      </CardHeader>

      <CardContent className="relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Column 1: Main Quality Score */}
          <div className="flex flex-col items-center justify-center py-8 rounded-2xl bg-muted/30 backdrop-blur-md border shadow-sm relative overflow-hidden group-hover:bg-muted/40 transition-colors duration-500">
            <div 
              className="absolute inset-0 opacity-10 blur-2xl transition-opacity duration-1000"
              style={{ backgroundColor: astroData.color }}
            />
            <div className="relative">
              <svg className="w-36 h-36 transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="64"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="transparent"
                  className="text-muted/50"
                />
                <motion.circle
                  cx="72"
                  cy="72"
                  r="64"
                  stroke={astroData.color}
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={402.12}
                  initial={{ strokeDashoffset: 402.12 }}
                  animate={{ strokeDashoffset: 402.12 - (402.12 * astroData.score) / 100 }}
                  transition={{ duration: 2, ease: "easeOut", delay: 0.2 }}
                  strokeLinecap="round"
                  style={{ filter: `drop-shadow(0 0 8px ${astroData.glow})` }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span 
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1, duration: 0.5, type: "spring" }}
                  className="text-4xl font-black tracking-tighter"
                >
                  {astroData.score}<span className="text-xl text-muted-foreground">%</span>
                </motion.span>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground mt-1">Visibility</span>
              </div>
            </div>
            <motion.div 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="mt-6 flex flex-col items-center"
            >
              <Badge 
                variant="outline" 
                className="bg-background/80 backdrop-blur-xl border px-4 py-1.5 text-sm uppercase tracking-widest font-black"
                style={{ color: astroData.color, borderColor: astroData.color }}
              >
                {astroData.quality} Conditions
              </Badge>
            </motion.div>
          </div>

          {/* Column 2: Sky Details */}
          <div className="flex flex-col gap-4">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="flex-1 rounded-2xl border bg-muted/20 p-5 flex flex-col justify-center relative overflow-hidden transition-all duration-300 hover:bg-muted/40 hover:border-border/80"
            >
              <div className="absolute -right-6 -top-6 text-blue-500/5 dark:text-blue-500/10">
                <Cloud className="w-24 h-24" />
              </div>
              <div className="flex items-center gap-3 mb-3 relative z-10">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Cloud className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Cloud Cover</span>
              </div>
              <div className="relative z-10">
                <p className="text-3xl font-black">{astroData.clouds}%</p>
                <p className="text-xs text-muted-foreground mt-1 font-medium">{astroData.clouds < 20 ? "Perfectly Clear Sky" : astroData.clouds < 50 ? "Partly Cloudy" : "Heavy Obstruction"}</p>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="flex-1 rounded-2xl border bg-muted/20 p-5 flex flex-col justify-center relative overflow-hidden transition-all duration-300 hover:bg-muted/40 hover:border-border/80"
            >
              <div className="absolute -right-4 -bottom-4 text-purple-500/5 dark:text-purple-500/10">
                <Eye className="w-24 h-24" />
              </div>
              <div className="flex items-center gap-3 mb-3 relative z-10">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Eye className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Atmospheric Clarity</span>
              </div>
              <div className="relative z-10">
                <p className="text-3xl font-black">{astroData.visibility} <span className="text-xl text-muted-foreground font-semibold">km</span></p>
                <p className="text-xs text-muted-foreground mt-1 font-medium">{astroData.visibility > 8 ? "Excellent Depth Rating" : "Limited Viewing Range"}</p>
              </div>
            </motion.div>
          </div>

          {/* Column 3: Planetary Visibility & Details */}
          <div className="flex flex-col rounded-2xl border bg-muted/20 p-5 h-full relative overflow-hidden group-hover:border-border/80 transition-all duration-500">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[50px] rounded-full pointer-events-none" />
            
            <div className="flex items-center gap-2 mb-6">
              <Star className="h-4 w-4 text-amber-500 dark:text-amber-400" />
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Planetary Alignment</h3>
            </div>
            
            <div className="space-y-3 flex-1">
              {astroData.planets.map((planet, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  whileHover={{ x: 5, backgroundColor: "var(--muted)" }}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-background/50 border transition-all cursor-default"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="flex items-center justify-center h-8 w-8 rounded-full shadow-sm border bg-background" 
                      style={{ color: planet.color, borderColor: `${planet.color}40` }}
                    >
                      {planet.icon}
                    </div>
                    <span className="text-sm font-bold">{planet.name}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-300 uppercase tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                      {planet.time}
                    </span>
                    <span className="text-[10px] font-medium text-muted-foreground">{planet.status}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                 <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Light Pollution</p>
                   <p className="text-[9px] font-medium text-muted-foreground/70">{astroData.bortle}</p>
                 </div>
              </div>
              <div className="flex items-center gap-2 bg-emerald-500/10 px-2.5 py-1.5 rounded-full border border-emerald-500/20">
                 <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                 </span>
                 <span className="text-[9px]  uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold">Live Sync</span>
              </div>
            </div>
          </div>
          
        </div>
      </CardContent>

      {/* Decorative Glow Elements */}
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none transition-opacity duration-700 group-hover:opacity-100 opacity-50" />
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none transition-opacity duration-700 group-hover:opacity-100 opacity-50" />
    </Card>
  );
});

import { useWeatherTheme } from "@/context/weather-theme-provider";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useEffect, useState } from "react";

const THEME_COLORS: Record<string, string[]> = {
  default: ["#3b82f6", "#8b5cf6", "#ec4899"], // Blue/Violet/Pink
  "clear-day": ["#f59e0b", "#f87171", "#fbbf24"], // Amber/Red/Yellow
  "clear-night": ["#1e1b4b", "#312e81", "#4338ca"], // Navy/Indigo
  clouds: ["#64748b", "#94a3b8", "#cbd5e1"], // Slate/Blue-gray
  rain: ["#1e3a8a", "#0284c7", "#38bdf8"], // Darker Sky/Light Blue
  drizzle: ["#7dd3fc", "#bae6fd", "#e0f2fe"], // Very Light Blue
  thunderstorm: ["#312e81", "#4c1d95", "#6d28d9"], // Deep Purple/Indigo
  snow: ["#cbd5e1", "#e2e8f0", "#f8fafc"], // Ice Blue/White
  mist: ["#64748b", "#94a3b8", "#cbd5e1"], // Misty Gray
};

// Particle Generators
const generateParticles = (count: number) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 120 - 10}%`, // -10 to 110%
    top: `${Math.random() * -100}%`,
    duration: `${Math.random() * 1.5 + 0.5}s`,
    delay: `${Math.random() * 2}s`,
    opacity: Math.random() * 0.5 + 0.2,
    scale: Math.random() * 0.5 + 0.5,
  }));
};

export function MeshBackground() {
  const { theme } = useWeatherTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const colors = useMemo(() => THEME_COLORS[theme] || THEME_COLORS.default, [theme]);
  
  // Memoize particle arrays to prevent re-renders breaking animations
  const rainDrops = useMemo(() => generateParticles(60), []);
  const snowFlakes = useMemo(() => generateParticles(50), []);
  const stars = useMemo(() => generateParticles(40), []);

  return (
    <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none">
      {/* Base Background */}
      <div className="absolute inset-0 bg-background transition-colors duration-1000" />
      
      {/* Animated Gradient Blobs */}
      <AnimatePresence>
        <motion.div
          key={theme + "-blobs"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2 }}
          className="absolute inset-0"
        >
          <motion.div
            animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0], scale: [1, 1.2, 0.9, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-20 dark:opacity-40"
            style={{ backgroundColor: colors[0] }}
          />
          <motion.div
            animate={{ x: [0, -50, 30, 0], y: [0, 40, -20, 0], scale: [1, 1.1, 1.2, 1] }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] opacity-20 dark:opacity-40"
            style={{ backgroundColor: colors[1] }}
          />
          <motion.div
            animate={{ x: [0, 60, -40, 0], y: [0, 30, 50, 0], scale: [0.8, 1.2, 1, 0.8] }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-15 dark:opacity-35"
            style={{ backgroundColor: colors[2] }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Dynamic Weather Particles */}
      {mounted && (
        <AnimatePresence>
          {/* RAIN / DRIZZLE / THUNDERSTORM */}
          {(theme === "rain" || theme === "drizzle" || theme === "thunderstorm") && (
            <motion.div key="rain" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }} className="absolute inset-0">
              {rainDrops.map((drop) => (
                <div
                  key={`rain-${drop.id}`}
                  className="weather-particle-rain"
                  style={{
                    left: drop.left,
                    top: drop.top,
                    animationDuration: theme === "drizzle" ? "1.2s" : "0.7s",
                    animationDelay: drop.delay,
                    opacity: drop.opacity,
                    transform: `scale(${drop.scale})`
                  }}
                />
              ))}
              {theme === "thunderstorm" && <div className="weather-lightning" />}
            </motion.div>
          )}

          {/* SNOW */}
          {theme === "snow" && (
            <motion.div key="snow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 2 }} className="absolute inset-0">
              {snowFlakes.map((flake) => (
                <div
                  key={`snow-${flake.id}`}
                  className="weather-particle-snow"
                  style={{
                    left: flake.left,
                    top: flake.top,
                    width: `${flake.scale * 8 + 4}px`,
                    height: `${flake.scale * 8 + 4}px`,
                    animationDuration: `${parseFloat(flake.duration) * 5 + 3}s`,
                    animationDelay: flake.delay,
                    opacity: flake.opacity
                  }}
                />
              ))}
            </motion.div>
          )}

          {/* CLEAR NIGHT (STARS) */}
          {theme === "clear-night" && (
            <motion.div key="stars" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 3 }} className="absolute inset-0">
              {stars.map((star) => (
                <div
                  key={`star-${star.id}`}
                  className="weather-particle-star"
                  style={{
                    left: star.left,
                    top: `${Math.random() * 60}%`, // Keep stars in top half mostly
                    width: `${star.scale * 3 + 1}px`,
                    height: `${star.scale * 3 + 1}px`,
                    animationDuration: `${parseFloat(star.duration) * 2 + 2}s`,
                    animationDelay: star.delay,
                  }}
                />
              ))}
            </motion.div>
          )}

          {/* CLOUDS / MIST */}
          {(theme === "clouds" || theme === "mist") && (
            <motion.div key="clouds" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 2 }} className="absolute inset-0">
              <div className="absolute top-[10%] left-[-20%] w-[60%] h-[30%] bg-white/5 dark:bg-white/5 blur-[100px] rounded-full animate-[cloud-pan_40s_linear_infinite]" />
              <div className="absolute top-[30%] left-[-40%] w-[80%] h-[40%] bg-white/10 dark:bg-white/5 blur-[120px] rounded-full animate-[cloud-pan_60s_linear_infinite_10s]" />
              <div className="absolute bottom-[20%] left-[-30%] w-[70%] h-[30%] bg-white/5 dark:bg-white/5 blur-[90px] rounded-full animate-[cloud-pan_50s_linear_infinite_5s]" />
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Grain/Texture Overlay - always on top to blend everything */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
}

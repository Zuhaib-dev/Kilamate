import { useWeatherTheme } from "@/context/weather-theme-provider";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useEffect, useState } from "react";

const THEME_COLORS: Record<string, string[]> = {
  default: ["#3b82f6", "#8b5cf6", "#ec4899"],
  "clear-day": ["#f59e0b", "#f87171", "#fbbf24"],
  "clear-night": ["#1e1b4b", "#312e81", "#4338ca"],
  clouds: ["#64748b", "#94a3b8", "#cbd5e1"],
  rain: ["#1e3a8a", "#0284c7", "#38bdf8"],
  drizzle: ["#7dd3fc", "#bae6fd", "#e0f2fe"],
  thunderstorm: ["#312e81", "#4c1d95", "#6d28d9"],
  snow: ["#cbd5e1", "#e2e8f0", "#f8fafc"],
  mist: ["#64748b", "#94a3b8", "#cbd5e1"],
};

// Detect mobile once at module level — no re-renders
const IS_MOBILE =
  typeof window !== "undefined" &&
  /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent);

// Reduced particle counts: 20 on mobile, 50 on desktop
const RAIN_COUNT = IS_MOBILE ? 20 : 50;
const SNOW_COUNT = IS_MOBILE ? 20 : 40;
const STAR_COUNT = IS_MOBILE ? 20 : 35;

const generateParticles = (count: number) =>
  Array.from({ length: count }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 120 - 10}%`,
    top: `${Math.random() * -100}%`,
    duration: `${Math.random() * 1.5 + 0.5}s`,
    delay: `${Math.random() * 2}s`,
    opacity: Math.random() * 0.5 + 0.2,
    scale: Math.random() * 0.5 + 0.5,
  }));

export function MeshBackground() {
  const { theme } = useWeatherTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const colors = useMemo(() => THEME_COLORS[theme] || THEME_COLORS.default, [theme]);

  // Memoize once — particles never need to change
  const rainDrops = useMemo(() => generateParticles(RAIN_COUNT), []);
  const snowFlakes = useMemo(() => generateParticles(SNOW_COUNT), []);
  const stars = useMemo(() => generateParticles(STAR_COUNT), []);

  return (
    <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none">
      {/* Base background */}
      <div className="absolute inset-0 bg-background transition-colors duration-1000" />

      {/*
        Gradient blobs — pure CSS animation (runs on compositor thread).
        On mobile we use CSS keyframes instead of Framer Motion JS animations
        to avoid JS thread involvement on every frame.
      */}
      <AnimatePresence>
        <motion.div
          key={theme + "-blobs"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          {/* Blob 1 — CSS animation: mesh-blob-1 defined in index.css */}
          <div
            className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-20 dark:opacity-35 animate-mesh-blob-1"
            style={{ backgroundColor: colors[0] }}
          />
          {/* Blob 2 */}
          <div
            className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] opacity-20 dark:opacity-35 animate-mesh-blob-2"
            style={{ backgroundColor: colors[1] }}
          />
          {/* Blob 3 — hidden on mobile to save GPU */}
          {!IS_MOBILE && (
            <div
              className="absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-15 dark:opacity-30 animate-mesh-blob-3"
              style={{ backgroundColor: colors[2] }}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Weather particles — only mounted once and only when needed */}
      {mounted && (
        <AnimatePresence>
          {/* RAIN / DRIZZLE / THUNDERSTORM */}
          {(theme === "rain" || theme === "drizzle" || theme === "thunderstorm") && (
            <motion.div
              key="rain"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0"
            >
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
                    transform: `scale(${drop.scale})`,
                  }}
                />
              ))}
              {theme === "thunderstorm" && <div className="weather-lightning" />}
            </motion.div>
          )}

          {/* SNOW */}
          {theme === "snow" && (
            <motion.div
              key="snow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2 }}
              className="absolute inset-0"
            >
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
                    opacity: flake.opacity,
                  }}
                />
              ))}
            </motion.div>
          )}

          {/* CLEAR NIGHT (STARS) */}
          {theme === "clear-night" && (
            <motion.div
              key="stars"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 3 }}
              className="absolute inset-0"
            >
              {stars.map((star) => (
                <div
                  key={`star-${star.id}`}
                  className="weather-particle-star"
                  style={{
                    left: star.left,
                    top: `${Math.random() * 60}%`,
                    width: `${star.scale * 3 + 1}px`,
                    height: `${star.scale * 3 + 1}px`,
                    animationDuration: `${parseFloat(star.duration) * 2 + 2}s`,
                    animationDelay: star.delay,
                  }}
                />
              ))}
            </motion.div>
          )}

          {/* CLOUDS / MIST — CSS-only, no JS animation */}
          {(theme === "clouds" || theme === "mist") && (
            <motion.div
              key="clouds"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2 }}
              className="absolute inset-0"
            >
              <div className="absolute top-[10%] left-[-20%] w-[60%] h-[30%] bg-white/5 dark:bg-white/5 blur-[100px] rounded-full animate-[cloud-pan_40s_linear_infinite]" />
              <div className="absolute top-[30%] left-[-40%] w-[80%] h-[40%] bg-white/10 dark:bg-white/5 blur-[120px] rounded-full animate-[cloud-pan_60s_linear_infinite_10s]" />
              {!IS_MOBILE && (
                <div className="absolute bottom-[20%] left-[-30%] w-[70%] h-[30%] bg-white/5 dark:bg-white/5 blur-[90px] rounded-full animate-[cloud-pan_50s_linear_infinite_5s]" />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Grain overlay — inline SVG avoids the external 404 network request */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.025] dark:opacity-[0.04] pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="noise-filter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise-filter)" />
      </svg>
    </div>
  );
}

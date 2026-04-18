import { useWeatherTheme } from "@/context/weather-theme-provider";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";

const THEME_COLORS: Record<string, string[]> = {
  default: ["#3b82f6", "#8b5cf6", "#ec4899"], // Blue/Violet/Pink
  "clear-day": ["#f59e0b", "#f87171", "#fbbf24"], // Amber/Red/Yellow
  "clear-night": ["#1e1b4b", "#312e81", "#4338ca"], // Navy/Indigo
  clouds: ["#64748b", "#94a3b8", "#cbd5e1"], // Slate/Blue-gray
  rain: ["#0284c7", "#0ea5e9", "#38bdf8"], // Sky/Light Blue
  drizzle: ["#7dd3fc", "#bae6fd", "#e0f2fe"], // Very Light Blue
  thunderstorm: ["#4c1d95", "#6d28d9", "#7c3aed"], // Deep Purple
  snow: ["#f8fafc", "#f1f5f9", "#e2e8f0"], // White/Soft Gray
  mist: ["#94a3b8", "#cbd5e1", "#e2e8f0"], // Misty Gray
};

export function MeshBackground() {
  const { theme } = useWeatherTheme();
  
  const colors = useMemo(() => THEME_COLORS[theme] || THEME_COLORS.default, [theme]);

  return (
    <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-background transition-colors duration-1000" />
      
      <AnimatePresence>
        <motion.div
          key={theme}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2 }}
          className="absolute inset-0"
        >
          {/* Top Left Blob */}
          <motion.div
            animate={{
              x: [0, 40, -20, 0],
              y: [0, -30, 20, 0],
              scale: [1, 1.2, 0.9, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-20 dark:opacity-30"
            style={{ backgroundColor: colors[0] }}
          />

          {/* Bottom Right Blob */}
          <motion.div
            animate={{
              x: [0, -50, 30, 0],
              y: [0, 40, -20, 0],
              scale: [1, 1.1, 1.2, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] opacity-20 dark:opacity-30"
            style={{ backgroundColor: colors[1] }}
          />

          {/* Center/Random Blob */}
          <motion.div
            animate={{
              x: [0, 60, -40, 0],
              y: [0, 30, 50, 0],
              scale: [0.8, 1.2, 1, 0.8],
            }}
            transition={{
              duration: 22,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-15 dark:opacity-25"
            style={{ backgroundColor: colors[2] }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Grain/Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
}

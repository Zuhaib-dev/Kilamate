import { forwardRef } from "react";
import { formatTemperature } from "@/lib/units";
import { format } from "date-fns";
import type { WeatherData } from "@/api/types";
import type { TemperatureUnit } from "@/hooks/use-preferences";

interface WeatherSnapshotProps {
  weather: WeatherData;
  locationName: string;
  country: string;
  temperatureUnit: TemperatureUnit;
  /** Canonical city-page URL to embed at the bottom */
  shareUrl?: string;
}

// ── Gradient + accent per condition ───────────────────────────────────────────
function getTheme(id: number, isDay: boolean) {
  if (!isDay) {
    return {
      bg: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #020617 100%)",
      accent: "#818cf8",
      orb1: "rgba(99,102,241,0.25)",
      orb2: "rgba(15,23,42,0.6)",
      light: false,
    };
  }
  if (id >= 200 && id < 300) return { // Thunderstorm
    bg: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 45%, #3730a3 100%)",
    accent: "#a78bfa",
    orb1: "rgba(167,139,250,0.3)",
    orb2: "rgba(15,23,42,0.7)",
    light: false,
  };
  if (id >= 300 && id < 600) return { // Rain/Drizzle
    bg: "linear-gradient(135deg, #0c4a6e 0%, #075985 50%, #0369a1 100%)",
    accent: "#7dd3fc",
    orb1: "rgba(125,211,252,0.25)",
    orb2: "rgba(12,74,110,0.6)",
    light: false,
  };
  if (id >= 600 && id < 700) return { // Snow
    bg: "linear-gradient(135deg, #dbeafe 0%, #eff6ff 50%, #f0f9ff 100%)",
    accent: "#2563eb",
    orb1: "rgba(191,219,254,0.9)",
    orb2: "rgba(219,234,254,0.6)",
    light: true,
  };
  if (id >= 700 && id < 800) return { // Haze/Mist
    bg: "linear-gradient(135deg, #334155 0%, #475569 50%, #64748b 100%)",
    accent: "#cbd5e1",
    orb1: "rgba(203,213,225,0.2)",
    orb2: "rgba(51,65,85,0.5)",
    light: false,
  };
  if (id === 800) return { // Clear sunny
    bg: "linear-gradient(135deg, #0369a1 0%, #0ea5e9 45%, #38bdf8 100%)",
    accent: "#fde68a",
    orb1: "rgba(253,230,138,0.3)",
    orb2: "rgba(3,105,161,0.5)",
    light: false,
  };
  return { // Partly cloudy
    bg: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 45%, #3b82f6 100%)",
    accent: "#bfdbfe",
    orb1: "rgba(191,219,254,0.25)",
    orb2: "rgba(30,58,95,0.6)",
    light: false,
  };
}

function getWindDir(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}

function getVisibility(metres?: number): string {
  if (!metres) return "—";
  if (metres >= 10000) return "10+ km";
  return `${(metres / 1000).toFixed(1)} km`;
}

// ── Component ─────────────────────────────────────────────────────────────────
export const WeatherSnapshot = forwardRef<HTMLDivElement, WeatherSnapshotProps>(
  ({ weather, locationName, country, temperatureUnit, shareUrl }, ref) => {
    const {
      weather: [cw],
      main: { temp, feels_like, temp_max, temp_min, humidity, pressure },
      wind: { speed, deg: windDeg, gust },
      sys: { sunrise, sunset },
      visibility,
      clouds,
    } = weather;

    const fmt   = (t: number) => formatTemperature(t, temperatureUnit);
    const icon  = `https://openweathermap.org/img/wn/${cw.icon}@4x.png`;
    const now   = Date.now() / 1000;
    const isDay = now > sunrise && now < sunset;
    const theme = getTheme(cw.id, isDay);

    const tc  = theme.light ? "#1e293b" : "#ffffff";
    const sc  = theme.light ? "#475569" : "rgba(255,255,255,0.70)";
    const bc  = theme.light ? "rgba(15,23,42,0.10)" : "rgba(255,255,255,0.12)";
    const glb = theme.light ? "rgba(255,255,255,0.50)" : "rgba(0,0,0,0.18)";

    const windKmh = Math.round(speed * 3.6);
    const gustKmh = gust ? Math.round(gust * 3.6) : null;

    const stats = [
      { label: "Feels like",  value: fmt(feels_like) },
      { label: "Humidity",    value: `${humidity}%` },
      { label: "Wind",        value: `${windKmh} km/h ${getWindDir(windDeg)}${gustKmh ? ` · Gust ${gustKmh}` : ""}` },
      { label: "Pressure",    value: `${pressure} hPa` },
      { label: "Cloud cover", value: `${clouds.all}%` },
      { label: "Visibility",  value: getVisibility(visibility) },
    ];

    const displayUrl = shareUrl
      ? shareUrl.replace(/^https?:\/\//, "")
      : "kilamate.netlify.app";

    return (
      <div
        ref={ref}
        style={{
          position: "absolute",
          left: "-9999px",
          top: 0,
          width: "1080px",
          height: "1080px",
          background: theme.bg,
          color: tc,
          fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Orb decorations */}
        <div style={{
          position: "absolute", top: -160, right: -160,
          width: 600, height: 600,
          background: theme.orb1,
          borderRadius: "50%",
          filter: "blur(100px)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: -200, left: -200,
          width: 700, height: 700,
          background: theme.orb2,
          borderRadius: "50%",
          filter: "blur(130px)",
          pointerEvents: "none",
        }} />

        {/* ── TOP BAR ── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "52px 64px 0",
          position: "relative", zIndex: 10,
        }}>
          {/* Location */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 14,
                background: glb, border: `1.5px solid ${bc}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {/* pin SVG */}
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={tc} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <span style={{ fontSize: 46, fontWeight: 900, letterSpacing: -1.5, lineHeight: 1 }}>
                {locationName}
              </span>
              <span style={{ fontSize: 30, fontWeight: 700, color: sc, marginTop: 4 }}>
                {country}
              </span>
            </div>
            <span style={{ fontSize: 22, fontWeight: 600, color: sc, letterSpacing: 3, textTransform: "uppercase", paddingLeft: 56 }}>
              {format(new Date(), "EEEE, MMMM d · h:mm a")}
            </span>
          </div>

          {/* Kilamate badge */}
          <div style={{
            padding: "14px 28px",
            borderRadius: 9999,
            background: glb,
            border: `1.5px solid ${bc}`,
            backdropFilter: "blur(20px)",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            {/* leaf SVG (brand) */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill={theme.accent} stroke={theme.accent} strokeWidth="0">
              <path d="M17 8C8 10 5.9 16.17 3.82 19.82A1 1 0 005.23 21C9 19 15 17 17 8z"/>
              <path d="M17 8c0 0-3 8-14 13" stroke={theme.accent} strokeWidth="1.5" fill="none"/>
            </svg>
            <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: 2.5, textTransform: "uppercase" }}>
              Kilamate
            </span>
          </div>
        </div>

        {/* ── MAIN HERO ── */}
        <div style={{
          flex: 1, display: "flex", alignItems: "center",
          padding: "0 64px",
          position: "relative", zIndex: 10,
          gap: 40,
        }}>
          {/* Temperature block */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 0 }}>
            <span style={{
              fontSize: 210, fontWeight: 900, lineHeight: 0.85, letterSpacing: -8,
              textShadow: "0 24px 60px rgba(0,0,0,0.20)",
            }}>
              {fmt(temp)}
            </span>

            <span style={{ fontSize: 42, fontWeight: 700, marginTop: 24, textTransform: "capitalize", color: tc }}>
              {cw.description}
            </span>

            {/* H / L bar */}
            <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 18 }}>
              <span style={{ fontSize: 30, fontWeight: 800, color: theme.accent }}>
                ↑ {fmt(temp_max)}
              </span>
              <span style={{ width: 6, height: 6, borderRadius: 3, background: sc }} />
              <span style={{ fontSize: 30, fontWeight: 800, color: sc }}>
                ↓ {fmt(temp_min)}
              </span>
            </div>
          </div>

          {/* Weather icon */}
          <div style={{ position: "relative", width: 300, height: 300, flexShrink: 0 }}>
            <div style={{
              position: "absolute", inset: 0,
              background: "rgba(255,255,255,0.15)",
              borderRadius: "50%",
              filter: "blur(50px)",
              transform: "scale(1.4)",
            }} />
            <img
              src={icon}
              alt={cw.description}
              style={{
                width: "100%", height: "100%",
                objectFit: "contain",
                position: "relative", zIndex: 1,
                filter: "brightness(1.12) contrast(1.05) drop-shadow(0 20px 40px rgba(0,0,0,0.30))",
              }}
            />
          </div>
        </div>

        {/* ── STATS GRID ── */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16,
          padding: "0 64px",
          position: "relative", zIndex: 10,
        }}>
          {stats.map(({ label, value }) => (
            <div
              key={label}
              style={{
                background: glb,
                border: `1.5px solid ${bc}`,
                borderRadius: 24,
                padding: "20px 28px",
                backdropFilter: "blur(20px)",
              }}
            >
              <p style={{ fontSize: 17, fontWeight: 600, color: sc, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>
                {label}
              </p>
              <p style={{ fontSize: 28, fontWeight: 800, color: tc, letterSpacing: -0.5 }}>
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* ── FOOTER ── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "28px 64px 48px",
          position: "relative", zIndex: 10,
        }}>
          {/* URL pill */}
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "12px 24px",
            borderRadius: 9999,
            background: glb,
            border: `1.5px solid ${bc}`,
          }}>
            {/* link icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={theme.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
            </svg>
            <span style={{ fontSize: 19, fontWeight: 700, color: sc, letterSpacing: 0.5 }}>
              {displayUrl}
            </span>
          </div>

          {/* Powered-by */}
          <span style={{ fontSize: 18, fontWeight: 600, color: sc, letterSpacing: 1 }}>
            Powered by{" "}
            <span style={{ color: tc, fontWeight: 800 }}>Kilamate Weather</span>
          </span>
        </div>
      </div>
    );
  }
);

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
  shareUrl?: string;
}

function getTheme(id: number, isDay: boolean) {
  if (!isDay) return {
    bg: "linear-gradient(145deg, #0f172a 0%, #1e1b4b 55%, #020617 100%)",
    accent: "#818cf8", orb1: "rgba(99,102,241,0.28)", orb2: "rgba(15,23,42,0.7)", light: false,
  };
  if (id >= 200 && id < 300) return {
    bg: "linear-gradient(145deg, #0f172a 0%, #1e1b4b 50%, #3730a3 100%)",
    accent: "#a78bfa", orb1: "rgba(167,139,250,0.32)", orb2: "rgba(15,23,42,0.75)", light: false,
  };
  if (id >= 300 && id < 600) return {
    bg: "linear-gradient(145deg, #0c4a6e 0%, #075985 50%, #0369a1 100%)",
    accent: "#7dd3fc", orb1: "rgba(125,211,252,0.28)", orb2: "rgba(12,74,110,0.65)", light: false,
  };
  if (id >= 600 && id < 700) return {
    bg: "linear-gradient(145deg, #dbeafe 0%, #eff6ff 55%, #f0f9ff 100%)",
    accent: "#2563eb", orb1: "rgba(191,219,254,0.9)", orb2: "rgba(219,234,254,0.6)", light: true,
  };
  if (id >= 700 && id < 800) return {
    bg: "linear-gradient(145deg, #1e293b 0%, #334155 50%, #475569 100%)",
    accent: "#94a3b8", orb1: "rgba(148,163,184,0.22)", orb2: "rgba(30,41,59,0.7)", light: false,
  };
  if (id === 800) return {
    bg: "linear-gradient(145deg, #0c4a6e 0%, #0ea5e9 50%, #7dd3fc 100%)",
    accent: "#fde68a", orb1: "rgba(253,230,138,0.35)", orb2: "rgba(12,74,110,0.55)", light: false,
  };
  return {
    bg: "linear-gradient(145deg, #1e3a5f 0%, #1d4ed8 50%, #3b82f6 100%)",
    accent: "#bfdbfe", orb1: "rgba(191,219,254,0.28)", orb2: "rgba(30,58,95,0.65)", light: false,
  };
}

function getWindDir(deg: number) {
  return ["N","NE","E","SE","S","SW","W","NW"][Math.round(deg / 45) % 8];
}

function getVisibility(m?: number) {
  if (!m) return "—";
  return m >= 10000 ? "10+ km" : `${(m / 1000).toFixed(1)} km`;
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
    const sc  = theme.light ? "#475569" : "rgba(255,255,255,0.68)";
    const bc  = theme.light ? "rgba(15,23,42,0.10)" : "rgba(255,255,255,0.13)";
    const glb = theme.light ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.20)";

    const windKmh = Math.round(speed * 3.6);
    const gustKmh = gust ? Math.round(gust * 3.6) : null;

    const stats = [
      { label: "Feels like",  value: fmt(feels_like) },
      { label: "Humidity",    value: `${humidity}%` },
      { label: "Wind",        value: `${windKmh} km/h ${getWindDir(windDeg)}${gustKmh ? ` · G ${gustKmh}` : ""}` },
      { label: "Pressure",    value: `${pressure} hPa` },
      { label: "Cloud cover", value: `${clouds.all}%` },
      { label: "Visibility",  value: getVisibility(visibility) },
    ];

    const displayUrl = (shareUrl ?? "kilamate.netlify.app").replace(/^https?:\/\//, "");

    return (
      <div
        ref={ref}
        style={{
          position: "absolute", left: "-9999px", top: 0,
          width: "1080px", height: "1080px",
          background: theme.bg,
          color: tc,
          fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        {/* Orbs */}
        <div style={{ position:"absolute", top:-140, right:-140, width:560, height:560, background:theme.orb1, borderRadius:"50%", filter:"blur(110px)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:-180, left:-180, width:650, height:650, background:theme.orb2, borderRadius:"50%", filter:"blur(130px)", pointerEvents:"none" }} />

        {/* ── TOP BAR ── */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"50px 60px 0", position:"relative", zIndex:10 }}>
          {/* Location + date */}
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              {/* pin icon */}
              <div style={{ width:40, height:40, borderRadius:12, background:glb, border:`1.5px solid ${bc}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={tc} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <span style={{ fontSize:44, fontWeight:900, letterSpacing:-1, lineHeight:1 }}>{locationName}</span>
              <span style={{ fontSize:28, fontWeight:700, color:sc, lineHeight:1, paddingTop:4 }}>{country}</span>
            </div>
            <p style={{ fontSize:20, fontWeight:600, color:sc, letterSpacing:2.5, textTransform:"uppercase", marginTop:10, paddingLeft:54 }}>
              {format(new Date(), "EEEE, MMMM d · h:mm a")}
            </p>
          </div>

          {/* Kilamate badge */}
          <div style={{ padding:"12px 24px", borderRadius:9999, background:glb, border:`1.5px solid ${bc}`, display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill={theme.accent}><path d="M17 8C8 10 5.9 16.17 3.82 19.82A1 1 0 005.23 21C9 19 15 17 17 8z"/></svg>
            <span style={{ fontSize:17, fontWeight:800, letterSpacing:2.5, textTransform:"uppercase" }}>Kilamate</span>
          </div>
        </div>

        {/* ── HERO ── */}
        <div style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"32px 60px 20px",
          position:"relative", zIndex:10, flex:1,
        }}>
          {/* Left: temp + description + H/L stacked cleanly */}
          <div style={{ display:"flex", flexDirection:"column", gap:0, flex:1, minWidth:0 }}>

            {/* Temperature — sized to never overflow */}
            <span style={{
              fontSize: 180,
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: -6,
              textShadow: "0 20px 50px rgba(0,0,0,0.18)",
              display: "block",
            }}>
              {fmt(temp)}
            </span>

            {/* Description — sits clearly below temp */}
            <span style={{
              fontSize: 36,
              fontWeight: 700,
              textTransform: "capitalize",
              color: tc,
              marginTop: 14,
              lineHeight: 1.2,
              display: "block",
            }}>
              {cw.description}
            </span>

            {/* H / L */}
            <div style={{ display:"flex", alignItems:"center", gap:18, marginTop:16 }}>
              <span style={{ fontSize:28, fontWeight:800, color:theme.accent }}>↑ {fmt(temp_max)}</span>
              <span style={{ width:5, height:5, borderRadius:3, background:sc, display:"inline-block" }} />
              <span style={{ fontSize:28, fontWeight:800, color:sc }}>↓ {fmt(temp_min)}</span>
            </div>
          </div>

          {/* Right: weather icon */}
          <div style={{ position:"relative", width:280, height:280, flexShrink:0, marginLeft:20 }}>
            <div style={{
              position:"absolute", inset:0,
              background:"rgba(255,255,255,0.15)",
              borderRadius:"50%",
              filter:"blur(48px)",
              transform:"scale(1.45)",
            }} />
            <img
              src={icon}
              alt={cw.description}
              style={{
                width:"100%", height:"100%",
                objectFit:"contain",
                position:"relative", zIndex:1,
                filter:"brightness(1.12) contrast(1.05) drop-shadow(0 16px 36px rgba(0,0,0,0.28))",
              }}
            />
          </div>
        </div>

        {/* ── STATS GRID ── */}
        <div style={{
          display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:14,
          padding:"0 60px",
          position:"relative", zIndex:10,
        }}>
          {stats.map(({ label, value }) => (
            <div key={label} style={{ background:glb, border:`1.5px solid ${bc}`, borderRadius:22, padding:"18px 24px" }}>
              <p style={{ fontSize:15, fontWeight:600, color:sc, letterSpacing:1.5, textTransform:"uppercase", marginBottom:6 }}>{label}</p>
              <p style={{ fontSize:26, fontWeight:800, color:tc, letterSpacing:-0.3 }}>{value}</p>
            </div>
          ))}
        </div>

        {/* ── FOOTER ── */}
        <div style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"22px 60px 46px",
          position:"relative", zIndex:10,
        }}>
          {/* URL pill */}
          <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 20px", borderRadius:9999, background:glb, border:`1.5px solid ${bc}` }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
            </svg>
            <span style={{ fontSize:17, fontWeight:700, color:sc, letterSpacing:0.3 }}>{displayUrl}</span>
          </div>

          {/* Creator credit */}
          <span style={{ fontSize:18, fontWeight:700, color:sc, letterSpacing:0.5 }}>
            by{" "}
            <span style={{ color:tc, fontWeight:900 }}>Zuhaib</span>
            {" "}·{" "}
            <span style={{ color:theme.accent, fontWeight:800 }}>Kilamate Weather</span>
          </span>
        </div>
      </div>
    );
  }
);

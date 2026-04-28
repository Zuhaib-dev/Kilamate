import { useState } from "react";
import { Share2, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { formatTemperature } from "@/lib/units";
import type { WeatherData } from "@/api/types";
import type { TemperatureUnit } from "@/hooks/use-preferences";

interface ShareButtonProps {
  weather?: WeatherData;
  locationName: string;
  country?: string;
  temperatureUnit: TemperatureUnit;
  lat?: number;
  lon?: number;
}

// ── Detect mobile to limit canvas size ──────────────────────────────────────
function isMobile() {
  return /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent);
}

// ── Theme per weather condition ──────────────────────────────────────────────
function getTheme(id: number, isDay: boolean) {
  if (!isDay) return { stops: ["#0f172a", "#1e1b4b", "#020617"], accent: "#818cf8", light: false };
  if (id >= 200 && id < 300) return { stops: ["#0f172a", "#1e1b4b", "#3730a3"], accent: "#a78bfa", light: false };
  if (id >= 300 && id < 600) return { stops: ["#0c4a6e", "#075985", "#0369a1"], accent: "#7dd3fc", light: false };
  if (id >= 600 && id < 700) return { stops: ["#dbeafe", "#eff6ff", "#f0f9ff"], accent: "#2563eb", light: true };
  if (id >= 700 && id < 800) return { stops: ["#1e293b", "#334155", "#475569"], accent: "#94a3b8", light: false };
  if (id === 800)             return { stops: ["#0c4a6e", "#0ea5e9", "#7dd3fc"], accent: "#fde68a", light: false };
  return                             { stops: ["#1e3a5f", "#1d4ed8", "#3b82f6"], accent: "#bfdbfe", light: false };
}

function getWindDir(deg: number) {
  return ["N","NE","E","SE","S","SW","W","NW"][Math.round(deg / 45) % 8];
}

function getVisibility(m?: number) {
  if (!m) return "—";
  return m >= 10000 ? "10+ km" : `${(m / 1000).toFixed(1)} km`;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => {
      // Try without crossOrigin as a fallback (some CDNs)
      const fallback = new Image();
      fallback.onload = () => resolve(fallback);
      fallback.onerror = reject;
      fallback.src = src;
    };
    img.src = src;
  });
}

// ── Core canvas drawing function ─────────────────────────────────────────────
async function generateWeatherCanvas(
  weather: WeatherData,
  locationName: string,
  country: string,
  temperatureUnit: TemperatureUnit,
  shareUrl: string,
): Promise<HTMLCanvasElement> {
  // Use 1x on mobile to stay within memory limits; 2x on desktop
  const DPR  = isMobile() ? 1 : 2;
  const SIZE = 1080;

  const canvas = document.createElement("canvas");
  canvas.width  = SIZE * DPR;
  canvas.height = SIZE * DPR;

  const ctx = canvas.getContext("2d")!;
  ctx.scale(DPR, DPR);

  const {
    weather: [cw],
    main: { temp, feels_like, temp_max, temp_min, humidity, pressure },
    wind: { speed, deg: windDeg, gust },
    sys: { sunrise, sunset },
    visibility,
    clouds,
  } = weather;

  const now   = Date.now() / 1000;
  const isDay = now > sunrise && now < sunset;
  const theme = getTheme(cw.id, isDay);

  const tc  = theme.light ? "#1e293b" : "#ffffff";
  const sc  = theme.light ? "#475569" : "rgba(255,255,255,0.68)";
  const glb = theme.light ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.22)";
  const bc  = theme.light ? "rgba(15,23,42,0.10)"    : "rgba(255,255,255,0.14)";

  const fmt = (t: number) => formatTemperature(t, temperatureUnit);

  // ── Background gradient ────────────────────────────────────────────────────
  const bgGrad = ctx.createLinearGradient(0, 0, SIZE, SIZE);
  bgGrad.addColorStop(0, theme.stops[0]);
  bgGrad.addColorStop(0.5, theme.stops[1]);
  bgGrad.addColorStop(1, theme.stops[2]);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // ── Orb glow (top-right) ──────────────────────────────────────────────────
  {
    const r = ctx.createRadialGradient(SIZE + 60, -60, 0, SIZE + 60, -60, 400);
    r.addColorStop(0, theme.accent + "40");
    r.addColorStop(1, "transparent");
    ctx.fillStyle = r;
    ctx.fillRect(0, 0, SIZE, SIZE);
  }
  {
    const r = ctx.createRadialGradient(-80, SIZE + 80, 0, -80, SIZE + 80, 500);
    r.addColorStop(0, "rgba(0,0,0,0.35)");
    r.addColorStop(1, "transparent");
    ctx.fillStyle = r;
    ctx.fillRect(0, 0, SIZE, SIZE);
  }

  // ── Helper: rounded rectangle ────────────────────────────────────────────
  function roundRect(x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function glassRect(x: number, y: number, w: number, h: number, r: number) {
    roundRect(x, y, w, h, r);
    ctx.fillStyle = glb;
    ctx.fill();
    ctx.strokeStyle = bc;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  const PAD = 60;

  // ── TOP BAR ──────────────────────────────────────────────────────────────
  const topY = 52;

  // Pin icon box
  glassRect(PAD, topY, 40, 40, 12);
  ctx.strokeStyle = tc;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(PAD + 20, topY + 17, 7, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(PAD + 20, topY + 24);
  ctx.lineTo(PAD + 20, topY + 32);
  ctx.stroke();

  // City name
  ctx.fillStyle = tc;
  ctx.font = "bold 44px 'Inter', 'Segoe UI', system-ui, sans-serif";
  ctx.fillText(locationName, PAD + 54, topY + 32);

  // Country
  const cityW = ctx.measureText(locationName).width;
  ctx.fillStyle = sc;
  ctx.font = "bold 28px 'Inter', 'Segoe UI', system-ui, sans-serif";
  ctx.fillText(country, PAD + 54 + cityW + 12, topY + 30);

  // Date line
  const dateStr = new Date().toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric" })
    + " · " + new Date().toLocaleTimeString("en-US", { hour:"numeric", minute:"2-digit" });
  ctx.fillStyle = sc;
  ctx.font = "600 20px 'Inter','Segoe UI',system-ui,sans-serif";
  ctx.fillText(dateStr, PAD + 54, topY + 62);

  // Kilamate badge (top-right)
  const badgeText = "KILAMATE";
  ctx.font = "800 17px 'Inter','Segoe UI',system-ui,sans-serif";
  const badgeW = ctx.measureText(badgeText).width + 48;
  const badgeX = SIZE - PAD - badgeW;
  glassRect(badgeX, topY, badgeW, 40, 9999);
  ctx.fillStyle = tc;
  ctx.fillText(badgeText, badgeX + 24, topY + 26);

  // ── HERO (temp + icon) ────────────────────────────────────────────────────
  const heroY = 160;

  // Huge temperature
  ctx.fillStyle = tc;
  ctx.font = "900 170px 'Inter','Segoe UI',system-ui,sans-serif";
  const tempStr = fmt(temp);
  ctx.fillText(tempStr, PAD, heroY + 155);

  // Weather description — clearly below temp
  ctx.fillStyle = tc;
  ctx.font = "700 36px 'Inter','Segoe UI',system-ui,sans-serif";
  const desc = cw.description.charAt(0).toUpperCase() + cw.description.slice(1);
  ctx.fillText(desc, PAD, heroY + 155 + 52);

  // H / L
  ctx.fillStyle = theme.accent;
  ctx.font = "800 28px 'Inter','Segoe UI',system-ui,sans-serif";
  ctx.fillText(`↑ ${fmt(temp_max)}`, PAD, heroY + 155 + 52 + 46);
  const hlW = ctx.measureText(`↑ ${fmt(temp_max)}`).width;

  ctx.fillStyle = sc;
  ctx.beginPath();
  ctx.arc(PAD + hlW + 16, heroY + 155 + 52 + 46 - 6, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = sc;
  ctx.font = "800 28px 'Inter','Segoe UI',system-ui,sans-serif";
  ctx.fillText(`↓ ${fmt(temp_min)}`, PAD + hlW + 30, heroY + 155 + 52 + 46);

  // Weather icon (right side of hero)
  const iconSize = 260;
  const iconX = SIZE - PAD - iconSize;
  const iconY = heroY - 10;
  try {
    const iconUrl = `https://openweathermap.org/img/wn/${cw.icon}@4x.png`;
    const iconImg = await loadImage(iconUrl);

    // Glow behind icon
    const glow = ctx.createRadialGradient(
      iconX + iconSize / 2, iconY + iconSize / 2, 0,
      iconX + iconSize / 2, iconY + iconSize / 2, iconSize * 0.7
    );
    glow.addColorStop(0, "rgba(255,255,255,0.18)");
    glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(iconX + iconSize / 2, iconY + iconSize / 2, iconSize * 0.7, 0, Math.PI * 2);
    ctx.fill();

    ctx.drawImage(iconImg, iconX, iconY, iconSize, iconSize);
  } catch {
    // Silently skip icon if it can't load
  }

  // ── STATS GRID (3 × 2) ───────────────────────────────────────────────────
  const windKmh = Math.round(speed * 3.6);
  const gustKmh = gust ? Math.round(gust * 3.6) : null;

  const stats = [
    { label: "Feels like",  value: fmt(feels_like) },
    { label: "Humidity",    value: `${humidity}%` },
    { label: "Wind",        value: `${windKmh} km/h ${getWindDir(windDeg)}${gustKmh ? ` · G${gustKmh}` : ""}` },
    { label: "Pressure",    value: `${pressure} hPa` },
    { label: "Cloud cover", value: `${clouds.all}%` },
    { label: "Visibility",  value: getVisibility(visibility) },
  ];

  const gridTop  = 700;
  const cellW    = (SIZE - PAD * 2 - 14 * 2) / 3;
  const cellH    = 110;

  stats.forEach(({ label, value }, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x   = PAD + col * (cellW + 14);
    const y   = gridTop + row * (cellH + 14);

    glassRect(x, y, cellW, cellH, 18);

    ctx.fillStyle = sc;
    ctx.font = "600 14px 'Inter','Segoe UI',system-ui,sans-serif";
    ctx.fillText(label.toUpperCase(), x + 22, y + 34);

    ctx.fillStyle = tc;
    ctx.font = "800 24px 'Inter','Segoe UI',system-ui,sans-serif";
    // Clip long values
    const maxW = cellW - 44;
    let val = value;
    while (ctx.measureText(val).width > maxW && val.length > 3) {
      val = val.slice(0, -1);
    }
    ctx.fillText(val, x + 22, y + 74);
  });

  // ── FOOTER ───────────────────────────────────────────────────────────────
  const footerY = 970;
  const displayUrl = shareUrl.replace(/^https?:\/\//, "");

  // URL pill
  ctx.font = "700 17px 'Inter','Segoe UI',system-ui,sans-serif";
  const urlW = ctx.measureText(displayUrl).width + 52;
  glassRect(PAD, footerY, urlW, 36, 9999);
  ctx.fillStyle = theme.accent;
  ctx.font = "700 17px 'Inter','Segoe UI',system-ui,sans-serif";
  ctx.fillText(displayUrl, PAD + 26, footerY + 24);

  // Creator credit
  ctx.fillStyle = sc;
  ctx.font = "700 18px 'Inter','Segoe UI',system-ui,sans-serif";
  const creditX = SIZE - PAD;
  const credit1 = "by ";
  const credit2 = "Zuhaib";
  const credit3 = " · ";
  const credit4 = "Kilamate Weather";

  const w4 = ctx.measureText(credit4).width;
  ctx.fillStyle = theme.accent;
  ctx.font = "800 18px 'Inter','Segoe UI',system-ui,sans-serif";
  ctx.fillText(credit4, creditX - w4, footerY + 24);

  const w3 = ctx.measureText(credit3).width;
  ctx.fillStyle = sc;
  ctx.font = "700 18px 'Inter','Segoe UI',system-ui,sans-serif";
  ctx.fillText(credit3, creditX - w4 - w3, footerY + 24);

  const w2 = ctx.measureText(credit2).width;
  ctx.fillStyle = tc;
  ctx.font = "900 18px 'Inter','Segoe UI',system-ui,sans-serif";
  ctx.fillText(credit2, creditX - w4 - w3 - w2, footerY + 24);

  const w1 = ctx.measureText(credit1).width;
  ctx.fillStyle = sc;
  ctx.font = "700 18px 'Inter','Segoe UI',system-ui,sans-serif";
  ctx.fillText(credit1, creditX - w4 - w3 - w2 - w1, footerY + 24);

  return canvas;
}

// ── Share Button Component ────────────────────────────────────────────────────
export function ShareButton({ weather, locationName, country = "", temperatureUnit, lat, lon }: ShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false);

  const shareUrl = lat && lon
    ? `https://kilamate.netlify.app/city/${encodeURIComponent(locationName)}?lat=${lat}&lon=${lon}`
    : "https://kilamate.netlify.app";

  const handleShare = async () => {
    if (!weather) return;

    try {
      setIsSharing(true);
      toast.loading("Generating snapshot…", { id: "share-toast" });

      const canvas = await generateWeatherCanvas(weather, locationName, country, temperatureUnit, shareUrl);

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), "image/png", 0.95);
      });

      if (!blob) throw new Error("Canvas conversion failed");

      const safeName = locationName.toLowerCase().replace(/\s+/g, "-");
      const file = new File([blob], `kilamate-${safeName}-weather.png`, { type: "image/png" });

      toast.dismiss("share-toast");

      // ── Native share (mobile first) ──────────────────────────────────────
      if (navigator.share) {
        const shareData: ShareData = {
          title: `${locationName} Weather on Kilamate`,
          text: `📍 Current weather in ${locationName}! See the full forecast:`,
          url: shareUrl,
        };
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          (shareData as any).files = [file];
        }
        await navigator.share(shareData);
        toast.success("Shared successfully!");
        return;
      }

      // ── Desktop: download + copy link ────────────────────────────────────
      const objUrl = URL.createObjectURL(blob);
      const link   = document.createElement("a");
      link.download = file.name;
      link.href     = objUrl;
      link.click();
      URL.revokeObjectURL(objUrl);

      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Image downloaded & link copied!");
      } catch {
        toast.success("Snapshot downloaded!");
      }
    } catch (err: any) {
      if (err?.name === "AbortError") return; // User cancelled
      console.error("Share error:", err);
      toast.error("Could not share. Please try again.", { id: "share-toast" });
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={handleShare}
            disabled={isSharing || !weather}
            className={`transition-all duration-300 ${
              isSharing ? "opacity-70" : "hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
            }`}
          >
            {isSharing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent><p>Share weather snapshot + link</p></TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

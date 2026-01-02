import React from "react";
import { Link } from "react-router-dom"; // Use Link for faster SPA navigation
import { Home, CloudRain, Zap, CloudOff } from "lucide-react";
import { Button } from "@/components/ui/button"; // Assuming you have shadcn button, otherwise use standard <button>

const PageNotFound: React.FC = () => {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-full overflow-hidden bg-slate-950 text-gray-100 p-4">
      {/* --- Background Effects --- */}
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-slate-900/80 to-slate-950 z-0 pointer-events-none" />

      {/* Floating Background Icons */}
      <Zap className="absolute top-20 left-10 text-yellow-500/20 w-24 h-24 animate-pulse z-0" />
      <CloudRain className="absolute bottom-20 right-10 text-blue-500/10 w-32 h-32 animate-bounce z-0 duration-[3000ms]" />
      <CloudOff className="absolute top-1/3 right-1/4 text-gray-600/20 w-16 h-16 animate-pulse z-0" />

      {/* --- Main Content Card --- */}
      <div className="relative z-10 flex flex-col items-center max-w-2xl w-full text-center space-y-8">
        {/* Weather GIF Container */}
        <div className="relative w-full max-w-md aspect-video rounded-3xl overflow-hidden shadow-2xl border border-slate-700/50">
          <div className="absolute inset-0 bg-slate-900/20 z-10" />{" "}
          {/* Slight overlay to blend it */}
          <iframe
            src="https://giphy.com/embed/l0Exk8EUzSLsrErEQ"
            className="w-full h-full pointer-events-none scale-150" // scale-150 zooms in to hide giphy watermarks
            frameBorder="0"
            allowFullScreen
            title="Storm Weather"
          />
        </div>

        {/* Text Content */}
        <div className="space-y-4">
          <h1 className="text-8xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-600 drop-shadow-2xl">
            404
          </h1>

          <h2 className="text-2xl md:text-4xl font-bold text-slate-200">
            Lost in the Clouds? 🌩️
          </h2>

          <p className="text-lg text-slate-400 max-w-lg mx-auto leading-relaxed">
            The forecast says this page doesn't exist. It might have drifted
            away in the storm or never existed at all.
          </p>
        </div>

        {/* Action Button */}
        <Link to="/">
          <Button
            size="lg"
            className="group relative bg-blue-600 hover:bg-blue-500 text-white px-8 py-6 text-lg rounded-full shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_60px_-15px_rgba(37,99,235,0.6)]"
          >
            <Home className="mr-2 h-5 w-5 transition-transform group-hover:-translate-y-1" />
            Return to Safety
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default PageNotFound;

import React from "react";
import { Moon, Home } from "lucide-react";

const PageNotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen overflow-hidden bg-black text-gray-100 px-6 text-center">
      {/* Weather GIF */}
      <iframe
        src="https://giphy.com/embed/l0Exk8EUzSLsrErEQ"
        width="250"
        height="250"
        className="rounded-2xl shadow-xl mb-8 border border-gray-800"
        allowFullScreen
      ></iframe>

      {/* 404 Title */}
      <h1 className="text-7xl font-extrabold tracking-tight text-white mb-4 drop-shadow-lg">
        404
      </h1>
      <h2 className="text-2xl md:text-3xl font-semibold text-gray-300 mb-4">
        Oops! This page drifted into the storm 🌩️
      </h2>

      {/* Message */}
      <p className="text-lg md:text-xl text-gray-400 max-w-lg mb-8 leading-relaxed">
        The page you’re looking for doesn’t exist or might have moved.  
        Let’s head back to clearer skies.
      </p>

      {/* Action Button */}
      <a
        href="/"
        className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-sky-500 text-white px-6 py-3 rounded-2xl font-medium shadow-md hover:shadow-lg hover:scale-105 transition-all"
      >
        <Home size={18} />
        Take Me Home
      </a>

      {/* Footer */}
      <div className="absolute bottom-6 flex items-center gap-2 text-gray-500 text-sm">
        <Moon size={16} />
        <span>Dark Mode • Minimal & Elegant</span>
      </div>
    </div>
  );
};

export default PageNotFound;

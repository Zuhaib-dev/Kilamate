import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./lib/i18n"; // Initialize i18n
import App from "./App.tsx";
import { registerSW } from "virtual:pwa-register";

// Register Service Worker — auto-update silently, never block page render
registerSW({
  onNeedRefresh() {
    // Silently reload to get the latest version
    window.location.reload();
  },
  onOfflineReady() {
    console.log("App ready to work offline");
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "./components/ui/sonner";
import { WeatherDashboard } from "./pages/weather-dashboard";
import { Layout } from "./components/layout";
import { ThemeProvider, useTheme } from "./context/theme-provider";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { CityPage } from "./pages/city-page";
import { ErrorBoundary } from "./components/error-boundary";
import { useKeyboardShortcuts } from "./hooks/use-keyboard-shortcuts";
import { KeyboardShortcutsDialog } from "./components/keyboard-shortcuts-dialog";
import { useState } from "react";
import { toast } from "sonner";
import { useNotifications } from "./hooks/use-notifications";

// Redirect to static files if accessed via React Router
const staticFiles = ['/sitemap.xml', '/robots.txt', '/site.webmanifest'];
if (staticFiles.includes(window.location.pathname)) {
  window.location.href = window.location.pathname;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes (increased from 5)
      retry: 2,
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      refetchOnReconnect: true, // Refetch when network reconnects
      refetchInterval: false, // Don't auto-refetch
      refetchIntervalInBackground: false,
      // Enable offline mode - use cached data when offline
      networkMode: 'offlineFirst', // Try cache first, then network
    },
  },
});

function AppContent() {
  const [showShortcuts, setShowShortcuts] = useState(false);
  const { setTheme, theme } = useTheme();
  const { requestPermission, permission } = useNotifications();

  useKeyboardShortcuts([
    {
      key: "k",
      alt: true,
      description: "Open search",
      callback: () => {
        const searchButton = document.querySelector('[aria-label="Search for cities"]') as HTMLButtonElement;
        if (searchButton) {
          searchButton.click();
          setTimeout(() => {
            const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
            if (searchInput) {
              searchInput.focus();
            }
          }, 100);
          toast.info("Search opened");
        }
      },
    },
    {
      key: "t",
      alt: true,
      description: "Toggle theme",
      callback: () => {
        const newTheme = theme === "dark" ? "light" : "dark";
        setTheme(newTheme);
        toast.success(`Switched to ${newTheme} mode`);
      },
    },
    {
      key: "n",
      alt: true,
      description: "Toggle notifications",
      callback: () => {
        if (permission === "granted") {
          toast.info("Notifications are already enabled");
        } else {
          requestPermission();
        }
      },
    },
    {
      key: "r",
      ctrl: true,
      description: "Refresh weather data",
      callback: () => {
        queryClient.invalidateQueries();
        toast.success("Weather data refreshed!");
      },
    },
    {
      key: "?",
      shift: true,
      description: "Show keyboard shortcuts",
      callback: () => {
        setShowShortcuts(true);
      },
    },
  ]);

  return (
    <>
      <Layout>
        <Routes>
          <Route path="/" element={<WeatherDashboard />} />
          <Route path="/city/:cityName" element={<CityPage />} />
        </Routes>
      </Layout>
      <Toaster richColors />
      <KeyboardShortcutsDialog open={showShortcuts} onOpenChange={setShowShortcuts} />
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        {/* ADD THE FUTURE FLAGS HERE 👇 */}
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ThemeProvider defaultTheme="dark">
            <AppContent />
          </ThemeProvider>
        </BrowserRouter>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
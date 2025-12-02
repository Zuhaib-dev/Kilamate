import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "./components/ui/sonner";
import { WeatherDashboard } from "./pages/weather-dashboard";
import { Layout } from "./components/layout";
import { ThemeProvider } from "./context/theme-provider";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { CityPage } from "./pages/city-page";
import PageNotFound from "./pages/PageNotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Weather changes quickly → keep data fresh
      staleTime: 30 * 1000,          // 30 seconds
      // Keep cache a bit to avoid refetch spam when navigating
      gcTime: 5 * 60 * 1000,         // 5 minutes
      // Small retry for flaky network
      retry: 1,
      // Refetch when user comes back to tab
      refetchOnWindowFocus: true,
      // Auto‑refetch while component is mounted (dashboard open)
      refetchInterval: 60 * 1000,    // 60 seconds
      refetchIntervalInBackground: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider defaultTheme="dark">
          <Layout>
            <Routes>
              <Route path="/" element={<WeatherDashboard />} />
              <Route path="/city/:cityName" element={<CityPage />} />
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </Layout>
          <Toaster richColors />
        </ThemeProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;

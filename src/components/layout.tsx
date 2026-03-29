import { Header } from "./header";
import { InstallPrompt } from "./install-prompt";
import { OfflineIndicator } from "./offline-indicator";
import { Footer } from "./footer";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted transition-colors duration-300">
      <div className="relative flex flex-col min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-grow">{children}</main>
        <InstallPrompt />
        <OfflineIndicator />
        <Footer />
      </div>
    </div>
  );
}

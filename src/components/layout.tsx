import { Header } from "./header";
import { InstallPrompt } from "./install-prompt";
import { OfflineIndicator } from "./offline-indicator";
import { Footer } from "./footer";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Header />
      <main className="container mx-auto px-4 py-8">{children}</main>
      <InstallPrompt />
      <OfflineIndicator />
      <Footer />
    </div>
  );
}

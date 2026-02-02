import { Header } from "./header";
import { InstallPrompt } from "./install-prompt";
import { OfflineIndicator } from "./offline-indicator";

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
      <footer className="border-t backdrop-blur supports-[backdrop-filter]:bg-background/60 py-12">
        <div className="container mx-auto px-4 text-center text-gray-700 dark:text-gray-300">
          <p>
            Made with <span className="text-2xl">💗</span> by{" "}
            <span id="owner">
              <a href="https://www.zuhaibrashid.com/" target="_blank" rel="noopener noreferrer">
                Zuhaib Rashid
              </a>
            </span>
          </p>
        </div>
      </footer>
    </div>
  );
}

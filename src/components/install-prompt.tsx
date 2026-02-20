import { Download, X } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { usePWA } from "@/hooks/use-pwa";
import { useState } from "react";

const SNOOZE_KEY = "pwa-install-snoozed-until";
const SNOOZE_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function isSnoozed(): boolean {
  const snoozedUntil = localStorage.getItem(SNOOZE_KEY);
  if (!snoozedUntil) return false;
  return Date.now() < parseInt(snoozedUntil, 10);
}

export function InstallPrompt() {
  const { isInstallable, installApp } = usePWA();
  // Initialise dismissed from localStorage so it persists across page loads
  const [dismissed, setDismissed] = useState(() => isSnoozed());

  const handleLater = () => {
    // Snooze for 7 days
    localStorage.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_DURATION_MS));
    setDismissed(true);
  };

  const handleInstall = () => {
    installApp();
    // Clear any existing snooze since the user accepted
    localStorage.removeItem(SNOOZE_KEY);
  };

  if (!isInstallable || dismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom-5">
      <Card className="border-2 border-primary shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Install Kilamate</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Install our app for quick access and offline support!
              </p>
              <div className="flex gap-2">
                <Button onClick={handleInstall} size="sm" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Install
                </Button>
                <Button onClick={handleLater} variant="outline" size="sm">
                  Later
                </Button>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleLater}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

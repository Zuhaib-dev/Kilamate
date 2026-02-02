import { Download, X } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { usePWA } from "@/hooks/use-pwa";
import { useState } from "react";

export function InstallPrompt() {
    const { isInstallable, installApp } = usePWA();
    const [dismissed, setDismissed] = useState(false);

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
                                <Button onClick={installApp} size="sm" className="flex-1">
                                    <Download className="h-4 w-4 mr-2" />
                                    Install
                                </Button>
                                <Button
                                    onClick={() => setDismissed(true)}
                                    variant="outline"
                                    size="sm"
                                >
                                    Later
                                </Button>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => setDismissed(true)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

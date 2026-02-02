import { Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "./ui/alert";

export function OfflineIndicator() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    if (isOnline) {
        return null;
    }

    return (
        <div className="fixed top-20 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-top-5">
            <Alert variant="destructive">
                <WifiOff className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                    <span>You're offline. Showing cached data.</span>
                    <Wifi className="h-4 w-4 opacity-50" />
                </AlertDescription>
            </Alert>
        </div>
    );
}

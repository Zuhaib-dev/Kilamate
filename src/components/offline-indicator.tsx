import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";

export function OfflineIndicator() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [showOfflineMessage, setShowOfflineMessage] = useState(!navigator.onLine);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            setShowOfflineMessage(false);
        };

        const handleOffline = () => {
            setIsOnline(false);
            setShowOfflineMessage(true);
        };

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    const handleRefresh = () => {
        if (navigator.onLine) {
            window.location.reload();
        }
    };

    if (!showOfflineMessage) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
            <Alert variant="destructive" className="border-orange-500 bg-orange-50 dark:bg-orange-950">
                <WifiOff className="h-4 w-4" />
                <AlertTitle>You're Offline</AlertTitle>
                <AlertDescription className="space-y-2">
                    <p className="text-sm">
                        You're currently offline. Showing cached weather data.
                        {!isOnline && " Connect to the internet to get fresh updates."}
                    </p>
                    {isOnline && (
                        <Button
                            onClick={handleRefresh}
                            variant="outline"
                            size="sm"
                            className="mt-2"
                        >
                            <RefreshCw className="mr-2 h-3 w-3" />
                            Refresh Data
                        </Button>
                    )}
                </AlertDescription>
            </Alert>
        </div>
    );
}

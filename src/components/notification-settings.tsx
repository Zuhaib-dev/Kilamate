import { Bell, BellOff } from "lucide-react";
import { Button } from "./ui/button";
import { useNotifications } from "@/hooks/use-notifications";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "./ui/tooltip";
import { useTranslation } from "react-i18next";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { toast } from "sonner";

export function NotificationSettings() {
    const { permission, requestPermission, isSupported } = useNotifications();
    const { t } = useTranslation();
    const [notificationsEnabled, setNotificationsEnabled] = useLocalStorage("notifications-enabled", false);

    if (!isSupported) {
        return null;
    }

    const handleToggle = async () => {
        // If browser permission not granted, request it
        if (permission !== "granted") {
            const result = await requestPermission();
            if (result === "granted") {
                setNotificationsEnabled(true);
            }
        } else {
            // Toggle app-level notification setting
            const newState = !notificationsEnabled;
            setNotificationsEnabled(newState);

            if (newState) {
                toast.success(t('notifications.enabled'));
            } else {
                toast.info(t('notifications.disabled'));
            }
        }
    };

    // Notifications are enabled if both browser permission is granted AND app setting is enabled
    const isEnabled = permission === "granted" && notificationsEnabled;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleToggle}
                        aria-label={isEnabled ? t('notifications.enabled') : t('notifications.enable')}
                        className={isEnabled ? "bg-green-500/10 border-green-500/50" : ""}
                    >
                        {isEnabled ? (
                            <Bell className="h-4 w-4 text-green-500" />
                        ) : (
                            <BellOff className="h-4 w-4" />
                        )}
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>
                        {isEnabled
                            ? t('notifications.enabled')
                            : t('notifications.enable')}
                    </p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

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

export function NotificationSettings() {
    const { permission, requestPermission, isSupported } = useNotifications();
    const { t } = useTranslation();

    if (!isSupported) {
        return null;
    }

    const handleToggle = async () => {
        if (permission !== "granted") {
            await requestPermission();
        }
    };

    const isEnabled = permission === "granted";

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

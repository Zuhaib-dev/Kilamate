import { Bell, BellOff, Settings2, Sprout, Sun, Shirt } from "lucide-react";
import { Button } from "./ui/button";
import { useNotifications } from "@/hooks/use-notifications";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "./ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
} from "./ui/dropdown-menu";
import { useTranslation } from "react-i18next";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { toast } from "sonner";

export function NotificationSettings() {
    const { permission, requestPermission, isSupported } = useNotifications();
    const { t } = useTranslation();
    
    // Settings
    const [notificationsEnabled, setNotificationsEnabled] = useLocalStorage("notifications-enabled", false);
    const [notifAgri, setNotifAgri] = useLocalStorage("notifications-agriculture", true);
    const [notifProt, setNotifProt] = useLocalStorage("notifications-protection", true);
    const [notifCloth, setNotifCloth] = useLocalStorage("notifications-clothing", true);

    if (!isSupported) {
        return null;
    }

    const handleGlobalToggle = async () => {
        if (permission !== "granted") {
            const result = await requestPermission();
            if (result === "granted") {
                setNotificationsEnabled(true);
            }
        } else {
            const newState = !notificationsEnabled;
            setNotificationsEnabled(newState);
            if (newState) {
                toast.success(t('notifications.enabled'));
            } else {
                toast.info(t('notifications.disabled'));
            }
        }
    };

    const isEnabled = permission === "granted" && notificationsEnabled;

    return (
        <TooltipProvider>
            <DropdownMenu>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                aria-label={isEnabled ? t('notifications.enabled') : t('notifications.enable')}
                                className={isEnabled ? "bg-green-500/10 border-green-500/50" : ""}
                            >
                                {isEnabled ? (
                                    <Bell className="h-4 w-4 text-green-500" />
                                ) : (
                                    <BellOff className="h-4 w-4" />
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>
                            {isEnabled
                                ? t('notifications.enabled')
                                : t('notifications.enable')}
                            <kbd className="ml-2 px-1 py-0.5 text-[10px] uppercase font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">N</kbd>
                        </p>
                    </TooltipContent>
                </Tooltip>

                <DropdownMenuContent align="end" className="w-64 p-2">
                    <DropdownMenuLabel className="flex items-center gap-2">
                        <Settings2 className="h-4 w-4" />
                        <span>Notification Preferences</span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuCheckboxItem
                        checked={notificationsEnabled}
                        onCheckedChange={handleGlobalToggle}
                        className="font-bold"
                    >
                        Master Switch
                    </DropdownMenuCheckboxItem>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
                        Categories
                    </DropdownMenuLabel>

                    <DropdownMenuCheckboxItem
                        checked={notifAgri}
                        onCheckedChange={setNotifAgri}
                        disabled={!isEnabled}
                        className="flex items-center gap-2"
                    >
                        <Sprout className="h-3.5 w-3.5 mr-2 opacity-70" />
                        {t('notifications.categories.agriculture')}
                    </DropdownMenuCheckboxItem>

                    <DropdownMenuCheckboxItem
                        checked={notifProt}
                        onCheckedChange={setNotifProt}
                        disabled={!isEnabled}
                        className="flex items-center gap-2"
                    >
                        <Sun className="h-3.5 w-3.5 mr-2 opacity-70" />
                        {t('notifications.categories.protection')}
                    </DropdownMenuCheckboxItem>

                    <DropdownMenuCheckboxItem
                        checked={notifCloth}
                        onCheckedChange={setNotifCloth}
                        disabled={!isEnabled}
                        className="flex items-center gap-2"
                    >
                        <Shirt className="h-3.5 w-3.5 mr-2 opacity-70" />
                        {t('notifications.categories.clothing')}
                    </DropdownMenuCheckboxItem>

                    <DropdownMenuSeparator />
                    <div className="p-2 text-[10px] text-muted-foreground leading-tight italic">
                        Highly critical weather and air quality alerts are always enabled by default.
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
        </TooltipProvider>
    );
}

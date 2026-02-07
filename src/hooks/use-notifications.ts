import { useEffect, useState } from "react";
import { toast } from "sonner";

export type NotificationPermission = "granted" | "denied" | "default";

interface NotificationOptions {
    title: string;
    body: string;
    icon?: string;
    tag?: string;
    vibrate?: number[];
    renotify?: boolean;
}

export function useNotifications() {
    const [permission, setPermission] = useState<NotificationPermission>(
        typeof Notification !== "undefined" ? Notification.permission : "default"
    );

    useEffect(() => {
        if (typeof Notification !== "undefined") {
            setPermission(Notification.permission);
        }
    }, []);

    const requestPermission = async (): Promise<NotificationPermission> => {
        if (typeof Notification === "undefined") {
            toast.error("Notifications are not supported in this browser");
            return "denied";
        }

        if (permission === "granted") {
            return "granted";
        }

        try {
            const result = await Notification.requestPermission();
            setPermission(result);

            if (result === "granted") {
                toast.success("Notifications enabled!");
            } else {
                toast.info("Notifications disabled");
            }

            return result;
        } catch (error) {
            console.error("Error requesting notification permission:", error);
            toast.error("Failed to request notification permission");
            return "denied";
        }
    };

    const sendNotification = (options: NotificationOptions) => {
        if (typeof Notification === "undefined") {
            console.warn("Notifications not supported");
            return;
        }

        if (permission !== "granted") {
            console.warn("Notification permission not granted");
            return;
        }

        try {
            // Use Service Worker for notifications if available (better for mobile)
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                navigator.serviceWorker.ready.then((registration) => {
                    registration.showNotification(options.title, {
                        body: options.body,
                        icon: options.icon || "/logo.webp",
                        tag: options.tag,
                        badge: "/logo.webp",
                        requireInteraction: false,
                        data: { url: window.location.href }, // Pass URL to open on click
                        vibrate: [200, 100, 200], // Vibration pattern to trigger heads-up
                        renotify: true, // Alert again even if tag exists
                    } as any);
                });
            } else {
                // Fallback for desktop/no-SW
                const notification = new Notification(options.title, {
                    body: options.body,
                    icon: options.icon || "/logo.webp",
                    tag: options.tag,
                    badge: "/logo.webp",
                    requireInteraction: false,
                });

                notification.onclick = () => {
                    window.focus();
                    notification.close();
                };

                // Auto-close after 5 seconds
                setTimeout(() => notification.close(), 5000);
            }
        } catch (error) {
            console.error("Error sending notification:", error);
        }
    };

    return {
        permission,
        requestPermission,
        sendNotification,
        isSupported: typeof Notification !== "undefined",
    };
}

import { useEffect, useRef } from "react";

interface KeyboardShortcut {
    key: string;
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    callback: () => void;
    description: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
    // Keep the latest shortcuts in a ref so the listener never becomes stale
    // and we only register/unregister it once (no churn from inline array references).
    const shortcutsRef = useRef(shortcuts);
    shortcutsRef.current = shortcuts;

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Skip shortcuts when the user is typing in an input / textarea / contenteditable
            const target = event.target as HTMLElement;
            const isTyping =
                target.tagName === "INPUT" ||
                target.tagName === "TEXTAREA" ||
                target.isContentEditable;

            shortcutsRef.current.forEach((shortcut) => {
                // Allow search shortcut even while typing so the dialog can be opened
                if (isTyping && !(shortcut.ctrl || shortcut.alt)) return;

                const ctrlMatch = shortcut.ctrl
                    ? event.ctrlKey || event.metaKey
                    : !event.ctrlKey && !event.metaKey;
                const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
                const altMatch = shortcut.alt ? event.altKey : !event.altKey;
                const keyMatch =
                    event.key.toLowerCase() === shortcut.key.toLowerCase();

                if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
                    event.preventDefault();
                    shortcut.callback();
                }
            });
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    // Empty dep array: listener registered once, reads latest shortcuts via ref
    }, []);
}

export const KEYBOARD_SHORTCUTS = {
    SEARCH: { key: "k", alt: true, description: "Open search" },
    NOTIFICATIONS: { key: "n", alt: true, description: "Toggle notifications" },
    THEME: { key: "t", alt: true, description: "Toggle theme" },
    REFRESH: { key: "f5", description: "Refresh weather data" },
    HELP: { key: "?", shift: true, description: "Show keyboard shortcuts" },
} as const;

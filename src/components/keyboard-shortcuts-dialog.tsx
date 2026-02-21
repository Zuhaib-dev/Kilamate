import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Keyboard } from "lucide-react";

interface ShortcutItemProps {
  keys: string[];
  description: string;
}

function ShortcutItem({ keys, description }: ShortcutItemProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-muted-foreground">{description}</span>
      <div className="flex gap-1">
        {keys.map((key, index) => (
          <kbd
            key={index}
            className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500"
          >
            {key}
          </kbd>
        ))}
      </div>
    </div>
  );
}

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcutsDialog({
  open,
  onOpenChange,
}: KeyboardShortcutsDialogProps) {
  const shortcuts = [
    { keys: ["Alt", "K"], description: "Open search" },
    { keys: ["Alt", "T"], description: "Toggle theme" },
    { keys: ["Alt", "N"], description: "Toggle notifications" },
    { keys: ["Alt", "L"], description: "Toggle language" },
    { keys: ["F5"], description: "Refresh weather data" },
    { keys: ["Shift", "?"], description: "Show this help" },
    { keys: ["Esc"], description: "Close dialogs" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Use these shortcuts to navigate faster
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1">
          {shortcuts.map((shortcut, index) => (
            <ShortcutItem
              key={index}
              keys={shortcut.keys}
              description={shortcut.description}
            />
          ))}
        </div>
        <div className="text-xs text-muted-foreground mt-4">
          <p>
            💡 Tip: Press{" "}
            <kbd className="px-1 py-0.5 text-xs bg-gray-100 dark:bg-gray-600 rounded">
              Shift
            </kbd>{" "}
            +{" "}
            <kbd className="px-1 py-0.5 text-xs bg-gray-100 dark:bg-gray-600 rounded">
              ?
            </kbd>{" "}
            anytime to see this help
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function useKeyboardShortcutsDialog() {
  const [open, setOpen] = useState(false);

  return {
    open,
    setOpen,
    KeyboardShortcutsDialog: () => (
      <KeyboardShortcutsDialog open={open} onOpenChange={setOpen} />
    ),
  };
}

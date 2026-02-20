import { Link } from "react-router-dom";
import { CitySearch } from "./city-search";
import { ThemeToggle } from "./theme-toggle";
import { PreferencesMenu } from "./preferences-menu";
import { NotificationSettings } from "./notification-settings";
import { LanguageSwitcher } from "./language-switcher";
import { useTheme } from "@/context/theme-provider";
import { Button } from "./ui/button";
import { Keyboard } from "lucide-react";

export function Header() {
  const { theme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to={"/"} className="shrink-0">
          <img
            src={theme === "dark" ? "/logo.webp" : "/logo2.webp"}
            alt="Klimate logo"
            className="h-10 w-auto md:h-14"
            width="200"
            height="56"
            {...({
              fetchpriority: "high",
            } as React.ImgHTMLAttributes<HTMLImageElement>)}
          />
        </Link>

        <div className="flex items-center gap-2 md:gap-4">
          <CitySearch />
          <LanguageSwitcher />
          <NotificationSettings />
          <PreferencesMenu />
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              window.dispatchEvent(new CustomEvent("open-shortcuts-dialog"))
            }
            className="hidden md:flex"
            title="Keyboard Shortcuts (Shift + ?)"
          >
            <Keyboard className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
            <span className="sr-only">Keyboard Shortcuts</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

import { Link } from "react-router-dom";
import { CitySearch } from "./city-search";
import { ThemeToggle } from "./theme-toggle";
import { PreferencesMenu } from "./preferences-menu";
import { NotificationSettings } from "./notification-settings";
import { LanguageSwitcher } from "./language-switcher";
import { useTheme } from "@/context/theme-provider";
import { Button } from "./ui/button";
import { Keyboard } from "lucide-react";
import { motion } from "framer-motion";
import { staggerContainerFast } from "@/lib/animations";

import type { Variants } from "framer-motion";

const navItemVariant: Variants = {
  hidden: { opacity: 0, y: -10, scale: 0.9 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 400, damping: 28 } },
};

export function Header() {
  const { theme } = useTheme();

  return (
    <motion.header
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.1 }}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo — subtle scale-up on hover */}
        <motion.div
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
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
        </motion.div>

        {/* Nav items — stagger in from top-right */}
        <motion.div
          className="flex items-center gap-2 md:gap-4"
          variants={staggerContainerFast}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={navItemVariant}>
            <CitySearch />
          </motion.div>
          <motion.div variants={navItemVariant}>
            <LanguageSwitcher />
          </motion.div>
          <motion.div variants={navItemVariant}>
            <NotificationSettings />
          </motion.div>
          <motion.div variants={navItemVariant}>
            <PreferencesMenu />
          </motion.div>
          <motion.div variants={navItemVariant}>
            <ThemeToggle />
          </motion.div>
          <motion.div variants={navItemVariant} className="hidden md:flex">
            <motion.div
              whileHover={{ scale: 1.08, rotate: 8 }}
              whileTap={{ scale: 0.92 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  window.dispatchEvent(new CustomEvent("open-shortcuts-dialog"))
                }
                title="Keyboard Shortcuts (Shift + ?)"
              >
                <Keyboard className="h-[1.2rem] w-[1.2rem]" />
                <span className="sr-only">Keyboard Shortcuts</span>
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </motion.header>
  );
}

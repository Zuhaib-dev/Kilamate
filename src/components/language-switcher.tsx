import { Languages } from "lucide-react";
import { Button } from "./ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "./ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { usePreferences, type Language } from "@/hooks/use-preferences";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";

const languages: { code: Language; name: string; flag: string }[] = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "hi", name: "हिंदी", flag: "🇮🇳" },
    { code: "ur", name: "اردو", flag: "🇵🇰" },
];

export function LanguageSwitcher() {
    const { language, setLanguage } = usePreferences();
    const { i18n } = useTranslation();

    const handleLanguageChange = (lang: Language) => {
        setLanguage(lang);
        i18n.changeLanguage(lang);
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <DropdownMenu>
                    <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                aria-label="Change language"
                            >
                                <Languages className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Toggle language <kbd className="ml-2 px-1 py-0.5 text-[10px] uppercase font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">L</kbd></p>
                    </TooltipContent>
                    <DropdownMenuContent align="end">
                {languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className="flex items-center justify-between gap-2"
                    >
                        <span className="flex items-center gap-2">
                            <span>{lang.flag}</span>
                            <span>{lang.name}</span>
                        </span>
                        {language === lang.code && (
                            <Check className="h-4 w-4" />
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
            </Tooltip>
        </TooltipProvider>
    );
}

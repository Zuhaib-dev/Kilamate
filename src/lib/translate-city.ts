import citiesTranslations from '../locales/cities.json';
import type { Language } from '@/hooks/use-preferences';

/**
 * Translates city names to the specified language
 * Falls back to original name if translation not found
 */
export function translateCityName(cityName: string, language: Language): string {
    // If English or no translation needed
    if (language === 'en') {
        return cityName;
    }

    // Check if we have a translation for this city
    const translations = citiesTranslations as Record<string, Record<string, string>>;
    const cityTranslation = translations[cityName];

    if (cityTranslation && cityTranslation[language]) {
        return cityTranslation[language];
    }

    // Fallback to original name
    return cityName;
}

/**
 * Translates state/region names
 */
const stateTranslations: Record<string, Record<Language, string>> = {
    'Jammu and Kashmir': {
        en: 'Jammu and Kashmir',
        hi: 'जम्मू और कश्मीर',
        ur: 'جموں و کشمیر',
    },
    'Delhi': {
        en: 'Delhi',
        hi: 'दिल्ली',
        ur: 'دہلی',
    },
    'Maharashtra': {
        en: 'Maharashtra',
        hi: 'महाराष्ट्र',
        ur: 'مہاراشٹر',
    },
    'Karnataka': {
        en: 'Karnataka',
        hi: 'कर्नाटक',
        ur: 'کرناٹک',
    },
    'Tamil Nadu': {
        en: 'Tamil Nadu',
        hi: 'तमिलनाडु',
        ur: 'تمل ناڈو',
    },
    'West Bengal': {
        en: 'West Bengal',
        hi: 'पश्चिम बंगाल',
        ur: 'مغربی بنگال',
    },
    'Gujarat': {
        en: 'Gujarat',
        hi: 'गुजरात',
        ur: 'گجرات',
    },
    'Rajasthan': {
        en: 'Rajasthan',
        hi: 'राजस्थान',
        ur: 'راجستھان',
    },
    'Uttar Pradesh': {
        en: 'Uttar Pradesh',
        hi: 'उत्तर प्रदेश',
        ur: 'اتر پردیش',
    },
};

export function translateStateName(stateName: string | undefined, language: Language): string | undefined {
    if (!stateName || language === 'en') {
        return stateName;
    }

    const translation = stateTranslations[stateName];
    if (translation && translation[language]) {
        return translation[language];
    }

    return stateName;
}

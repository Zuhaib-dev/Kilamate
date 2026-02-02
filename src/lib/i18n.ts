import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from '../locales/en.json';
import hi from '../locales/hi.json';
import ur from '../locales/ur.json';

i18n
    // Detect user language
    .use(LanguageDetector)
    // Pass the i18n instance to react-i18next
    .use(initReactI18next)
    // Init i18next
    .init({
        resources: {
            en: { translation: en },
            hi: { translation: hi },
            ur: { translation: ur },
        },
        fallbackLng: 'en',
        debug: false,

        interpolation: {
            escapeValue: false, // React already escapes
        },

        detection: {
            // Order of detection
            order: ['localStorage', 'navigator'],
            // Keys to lookup language from
            lookupLocalStorage: 'kilamate-language',
            // Cache user language
            caches: ['localStorage'],
        },
    });

export default i18n;

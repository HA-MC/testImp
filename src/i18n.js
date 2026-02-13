import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import en from '../public/locales/en.json';
import fr from '../public/locales/fr.json';
import es from '../public/locales/es.json';
import ar from '../public/locales/ar.json';

const resources = {
    en: { translation: en },
    fr: { translation: fr },
    es: { translation: es },
    ar: { translation: ar }
};

i18n
    .use(LanguageDetector) // Detect user language
    .use(initReactI18next) // Pass i18n instance to react-i18next
    .init({
        resources,
        fallbackLng: 'en', // Fallback language
        supportedLngs: ['en', 'fr', 'es', 'ar'],
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage']
        },
        interpolation: {
            escapeValue: false // React already escapes values
        }
    });

// Set HTML direction based on language
i18n.on('languageChanged', (lng) => {
    const isRTL = lng === 'ar';
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = lng;
});

// Set initial direction
const currentLanguage = i18n.language;
const isRTL = currentLanguage === 'ar';
document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
document.documentElement.lang = currentLanguage;

export default i18n;

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ar from './ar.json';
import en from './en.json';

/**
 * i18n
 * ====
 * This tool allows the website to switch between Arabic and English.
 * It's like a big dictionary for all the buttons and titles on the page.
 */

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: en,
      ar: ar
    },
    lng: "ar", // Always start in Arabic
    fallbackLng: "en", // If we forget an Arabic word, use English instead
    interpolation: {
      escapeValue: false // React already protects us from bad text
    }
  });

export default i18n;

import en from "@/constants/locales/en-US";
import zh from "@/constants/locales/zh-Hans";
import { getLocales } from "expo-localization";
import { I18n } from "i18n-js";

const i18n = new I18n({
  en,
  zh,
});

const validLanguageCodes = ['en', 'zh','tr']; // valid codes

i18n.locale = getLocales()[0].languageCode ?? "en";

i18n.enableFallback = true;
i18n.locale = "en";

export const getLocalizeStrings = () => i18n.translations[i18n.locale];

export const isValidLanguage = (languageCode: string) => {
  return validLanguageCodes.includes(languageCode);
};

export const setLocalizeLocale = async (code: string) => {
  try {
    //await setItem("language", code);
    i18n.locale = code;
    return i18n.translations[code];
  } catch (error) {
    i18n.locale = "en"
    i18n.defaultLocale = "en"
    console.error("Error setting language:", error);
    return null;
  }
};

export const initLanguage = async () => {
  try {
    //const languageCode = await getItem("language");
    const defaultLanguage = getLocales()[0].languageCode ?? "en";
    i18n.locale = isValidLanguage(defaultLanguage) ? defaultLanguage : 'en';
    i18n.defaultLocale = i18n.locale; 
  } catch (error) {
    i18n.locale = "en"
    i18n.defaultLocale = "en"
    console.error("Error initializing language:", error);
  }
};

// export const initializeLanguage = async() => {
//   try {
//      const deviceLanguage = getLocales()[0].languageCode;
//      i18n.locale = deviceLanguage ?? "en";
//      i18n.defaultLocale = i18n.locale;
//   }catch (error) {
//     i18n.locale = 'en';
//     i18n.defaultLocale = 'en';
//     console.error('Error initializing language:', error);
//   }
// }

// export const setLanguage = (code: string) => {
//  try {
//   i18n.locale = code;
//   return i18n.translations[code];
//  }catch(error) {
//   console.error('Error setting language:', error);
//  }
//  return null;
// };

export default i18n;
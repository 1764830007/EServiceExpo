import { createContext, useContext, useEffect, useState } from "react";
import i18n, { initLanguage, isValidLanguage, setLocalizeLocale } from "./i18n";

export type LanguageContextProps  = {
  locale: string;
  setLanguage: (language: string) => Promise<void>;
  t: (key: string) => string;
  //localeStrings: Record<string, string>;
}

export const LanguageContext = createContext<LanguageContextProps|null>(null);

type LanguageProviderProps = {
  children: React.ReactNode;
}

export default function LanguageProvider({ children }: LanguageProviderProps) {
  const [locale, setLocale] = useState(i18n.locale);
  //const [localeStrings, setLocaleStrings] = useState(getLocalizeStrings());

  useEffect(() => {
    const initialze = async () => {
        await initLanguage();
        setLocale(i18n.locale);
        //setLocaleStrings(getLocalizeStrings());
    };
    initialze();
  },[]);

 // Function to change the language and update localized strings
  const setLanguage = async (language: string) => {
    const validLanguage = isValidLanguage(language) ? language : 'en';
  
    const newStrings = await setLocalizeLocale(validLanguage);
    if (newStrings) {
      setLocale(validLanguage);
      //setLocaleStrings(newStrings);
    }
  };

  const t = (key: string) => i18n.t(key);

  return (
    <LanguageContext.Provider value={{ locale, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLocalization = () => {
  const languageContext = useContext(LanguageContext);
  if(!languageContext) {
    throw new Error("language no found");
  }
  return languageContext;
}

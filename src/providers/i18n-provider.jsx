import { createContext, useContext, useState, useEffect } from "react";
import viCommon from "~/locales/vi/common.json";
import enCommon from "~/locales/en/common.json";
import { STORAGE_KEYS } from "~/shared/config/site";
import { storage } from "~/shared/lib/storage";

const dictionaries = {
  vi: { common: viCommon },
  en: { common: enCommon }
};

const I18nContext = createContext({
  language: "vi",
  setLanguage: () => {},
  t: (key) => key
});

export function I18nProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    return storage.get(STORAGE_KEYS.language, "vi");
  });

  useEffect(() => {
    storage.set(STORAGE_KEYS.language, language);
  }, [language]);

  const setLanguage = (lang) => {
    if (dictionaries[lang]) {
      setLanguageState(lang);
    }
  };

  const t = (keyPath, arg1, arg2) => {
    let ns = "common";
    let params = null;
    let fallbackText = null;

    // Check arg1
    if (typeof arg1 === "string") {
      if (dictionaries[language]?.[arg1] || dictionaries.vi?.[arg1]) {
        ns = arg1;
      } else {
        fallbackText = arg1;
      }
    } else if (arg1 && typeof arg1 === "object") {
      params = arg1;
    }

    // Check arg2
    if (typeof arg2 === "string") {
      if (dictionaries[language]?.[arg2] || dictionaries.vi?.[arg2]) {
        ns = arg2;
      } else {
        fallbackText = arg2;
      }
    } else if (arg2 && typeof arg2 === "object") {
      params = arg2;
    }

    const dict = dictionaries[language]?.[ns] || dictionaries.vi[ns] || {};
    const parts = keyPath.split(".");
    let curr = dict;
    let found = true;
    for (const p of parts) {
      if (curr && typeof curr === "object" && p in curr) {
        curr = curr[p];
      } else {
        found = false;
        break;
      }
    }

    let text = (found && typeof curr === "string") ? curr : (fallbackText || keyPath);
    if (params && typeof text === "string") {
      for (const [k, v] of Object.entries(params)) {
        text = text.replaceAll(`{{${k}}}`, String(v));
      }
    }
    return text;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useTranslation must be used within I18nProvider");
  }
  return context;
}

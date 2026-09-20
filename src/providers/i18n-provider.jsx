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

  const t = (keyPath, paramsOrNs = "common", maybeNs = "common") => {
    let ns = "common";
    let params = null;
    let fallbackText = null;

    if (typeof paramsOrNs === "string") {
      if (dictionaries[language]?.[paramsOrNs] || dictionaries.vi?.[paramsOrNs]) {
        ns = paramsOrNs;
      } else {
        fallbackText = paramsOrNs;
      }
    } else if (paramsOrNs && typeof paramsOrNs === "object") {
      params = paramsOrNs;
      if (typeof maybeNs === "string") {
        ns = maybeNs;
      }
    }

    const dict = dictionaries[language]?.[ns] || dictionaries.vi[ns] || {};
    const parts = keyPath.split(".");
    let curr = dict;
    for (const p of parts) {
      if (curr && typeof curr === "object" && p in curr) {
        curr = curr[p];
      } else {
        return fallbackText || keyPath;
      }
    }

    let text = typeof curr === "string" ? curr : (fallbackText || keyPath);
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

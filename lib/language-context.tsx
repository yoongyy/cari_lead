"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "zh";

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const langParam = params.get("lang")?.toLowerCase();

    if (langParam === "ch" || langParam === "zh") {
      setLanguageState("zh");
      localStorage.setItem("language", "zh");
    } else if (langParam === "en") {
      setLanguageState("en");
      localStorage.setItem("language", "en");
    } else {
      const saved = localStorage.getItem("language") as Language;
      if (saved === "en" || saved === "zh") {
        setLanguageState(saved);
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

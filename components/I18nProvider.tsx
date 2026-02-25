"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import en from "../locales/en.json";
import es from "../locales/es.json";

type Language = "en" | "es";
type Translations = typeof en;

interface I18nContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const translations: Record<Language, Translations> = { en, es };

export const I18nProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguage] = useState<Language>("en");

    // Load language from localStorage on mount
    React.useEffect(() => {
        const storedLang = localStorage.getItem("portfolioLanguaje");
        if (storedLang && (storedLang === "en" || storedLang === "es")) {
            setLanguage(storedLang as Language);
        }
    }, []);

    // Save language to localStorage when it changes
    const changeLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem("portfolioLanguaje", lang);
    };

    const t = (path: string): string => {
        const keys = path.split(".");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let current: any = translations[language];
        for (const key of keys) {
            if (current[key] === undefined) {
                console.warn(`Translation key not found: ${path}`);
                return path;
            }
            current = current[key];
        }
        return current;
    };

    return (
        <I18nContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
            {children}
        </I18nContext.Provider>
    );
};

export const useTranslation = () => {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error("useTranslation must be used within an I18nProvider");
    }
    return context;
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translateText } from '@/services/translationService';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' }
];

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  translate: (text: string) => Promise<string>;
  translateSync: (text: string) => string;
  translationCache: Map<string, string>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(languages[0]);
  const [translationCache, setTranslationCache] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('agritech_current_user') || 'null');
    if (user && user.language) {
      const language = languages.find(lang => lang.code === user.language);
      if (language) {
        setCurrentLanguage(language);
      }
    }
  }, []);

  const setLanguage = (language: Language) => {
    setCurrentLanguage(language);
    localStorage.setItem('preferred-language', language.code);
    // Clear cache when language changes
    setTranslationCache(new Map());
  };

  const translate = async (text: string): Promise<string> => {
    // Return original text if it's English
    if (currentLanguage.code === 'en') {
      return text;
    }

    // Check cache first
    const cacheKey = `${text}-${currentLanguage.code}`;
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey)!;
    }

    try {
      const translatedText = await translateText(text, currentLanguage.code);
      
      // Cache the translation
      setTranslationCache(prev => new Map(prev).set(cacheKey, translatedText));
      
      return translatedText;
    } catch (error) {
      console.warn('Translation failed:', error);
      return text; // Return original text if translation fails
    }
  };

  const translateSync = (text: string): string => {
    // Return original text if it's English
    if (currentLanguage.code === 'en') {
      return text;
    }

    // Check cache for instant translation
    const cacheKey = `${text}-${currentLanguage.code}`;
    return translationCache.get(cacheKey) || text;
  };

  return (
    <LanguageContext.Provider value={{ 
      currentLanguage, 
      setLanguage, 
      translate, 
      translateSync, 
      translationCache 
    }}>
      {children}
    </LanguageContext.Provider>
  );
};
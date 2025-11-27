import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define translations directly in this file
const translations = {
  en: {
    nav_home: 'Home',
    nav_map: 'Map',
    nav_alerts: 'Alerts',
    nav_profile: 'Profile',
    profile_title: 'Profile & Settings',
    profile_appearance: 'Appearance',
    profile_language: 'Language',
    profile_logout: 'Logout',
    login_select_role: 'Select Your Role',
    login_passenger: "I'm a Passenger",
    login_driver: "I'm a Driver",
    login_admin: "I'm an Admin",
    passenger_select_route: 'Select Your Route',
    driver_trip_controls: 'Trip Controls',
    driver_start_trip: 'Start Trip',
    driver_end_trip: 'End Trip',
  },
  hi: {
    nav_home: 'होम',
    nav_map: 'नक्शा',
    nav_alerts: 'अलर्ट',
    nav_profile: 'प्रोफ़ाइल',
    profile_title: 'प्रोफ़ाइल और सेटिंग्स',
    profile_appearance: 'दिखावट',
    profile_language: 'भाषा',
    profile_logout: 'लॉग आउट',
    login_select_role: 'अपनी भूमिका चुनें',
    login_passenger: 'मैं एक यात्री हूँ',
    login_driver: 'मैं एक ड्राइवर हूँ',
    login_admin: 'मैं एक व्यवस्थापक हूँ',
    passenger_select_route: 'अपना मार्ग चुनें',
    driver_trip_controls: 'यात्रा नियंत्रण',
    driver_start_trip: 'यात्रा शुरू करें',
    driver_end_trip: 'यात्रा समाप्त करें',
  },
  mr: {
    nav_home: 'होम',
    nav_map: 'नकाशा',
    nav_alerts: 'अलर्ट',
    nav_profile: 'प्रोफाइल',
    profile_title: 'प्रोफाइल आणि सेटिंग्ज',
    profile_appearance: 'दिसणे',
    profile_language: 'भाषा',
    profile_logout: 'लॉग आउट',
    login_select_role: 'तुमची भूमिका निवडा',
    login_passenger: 'मी प्रवासी आहे',
    login_driver: 'मी ड्रायव्हर आहे',
    login_admin: 'मी ॲडमिन आहे',
    passenger_select_route: 'तुमचा मार्ग निवडा',
    driver_trip_controls: 'ट्रिप नियंत्रणे',
    driver_start_trip: 'ट्रिप सुरू करा',
    driver_end_trip: 'ट्रिप समाप्त करा',
  },
};

type LanguageCode = keyof typeof translations;

export const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi (हिन्दी)' },
  { code: 'mr', name: 'Marathi (मराठी)' },
];

interface LocalizationContextType {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  t: (key: string) => string;
  availableLanguages: typeof languages;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export const LocalizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('bus-tracker-language') as LanguageCode;
      return savedLang && translations[savedLang] ? savedLang : 'en';
    }
    return 'en';
  });

  const setLanguage = (lang: LanguageCode) => {
    if (translations[lang]) {
      localStorage.setItem('bus-tracker-language', lang);
      setLanguageState(lang);
    }
  };

  const t = (key: string): string => {
    const langTranslations = translations[language] || translations.en;
    const defaultTranslations = translations.en;
    return langTranslations[key] || defaultTranslations[key] || key;
  };

  return (
    <LocalizationContext.Provider value={{ language, setLanguage, t, availableLanguages: languages }}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = (): LocalizationContextType => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};

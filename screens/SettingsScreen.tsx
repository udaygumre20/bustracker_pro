import React from 'react';
import { SunIcon, MoonIcon, QuestionMarkCircleIcon } from '../components/icons';
import { useTheme } from '../context/ThemeContext';
import { useLocalization } from '../context/LocalizationContext';

interface SettingsScreenProps {
  navigateTo: (screen: string) => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigateTo }) => {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t, availableLanguages } = useLocalization();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as any);
  };

  const handleRaiseIssueClick = () => {
    navigateTo('raiseIssue');
  };

  const SettingRow: React.FC<{ label: string, children: React.ReactNode }> = ({ label, children }) => (
    <div className="bg-white dark:bg-neutral-800 p-4 rounded-xl shadow-lg flex justify-between items-center">
      <span className="font-medium text-neutral-700 dark:text-neutral-200">{label}</span>
      {children}
    </div>
  );

  return (
    <div className="p-4 h-full flex flex-col gap-6">
      <div>
        <h3 className="text-lg font-semibold text-neutral-500 dark:text-neutral-400 px-2 mb-2">General</h3>
        <div className="space-y-4">
          <SettingRow label={t('profile_appearance')}>
            <button onClick={toggleTheme} className="bg-neutral-200 dark:bg-neutral-700 p-2 rounded-full">
              {theme === 'light' ? <MoonIcon className="w-5 h-5 text-neutral-800" /> : <SunIcon className="w-5 h-5 text-neutral-100" />}
            </button>
          </SettingRow>

          <SettingRow label={t('profile_language')}>
            <select
              id="language-select-settings"
              value={language}
              onChange={handleLanguageChange}
              className="p-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-primary focus:border-primary text-sm"
            >
              {availableLanguages.map((lang) => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </SettingRow>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-neutral-500 dark:text-neutral-400 px-2 mb-2">Support</h3>
        <button
          onClick={handleRaiseIssueClick}
          className="w-full bg-white dark:bg-neutral-800 p-4 rounded-xl shadow-lg flex justify-between items-center text-left hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <QuestionMarkCircleIcon className="w-6 h-6 text-primary dark:text-accent" />
            <span className="font-medium text-neutral-700 dark:text-neutral-200">Raise an Issue</span>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default SettingsScreen;

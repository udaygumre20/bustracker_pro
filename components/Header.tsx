import React from 'react';
import { MenuIcon, ArrowLeftIcon, SunIcon, MoonIcon } from './icons';
import { useTheme } from '../context/ThemeContext';
import { useLocalization, languages } from '../context/LocalizationContext';

interface HeaderProps {
  onMenuClick: () => void;
  onBackClick: () => void;
  title: string;
  showBackButton: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, onBackClick, title, showBackButton }) => {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLocalization();

  return (
    <header className="bg-white dark:bg-neutral-800 shadow-sm border-b border-neutral-200 dark:border-neutral-700 p-4 flex items-center justify-between z-10 flex-shrink-0 h-16 transition-all duration-300">
      <div className="flex items-center gap-2">
        {showBackButton && (
          <button
            onClick={onBackClick}
            className="p-2 -ml-2 text-neutral-600 dark:text-neutral-300 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-all active:scale-95"
            aria-label="Go back"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
        )}
        <h1 className="text-xl font-bold text-primary dark:text-white tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Language Selector */}
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as any)}
          className="bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-sm font-semibold rounded-lg px-3 py-2 border-none focus:ring-2 focus:ring-primary outline-none cursor-pointer transition-all hover:bg-neutral-200 dark:hover:bg-neutral-600"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.code.toUpperCase()}
            </option>
          ))}
        </select>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-neutral-600 dark:text-neutral-300 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-all active:scale-95"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
        </button>

        {/* Menu Button */}
        <button
          onClick={onMenuClick}
          className="p-2 -mr-2 text-neutral-600 dark:text-neutral-300 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-all active:scale-95"
          aria-label="Open menu"
        >
          <MenuIcon className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
};

export default Header;
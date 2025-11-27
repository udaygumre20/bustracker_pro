import React from 'react';
import { HomeIcon, MapIcon, BellIcon, UserIcon } from './icons';
import { useLocalization } from '../context/LocalizationContext';

interface BottomNavProps {
  activeScreen: string;
  setActiveScreen: (screen: string) => void;
}

const NavItem: React.FC<{
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon: Icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${
      isActive ? 'text-primary dark:text-accent' : 'text-neutral-500 dark:text-neutral-400 hover:text-primary dark:hover:text-white'
    }`}
  >
    <Icon className="w-6 h-6 mb-1" />
    <span className={`text-xs font-medium ${isActive ? 'font-bold' : ''}`}>{label}</span>
  </button>
);

const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, setActiveScreen }) => {
  const { t } = useLocalization();

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 shadow-t-lg z-10">
      <div className="flex justify-around items-center h-full max-w-lg mx-auto">
        <NavItem icon={HomeIcon} label={t('nav_home')} isActive={activeScreen === 'home'} onClick={() => setActiveScreen('home')} />
        <NavItem icon={MapIcon} label={t('nav_map')} isActive={activeScreen === 'map'} onClick={() => setActiveScreen('map')} />
        <NavItem icon={BellIcon} label={t('nav_alerts')} isActive={activeScreen === 'notifications'} onClick={() => setActiveScreen('notifications')} />
        <NavItem icon={UserIcon} label={t('nav_profile')} isActive={activeScreen === 'profile'} onClick={() => setActiveScreen('profile')} />
      </div>
    </div>
  );
};

export default BottomNav;

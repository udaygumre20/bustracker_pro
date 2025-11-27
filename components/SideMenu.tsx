import React from 'react';
import { HomeIcon, BellIcon, UserIcon, CloseIcon, BusIcon, SettingsIcon, LogoutIcon } from './icons';
import { useLocalization } from '../context/LocalizationContext';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeScreen: string;
  navigateTo: (screen: string) => void;
}

const NavItem: React.FC<{
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon: Icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full p-3 rounded-lg text-left transition-colors duration-200 ${isActive ? 'bg-primary/10 text-primary dark:bg-accent/20 dark:text-accent font-semibold' : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
      }`}
  >
    <Icon className="w-6 h-6 mr-4" />
    <span className="text-md">{label}</span>
  </button>
);

const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose, activeScreen, navigateTo }) => {
  const { t } = useLocalization();
  const { user, logout } = useAuth();

  const handleNavClick = (screen: string) => {
    navigateTo(screen);
    onClose();
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-[1000] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />
      <aside
        className={`fixed top-0 right-0 h-full w-72 bg-white dark:bg-neutral-800 shadow-xl z-[1001] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="menu-title"
      >
        <div className="p-4 flex justify-between items-center border-b border-neutral-200 dark:border-neutral-700">
          <h2 id="menu-title" className="font-bold text-lg text-neutral-800 dark:text-neutral-100">BusTracker Pro</h2>
          <button
            onClick={onClose}
            className="p-2 text-neutral-500 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700"
            aria-label="Close menu"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-col h-[calc(100%-65px)]">
          <div className="flex-grow overflow-y-auto">
            <nav className="p-4 space-y-2">
              <NavItem icon={HomeIcon} label={t('nav_home')} isActive={activeScreen === 'home' || activeScreen === 'map'} onClick={() => handleNavClick('home')} />
              {/* Conditionally render Alerts for non-admin/driver roles */}
              {(!user || (user.role !== UserRole.DRIVER && user.role !== UserRole.ADMIN)) && (
                <NavItem icon={BellIcon} label={t('nav_alerts')} isActive={activeScreen === 'notifications'} onClick={() => handleNavClick('notifications')} />
              )}
              <NavItem icon={UserIcon} label={t('nav_profile')} isActive={activeScreen === 'profile'} onClick={() => handleNavClick('profile')} />
            </nav>

            {user?.role === UserRole.ADMIN && (
              <>
                <div className="px-4 my-2">
                  <hr className="border-neutral-200 dark:border-neutral-700" />
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider px-3">Admin Tools</h3>
                  <NavItem icon={UserIcon} label="Driver Management" isActive={activeScreen === 'driverManagement'} onClick={() => handleNavClick('driverManagement')} />
                  <NavItem icon={BusIcon} label="Bus & Route Management" isActive={activeScreen === 'busManagement'} onClick={() => handleNavClick('busManagement')} />
                </div>
              </>
            )}
            <div className="px-4 my-2">
              <hr className="border-neutral-200 dark:border-neutral-700" />
            </div>
            <nav className="p-4 pt-0 space-y-2">
              <NavItem icon={SettingsIcon} label="Settings" isActive={activeScreen === 'settings'} onClick={() => handleNavClick('settings')} />
            </nav>
          </div>
          {user && (
            <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
              <button
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="flex items-center w-full p-3 rounded-lg text-left transition-colors duration-200 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <LogoutIcon className="w-6 h-6 mr-4" />
                <span className="text-md">Logout</span>
              </button>
            </div>
          )}
        </div>
      </aside >
    </>
  );
};

export default SideMenu;

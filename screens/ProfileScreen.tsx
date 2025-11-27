import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogoutIcon, UserIcon } from '../components/icons';
import { useLocalization } from '../context/LocalizationContext';
import { UserRole } from '../types';

interface ProfileScreenProps {
  onLoginClick: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ onLoginClick }) => {
  const { user, logout } = useAuth();
  const { t } = useLocalization();

  if (!user) {
    return (
      <div className="p-4 h-full flex flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-bold mb-2 text-neutral-800 dark:text-neutral-100">Welcome to BusTracker Pro</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mb-8 max-w-sm">
          Log in to access driver controls or the administration dashboard.
        </p>
        <button
          onClick={onLoginClick}
          className="w-full max-w-xs bg-primary hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-lg transition-colors"
        >
          Admin / Driver Login
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 min-h-full flex flex-col pb-24">
      <h1 className="text-2xl font-bold mb-6 text-neutral-800 dark:text-neutral-100">{t('profile_title')}</h1>

      {/* Profile Info */}
      <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-lg mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-primary p-3 rounded-full">
            <UserIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <p className="text-xl font-bold text-neutral-800 dark:text-neutral-100">{user.name}</p>
            <p className="text-sm bg-accent text-white px-2 py-0.5 rounded-full inline-block font-medium capitalize">{user.role.toLowerCase()}</p>
          </div>
        </div>
        <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Email Address</p>
          <p className="font-medium text-neutral-800 dark:text-neutral-200">{user.email}</p>
        </div>
      </div>

      <div className="space-y-4">
        {user.role === UserRole.ADMIN && (
          <div className="bg-white dark:bg-neutral-800 p-4 rounded-xl shadow-lg">
            <span className="font-medium text-neutral-700 dark:text-neutral-200">System Alert Preferences</span>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Configure how you receive SOS alerts and critical notifications.</p>
          </div>
        )}
        {user.role === UserRole.DRIVER && (
          <div className="bg-white dark:bg-neutral-800 p-4 rounded-xl shadow-lg">
            <span className="font-medium text-neutral-700 dark:text-neutral-200">Trip Notification Preferences</span>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Manage alerts for route changes and important updates.</p>
          </div>
        )}
      </div>

      <div className="flex-grow"></div>

      {/* Logout Button */}
      <button
        onClick={logout}
        className="w-full bg-emergency hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <LogoutIcon className="w-5 h-5" />
        <span>{t('profile_logout')}</span>
      </button>
    </div>
  );
};

export default ProfileScreen;

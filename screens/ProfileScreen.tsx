import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogoutIcon, UserIcon, BusIcon, PhoneIcon } from '../components/icons';
import { useLocalization } from '../context/LocalizationContext';
import { UserRole } from '../types';
import { api } from '../services/api';

interface ProfileScreenProps {
  onLoginClick: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ onLoginClick }) => {
  const { user, logout } = useAuth();
  const { t } = useLocalization();
  const [driverData, setDriverData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user && user.role === UserRole.DRIVER) {
        setLoading(true);
        try {
          const data = await api.getDriverByUserId(user.id);
          setDriverData(data);
        } catch (error) {
          console.error("Failed to fetch driver profile", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchProfile();
  }, [user]);

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
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-primary p-4 rounded-full">
            <UserIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <p className="text-xl font-bold text-neutral-800 dark:text-neutral-100">{user.name}</p>
            <p className="text-sm bg-accent text-white px-3 py-1 rounded-full inline-block font-medium capitalize mt-1">
              {user.role.toLowerCase()}
            </p>
          </div>
        </div>

        <div className="space-y-4 border-t border-neutral-200 dark:border-neutral-700 pt-4">
          <div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase font-bold mb-1">Email Address</p>
            <p className="font-medium text-neutral-800 dark:text-neutral-200">{user.email}</p>
          </div>

          {/* Driver Specific Info */}
          {user.role === UserRole.DRIVER && (
            <>
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase font-bold mb-1">Phone Number</p>
                <div className="flex items-center gap-2">
                  <PhoneIcon className="w-4 h-4 text-neutral-400" />
                  <p className="font-medium text-neutral-800 dark:text-neutral-200">
                    {loading ? 'Loading...' : (driverData?.phone || 'Not provided')}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase font-bold mb-1">Assigned Bus</p>
                <div className="flex items-center gap-2">
                  <BusIcon className="w-4 h-4 text-neutral-400" />
                  <p className="font-medium text-neutral-800 dark:text-neutral-200">
                    {loading ? 'Loading...' : (driverData?.assigned_bus_id || 'None Assigned')}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {user.role === UserRole.ADMIN && (
          <div className="bg-white dark:bg-neutral-800 p-4 rounded-xl shadow-lg">
            <span className="font-medium text-neutral-700 dark:text-neutral-200">System Alert Preferences</span>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Configure how you receive SOS alerts and critical notifications.</p>
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

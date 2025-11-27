
import React from 'react';
import { AppNotification } from '../types';
import { BellIcon, AlertIcon } from '../components/icons';

const mockNotifications: AppNotification[] = [
  { id: '1', title: 'Bus BUS-03 is arriving soon!', message: 'Your bus is expected at your stop in 5 minutes.', timestamp: new Date(), type: 'arrival', read: false },
  { id: '2', title: 'Route A-B Delay', message: 'Bus BUS-02 is experiencing a 10-minute delay due to traffic.', timestamp: new Date(Date.now() - 600000), type: 'delay', read: false },
  { id: '3', title: 'Emergency Alert Resolved', message: 'The SOS alert for BUS-01 has been marked as resolved.', timestamp: new Date(Date.now() - 1200000), type: 'emergency', read: true },
  { id: '4', title: 'Welcome to BusTracker Pro!', message: 'Set up your profile and route alerts to get started.', timestamp: new Date(Date.now() - 86400000), type: 'info', read: true },
];

const NotificationIcon: React.FC<{ type: AppNotification['type'] }> = ({ type }) => {
    const baseClass = "w-6 h-6";
    switch(type) {
        case 'arrival': return <BellIcon className={`${baseClass} text-secondary`} />;
        case 'delay': return <AlertIcon className={`${baseClass} text-accent`} />;
        case 'emergency': return <AlertIcon className={`${baseClass} text-emergency`} />;
        case 'info': return <BellIcon className={`${baseClass} text-primary`} />;
        default: return <BellIcon className={`${baseClass} text-neutral-500`} />;
    }
}

const NotificationsScreen: React.FC = () => {
  return (
    <div className="p-4 h-full flex flex-col">
      <h1 className="text-2xl font-bold mb-4 text-neutral-800 dark:text-neutral-100">Notifications</h1>
      <div className="flex-grow overflow-y-auto space-y-3">
        {mockNotifications.map(notification => (
          <div key={notification.id} className={`p-4 rounded-lg flex items-start gap-4 transition-opacity ${notification.read ? 'opacity-60' : 'opacity-100'} bg-white dark:bg-neutral-800 shadow-md`}>
            <div className="flex-shrink-0 pt-1">
                <NotificationIcon type={notification.type} />
            </div>
            <div>
              <p className="font-bold text-neutral-800 dark:text-neutral-100">{notification.title}</p>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">{notification.message}</p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">{notification.timestamp.toLocaleTimeString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsScreen;

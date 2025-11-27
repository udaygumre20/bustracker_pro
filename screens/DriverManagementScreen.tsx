import React, { useState, useEffect } from 'react';
import { UserIcon, CloseIcon } from '../components/icons';

// Modal Component
const DriverFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (driverData: any) => void;
    driver: any | null;
    buses: any[];
}> = ({ isOpen, onClose, onSave, driver, buses }) => {
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', assigned_bus_id: '', status: 'Active',
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (driver) {
                setFormData({ ...driver, password: '' });
            } else {
                setFormData({
                    name: '', email: '', password: '', assigned_bus_id: buses.length > 0 ? buses[0].id : '', status: 'Active',
                });
            }
            setError('');
        }
    }, [driver, isOpen, buses]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!formData.name || !formData.email || (!driver && !formData.password)) {
            setError('Please fill out all required fields (Name, Email, Password).');
            return;
        }
        onSave({ ...formData });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[1002] p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-slide-up" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200">
                    <CloseIcon className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 mb-6">{driver ? 'Edit Driver' : 'Add New Driver'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-1">Full Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border-2 border-neutral-300 dark:border-neutral-600 rounded-lg bg-neutral-100 dark:bg-neutral-700 focus:ring-primary focus:border-primary" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-1">Email Address</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-2 border-2 border-neutral-300 dark:border-neutral-600 rounded-lg bg-neutral-100 dark:bg-neutral-700 focus:ring-primary focus:border-primary" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-1">Password</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder={driver ? 'Leave blank to keep unchanged' : ''} className="w-full p-2 border-2 border-neutral-300 dark:border-neutral-600 rounded-lg bg-neutral-100 dark:bg-neutral-700 focus:ring-primary focus:border-primary" required={!driver} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-1">Assign Bus</label>
                        <select name="assigned_bus_id" value={formData.assigned_bus_id} onChange={handleChange} className="w-full p-2 border-2 border-neutral-300 dark:border-neutral-600 rounded-lg bg-neutral-100 dark:bg-neutral-700">
                           <option value="">Unassigned</option>
                           {buses.map(bus => <option key={bus.id} value={bus.id}>{bus.id}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-1">Status</label>
                         <select name="status" value={formData.status} onChange={handleChange} className="w-full p-2 border-2 border-neutral-300 dark:border-neutral-600 rounded-lg bg-neutral-100 dark:bg-neutral-700 focus:ring-primary focus:border-primary">
                           <option value="Active">Active</option>
                           <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                    {error && <p className="text-sm text-emergency text-left">{error}</p>}
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="bg-neutral-200 dark:bg-neutral-600 text-neutral-700 dark:text-neutral-200 font-bold py-2 px-6 rounded-lg">Cancel</button>
                        <button type="submit" className="bg-primary text-white font-bold py-2 px-6 rounded-lg">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface DriverManagementScreenProps {
    drivers: any[];
    buses: any[];
    onSave: (driverData: any, isEditing: boolean) => void;
    onDelete: (driverId: string) => void;
}

// Main Screen Component
const DriverManagementScreen: React.FC<DriverManagementScreenProps> = ({ drivers, buses, onSave, onDelete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDriver, setEditingDriver] = useState<any | null>(null);

    const handleAddDriver = () => {
        setEditingDriver(null);
        setIsModalOpen(true);
    };

    const handleEditDriver = (driver: any) => {
        setEditingDriver(driver);
        setIsModalOpen(true);
    };

    const handleSaveDriver = (driverData: any) => {
        onSave({ ...editingDriver, ...driverData }, !!editingDriver);
        setIsModalOpen(false);
    };
    
    const handleDeleteDriver = (driverId: string) => {
        if (window.confirm("Are you sure you want to delete this driver? This action cannot be undone.")) {
            onDelete(driverId);
        }
    };

    return (
        <div className="p-4 h-full flex flex-col gap-4">
            <div className="flex justify-end items-center">
                <button onClick={handleAddDriver} className="bg-primary hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
                    Add New Driver
                </button>
            </div>

            <div className="flex-grow overflow-y-auto space-y-3">
                {drivers.map(driver => (
                    <div key={driver.id} className="bg-white dark:bg-neutral-800 p-4 rounded-lg shadow-md flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-full ${driver.status === 'Active' ? 'bg-green-100 dark:bg-green-900/50' : 'bg-neutral-200 dark:bg-neutral-700'}`}>
                                <UserIcon className={`w-6 h-6 ${driver.status === 'Active' ? 'text-green-600 dark:text-green-300' : 'text-neutral-500'}`} />
                            </div>
                            <div>
                                <p className="font-bold text-neutral-800 dark:text-neutral-100">{driver.name}</p>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">{driver.email}</p>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Bus: {driver.assigned_bus_id || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${driver.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-800/50 dark:text-green-200' : 'bg-neutral-200 text-neutral-800 dark:bg-neutral-600 dark:text-neutral-100'}`}>
                                {driver.status}
                            </span>
                            <button onClick={() => handleEditDriver(driver)} className="p-1.5 text-sm text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-md">Edit</button>
                            <button onClick={() => handleDeleteDriver(driver.id)} className="p-1.5 text-sm text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-md">Delete</button>
                        </div>
                    </div>
                ))}
            </div>
            
            <DriverFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveDriver} driver={editingDriver} buses={buses} />

            <style>{`
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slide-up { from { transform: translateY(20px); opacity: 0.5; } to { transform: translateY(0); opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
                .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default DriverManagementScreen;
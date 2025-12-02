import React from 'react';

const AboutScreen: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-white dark:bg-neutral-900 overflow-y-auto">
            <div className="max-w-md w-full space-y-8 animate-fade-in">

                {/* App Title & Description */}
                <div className="space-y-4">
                    <h1 className="text-3xl font-bold text-primary dark:text-primary-400">
                        BusTracker Pro
                    </h1>
                    <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
                        A real-time intercity bus tracking application designed for passengers and drivers.
                        The app provides live bus location, route visibility, estimated arrival times,
                        and occupancy status for a seamless travel experience.
                    </p>
                </div>

                {/* Divider */}
                <div className="w-16 h-1 bg-neutral-100 dark:bg-neutral-800 rounded-full mx-auto" />

                {/* Developer Info */}
                <div className="space-y-2">
                    <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">
                        Developed By
                    </h2>
                    <div className="text-neutral-900 dark:text-white font-medium">
                        <p className="text-lg">Tech Engineer</p>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            MSS College of Engineering & Technology, Jalna
                        </p>
                    </div>
                </div>

                {/* App Version */}
                <div className="space-y-1">
                    <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">
                        App Version
                    </h2>
                    <p className="text-neutral-900 dark:text-white font-mono">
                        1.0.0
                    </p>
                </div>

                {/* Footer */}
                <div className="pt-8">
                    <p className="text-xs text-neutral-400 italic">
                        Crafted with care for efficient and reliable Bus tracking.
                    </p>
                </div>

            </div>
        </div>
    );
};

export default AboutScreen;

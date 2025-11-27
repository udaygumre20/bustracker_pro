import React from 'react';
import { BusIcon } from './icons';

export interface TripStep {
    type: 'walk' | 'auto' | 'bus';
    description: string;
    time: string;
    distance?: string;
    isStart?: boolean;
    isEnd?: boolean;
}

interface TripTimelineProps {
    steps: TripStep[];
}

const TripTimeline: React.FC<TripTimelineProps> = ({ steps }) => {
    return (
        <div className="relative pl-4 py-2">
            {steps.map((step, index) => (
                <div key={index} className="relative flex gap-4 pb-6 last:pb-0">
                    {/* Vertical Line */}
                    {index !== steps.length - 1 && (
                        <div className="absolute left-[19px] top-8 bottom-0 w-0.5 bg-neutral-300 dark:bg-neutral-600 -z-10" />
                    )}

                    {/* Icon/Dot */}
                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-600 rounded-full z-10">
                        {step.type === 'bus' ? (
                            <BusIcon className="w-5 h-5 text-primary" />
                        ) : step.type === 'auto' ? (
                            <span className="text-lg">🛺</span>
                        ) : (
                            <span className="text-lg">🚶</span>
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-grow pt-1">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-bold text-neutral-800 dark:text-neutral-100 text-sm">
                                    {step.isStart ? 'Start' : step.isEnd ? 'End' : step.description}
                                </h4>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                                    {step.isStart || step.isEnd ? step.description : `via ${step.distance || ''}`}
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="font-bold text-neutral-800 dark:text-neutral-100 text-sm block">
                                    {step.time}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TripTimeline;

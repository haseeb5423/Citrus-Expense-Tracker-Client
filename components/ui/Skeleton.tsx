import React from 'react';

interface SkeletonProps {
    className?: string;
    variant?: 'rect' | 'circle' | 'text';
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', variant = 'rect' }) => {
    const baseClasses = 'animate-pulse bg-[var(--text-muted)] opacity-[0.08]';
    const variantClasses = {
        rect: 'rounded-2xl',
        circle: 'rounded-full',
        text: 'rounded-md h-4 w-full',
    };

    return <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />;
};

export const DashboardSkeleton = () => (
    <div className="max-w-7xl mx-auto space-y-8 fade-in">
        {/* KPI Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 rounded-[2.5rem] glass" />
            ))}
        </div>

        {/* Chart and Side Column Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Skeleton className="lg:col-span-2 h-80 rounded-[3rem] glass" />
            <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center px-1">
                    <Skeleton className="w-24 h-6" variant="text" />
                    <Skeleton className="w-16 h-4" variant="text" />
                </div>
                <div className="flex flex-col gap-4">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-40 rounded-[2.5rem] glass" />
                    ))}
                </div>
            </div>
        </div>

        {/* Recent History Skeleton */}
        <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
                <Skeleton className="w-32 h-6" variant="text" />
                <Skeleton className="w-20 h-4" variant="text" />
            </div>
            <div className="glass rounded-[2.5rem] p-6 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex justify-between items-center border-b border-[var(--border-default)] pb-4 last:border-0 last:pb-0">
                        <div className="flex items-center gap-4">
                            <Skeleton className="w-10 h-10" variant="circle" />
                            <div className="space-y-2">
                                <Skeleton className="w-24 h-4" variant="text" />
                                <Skeleton className="w-16 h-2" variant="text" />
                            </div>
                        </div>
                        <Skeleton className="w-16 h-4" variant="text" />
                    </div>
                ))}
            </div>
        </div>
    </div>
);

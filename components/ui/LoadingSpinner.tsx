
import React from 'react';

interface LoadingSpinnerProps {
    size?: number;
    className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 16, className = "" }) => {
    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div 
                className="animate-spin rounded-full border-2 border-[var(--action-primary)] border-t-transparent"
                style={{ width: size, height: size }}
            />
        </div>
    );
};


import React from 'react';

interface LoadingSpinnerProps {
    size?: number;
    className?: string;
    variant?: 'primary' | 'white' | 'dual';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 24, className = "", variant = 'primary' }) => {
    return (
        <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
            {/* Outer Glow Ring */}
            <div className="absolute inset-0 rounded-full border-2 border-[var(--action-soft)] animate-pulse" />

            {/* Main Spinner SVG */}
            <svg
                viewBox="0 0 100 100"
                className="w-full h-full animate-spin"
                style={{ animationDuration: '1.5s' }}
            >
                <defs>
                    <linearGradient id="spinner-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="var(--action-primary)" />
                        <stop offset="100%" stopColor="#10b981" /> {/* Emerald/Lime */}
                    </linearGradient>
                </defs>
                <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="url(#spinner-gradient)"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray="180 80"
                />
            </svg>

            {/* Inner Fast Ring */}
            <div
                className="absolute w-[60%] h-[60%] rounded-full border-2 border-t-[var(--action-primary)] border-r-transparent border-b-transparent border-l-transparent animate-spin"
                style={{ animationDuration: '0.8s' }}
            />
        </div>
    );
};

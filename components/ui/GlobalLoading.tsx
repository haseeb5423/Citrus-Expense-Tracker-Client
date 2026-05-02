
import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface GlobalLoadingProps {
    message?: string;
    fullScreen?: boolean;
}

export const GlobalLoading: React.FC<GlobalLoadingProps> = ({
    message = "Syncing with Citrus Cloud...",
    fullScreen = false
}) => {
    return (
        <div className={`
            ${fullScreen ? 'fixed inset-0 z-[200] bg-[var(--bg-primary)]/40 backdrop-blur-2xl' : 'relative py-24 sm:py-32'} 
            flex flex-col items-center justify-center gap-6 
            animate-in fade-in duration-500
        `}>
            {/* Ambient Background Glow */}
            <div className={`
                absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                ${fullScreen ? 'w-96 h-96' : 'w-64 h-64'} 
                bg-[var(--action-primary)]/20 blur-[120px] pointer-events-none rounded-full animate-pulse
            `} />

            <div className="relative flex flex-col items-center gap-8 animate-in zoom-in-95 duration-700">
                {/* Premium Spinner with outer ring */}
                <div className="relative group">
                    {/* Pulsing ring around spinner */}
                    <div className="absolute inset-[-12px] rounded-full border border-[var(--action-soft)] animate-ping opacity-40" />

                    <LoadingSpinner size={fullScreen ? 80 : 64} className="relative z-10" />

                    {/* Glowing base shadow */}
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-16 h-2 bg-[var(--action-primary)]/30 blur-md rounded-full shadow-[0_0_20px_rgba(249,115,22,0.4)]" />
                </div>

                <div className="flex flex-col items-center gap-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.6em] text-[var(--action-primary)] animate-pulse pl-[0.6em]">
                        Please Wait
                    </p>
                    <p className="text-base font-semibold text-[var(--text-primary)] tracking-tight">
                        {message}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] font-medium max-w-[200px] text-center">
                        Initializing secure session and preparing your dashboard...
                    </p>
                </div>
            </div>

            {/* Corner Decorative Elements */}
            {!fullScreen && (
                <>
                    <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-[var(--action-soft)] rounded-tl-3xl opacity-50" />
                    <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-[var(--action-soft)] rounded-br-3xl opacity-50" />
                </>
            )}

            {/* Navigation Progress bar (fake for aesthetic) */}
            {fullScreen && (
                <div className="absolute bottom-12 w-48 h-1 bg-[var(--border-default)] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[var(--action-primary)] to-[#10b981] w-[60%] animate-pulse rounded-full" />
                </div>
            )}
        </div>
    );
};

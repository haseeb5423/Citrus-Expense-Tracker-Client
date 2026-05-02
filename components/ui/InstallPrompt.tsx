import React from 'react';
import { Download, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const InstallPrompt: React.FC = () => {
  const { isInstallable, install } = usePWAInstall();
  const [isVisible, setIsVisible] = React.useState(true);
  const [isDismissed, setIsDismissed] = React.useState(() => {
    return localStorage.getItem('citrus_install_dismissed') === 'true';
  });

  if (!isInstallable || !isVisible || isDismissed) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('citrus_install_dismissed', 'true');
  };

  return (
    <div className="fixed bottom-24 right-6 left-6 sm:left-auto sm:top-24 sm:right-6 z-[200] animate-in slide-in-from-bottom-10 sm:slide-in-from-right-10 fade-in duration-700">
      <div className="glass-morphism bg-[var(--action-primary)]/10 border border-[var(--action-primary)]/20 backdrop-blur-2xl p-6 rounded-[2.5rem] flex flex-col gap-4 shadow-2xl shadow-[var(--action-primary)]/10 w-full sm:w-72">
        <div className="flex justify-between items-start">
          <div className="w-12 h-12 rounded-2xl bg-[var(--action-primary)] flex items-center justify-center text-white shadow-lg shadow-[var(--action-primary)]/30">
            <Download size={24} />
          </div>
          <button 
            onClick={handleDismiss}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-[var(--text-muted)] hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
        
        <div className="flex flex-col gap-1">
          <h4 className="text-base font-bold text-white">Install Citrus</h4>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            Install Citrus on your device for a faster, full-screen experience and offline access.
          </p>
        </div>

        <button 
          onClick={install}
          className="w-full py-3 bg-[var(--action-primary)] hover:bg-orange-500 text-white rounded-2xl font-bold text-sm transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-[var(--action-primary)]/20"
        >
          Install Now
        </button>
      </div>
    </div>
  );
};

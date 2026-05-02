import React from 'react';
import { WifiOff, X } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { syncService } from '../../services/syncService';

export const OfflineBanner: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [isVisible, setIsVisible] = React.useState(true);
  const [pendingCount, setPendingCount] = React.useState(0);

  React.useEffect(() => {
    if (!isOnline) {
      const interval = setInterval(() => {
        setPendingCount(syncService.getPendingCount());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isOnline]);

  if (isOnline || !isVisible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-bottom-10 fade-in duration-500">
      <div className="glass-morphism bg-orange-500/20 border border-orange-500/30 backdrop-blur-xl px-6 py-4 rounded-3xl flex items-center gap-4 shadow-2xl shadow-orange-500/20 max-w-[90vw] w-fit">
        <div className="w-10 h-10 rounded-2xl bg-orange-500 flex items-center justify-center text-white shrink-0">
          <WifiOff size={20} />
        </div>
        <div className="flex flex-col">
          <h4 className="text-sm font-bold text-white">Working Offline</h4>
          <p className="text-[10px] text-orange-200/70 font-medium uppercase tracking-wider">
            {pendingCount > 0 ? `${pendingCount} change${pendingCount > 1 ? 's' : ''} pending sync` : 'Changes will sync when reconnected'}
          </p>
        </div>
        <button 
          onClick={() => setIsVisible(false)}
          className="p-2 hover:bg-white/10 rounded-xl transition-colors text-orange-200/50 hover:text-white"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

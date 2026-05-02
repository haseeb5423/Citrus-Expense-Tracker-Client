import React from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  isLoading?: boolean;
}

export const ConfirmationModal: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Delete",
  isLoading = false 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xl z-[250] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-[var(--bg-primary)] w-full max-w-sm rounded-[3rem] overflow-hidden shadow-[0_40px_80px_-15px_rgba(0,0,0,0.6)] animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 border border-white/10 glass-glow p-10 flex flex-col items-center text-center">
        
        <div className="w-20 h-20 rounded-[2rem] bg-red-500/10 flex items-center justify-center text-red-500 mb-8 border border-red-500/20 shadow-lg shadow-red-500/5">
          <AlertTriangle size={32} />
        </div>

        <h3 className="text-2xl font-bold uppercase tracking-tighter leading-none mb-3">
          {title}
        </h3>
        <p className="text-xs font-semibold text-[var(--text-muted)] leading-relaxed mb-8">
          {message}
        </p>

        <div className="flex flex-col w-full gap-3">
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full py-5 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold uppercase tracking-[0.15em] shadow-xl shadow-red-500/20 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <Trash2 size={18} />
                {confirmText}
              </>
            )}
          </button>
          
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-full py-5 bg-transparent hover:bg-white/5 text-[var(--text-secondary)] rounded-2xl font-bold uppercase tracking-[0.15em] transition-all border border-[var(--border-default)]"
          >
            Cancel
          </button>
        </div>

        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-[var(--text-muted)] hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

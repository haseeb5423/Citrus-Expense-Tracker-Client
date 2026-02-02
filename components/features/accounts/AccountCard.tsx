
import React from 'react';
import { Account } from '../../../types';
import { Citrus, Sparkle, Edit3, Trash2 } from 'lucide-react';

interface Props {
  account: Account;
  isSelected?: boolean;
  onClick?: () => void;
  onEdit?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
  formatCurrency: (value: number) => string;
  isLoading?: boolean;
}

const THEME_MAP: Record<string, { gradient: string; shadow: string; ring: string }> = {
  blue: {
    gradient: 'from-[#2563eb] via-[#3b82f6] to-[#60a5fa]', // Stronger Blue
    shadow: 'rgba(37, 99, 235, 0.4)',
    ring: 'ring-blue-500/40'
  },
  emerald: {
    gradient: 'from-[#059669] via-[#10b981] to-[#34d399]', // Stronger Emerald
    shadow: 'rgba(5, 150, 105, 0.4)',
    ring: 'ring-emerald-500/40'
  },
  orange: {
    gradient: 'from-[#ea580c] via-[#f97316] to-[#fbbf24]', // Stronger Orange
    shadow: 'rgba(234, 88, 12, 0.4)',
    ring: 'ring-orange-500/40'
  },
  purple: {
    gradient: 'from-[#7c3aed] via-[#8b5cf6] to-[#a78bfa]', // Stronger Purple
    shadow: 'rgba(124, 58, 237, 0.4)',
    ring: 'ring-purple-500/40'
  },
  rose: {
    gradient: 'from-[#e11d48] via-[#f43f5e] to-[#fb7185]', // Stronger Rose
    shadow: 'rgba(225, 29, 72, 0.4)',
    ring: 'ring-rose-500/40'
  },
  slate: {
    gradient: 'from-[#334155] via-[#475569] to-[#64748b]', // Stronger Slate
    shadow: 'rgba(51, 65, 85, 0.4)',
    ring: 'ring-slate-500/40'
  },
  indigo: {
    gradient: 'from-[#4338ca] via-[#6366f1] to-[#818cf8]', // Strong Indigo for Family
    shadow: 'rgba(67, 56, 202, 0.4)',
    ring: 'ring-indigo-500/40'
  }
};

export const AccountCard: React.FC<Props> = ({ account, isSelected, onClick, onEdit, onDelete, formatCurrency, isLoading }) => {
  // Simple heuristic to pick a theme based on common type names if not explicitly saved
  // Priority: 1. account.color (if valid), 2. type heuristic, 3. default (slate)
  const typeLower = account.type?.toLowerCase() || '';
  let themeKey = 'slate';

  // Heuristics
  if (typeLower.includes('debit') || typeLower.includes('current')) themeKey = 'blue';
  if (typeLower.includes('savings') || typeLower.includes('salary')) themeKey = 'emerald';
  if (typeLower.includes('credit')) themeKey = 'orange';
  if (typeLower.includes('invest') || typeLower.includes('family')) themeKey = 'indigo'; // Family -> Indigo
  if (typeLower.includes('crypto')) themeKey = 'rose';

  // Override if explicit valid color provided
  if (account.color && THEME_MAP[account.color]) {
    themeKey = account.color;
  }

  const config = THEME_MAP[themeKey];

  const selectedClasses = `ring-[6px] ${config.ring} ring-offset-4 ring-offset-[var(--bg-primary)] scale-[1.05] z-20`;
  const defaultClasses = 'shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:scale-[1.03] hover:-translate-y-2 hover:z-[30]';

  const dynamicStyles = isSelected ? {
    boxShadow: `0 20px 50px ${config.shadow}`
  } : {};

  return (
    <div
      onClick={onClick}
      style={dynamicStyles}
      className={`relative w-72 h-44 rounded-[2.5rem] p-7 cursor-pointer transition-all duration-700 cubic-bezier(0.23, 1, 0.32, 1) bg-gradient-to-br ${config.gradient} flex flex-col justify-between overflow-hidden group ${isSelected ? selectedClasses : defaultClasses}`}
    >
      {isLoading && (
        <div className="absolute inset-0 z-50 bg-black/30 flex items-center justify-center animate-in fade-in duration-200">
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <div className="absolute top-4 right-4 z-30 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {onEdit && (
          <button
            onClick={onEdit}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all hover:scale-110"
          >
            <Edit3 size={14} />
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-white transition-all hover:scale-110"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>



      <div className="flex justify-between items-start relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/20 rounded-2xl">
            <Citrus className="text-white" size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-white text-[10px] font-bold uppercase tracking-[0.15em] leading-none mb-1">{account.name}</span>
            <span className="text-white/60 text-[8px] font-bold uppercase tracking-widest leading-none bg-black/10 w-fit px-1.5 py-0.5 rounded-md">{account.type}</span>
          </div>
        </div>
        <Sparkle className="text-white/40 animate-pulse" size={16} />
      </div>

      <div className="relative z-10">
        <div className="text-white/70 text-[9px] font-bold uppercase tracking-[0.25em] mb-1.5 opacity-90">Current Balance</div>
        <div className="text-white text-3xl font-bold font-poppins tabular-nums tracking-tighter">
          {formatCurrency(account.balance)}
        </div>
      </div>

      <div className="flex justify-between items-end relative z-10">
        <div className="space-y-1">
          <div className="text-white/50 text-[7px] font-bold uppercase tracking-[0.2em]">Account Holder</div>
          <div className="text-white/90 text-[11px] font-bold tracking-tight uppercase">
            {account.cardHolder || 'CITRUS'}
          </div>
        </div>
        <div className="text-right">
          <div className="text-white/95 text-[10px] font-bold font-mono tracking-[0.2em] bg-white/10 px-2.5 py-1 rounded-xl">
            {account.cardNumber?.slice(-4) || '4242'}
          </div>
        </div>
      </div>
    </div>
  );
};

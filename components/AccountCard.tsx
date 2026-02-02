
import React from 'react';
import { Account } from '../types';
import { CreditCard, Citrus } from 'lucide-react';

interface Props {
  account: Account;
  isSelected?: boolean;
  onClick?: () => void;
  formatCurrency: (value: number) => string;
}

export const AccountCard: React.FC<Props> = ({ account, isSelected, onClick, formatCurrency }) => {
  return (
    <div 
      onClick={onClick}
      className={`relative w-72 h-44 rounded-[1.75rem] p-6 cursor-pointer transition-all duration-500 ease-out overflow-hidden bg-gradient-to-br ${account.color} 
        ${isSelected 
          ? 'ring-4 ring-[var(--action-primary)] ring-offset-4 ring-offset-[var(--bg-primary)] scale-105 shadow-2xl z-10' 
          : 'shadow-lg hover:shadow-2xl hover:scale-[1.03] hover:-translate-y-1'
        }`}
    >
      <div className="flex justify-between items-start mb-4 relative z-10">
        <Citrus className="text-white/40" size={24} />
        <span className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em]">{account.type}</span>
      </div>
      
      <div className="mb-6 relative z-10">
        <div className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-1">Balance</div>
        <div className="text-white text-3xl font-black font-poppins tabular-nums tracking-tighter">
          {formatCurrency(account.balance)}
        </div>
      </div>
      
      <div className="flex justify-between items-end relative z-10">
        <div>
          <div className="text-white/40 text-[8px] font-black uppercase tracking-tighter">Owner</div>
          <div className="text-white text-xs font-black tracking-tight">{account.cardHolder || 'MY WALLET'}</div>
        </div>
        <div className="text-white/80 text-xs font-bold font-mono tracking-widest">
          {account.cardNumber?.slice(-4) || '0000'}
        </div>
      </div>
      
      {/* Decorative patterns */}
      <div className="absolute top-0 right-0 -mr-12 -mt-12 w-40 h-40 bg-white/10 rounded-full blur-2xl transition-transform duration-700 group-hover:scale-150"></div>
      <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 bg-black/10 rounded-full blur-xl"></div>
      
      {/* Subtle Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 0)', backgroundSize: '12px 12px' }}></div>
    </div>
  );
};

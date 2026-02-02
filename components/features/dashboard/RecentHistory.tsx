
import React from 'react';
import { ArrowUpRight, ArrowDownLeft, ChevronRight, Home, Briefcase, Utensils, Car, Tv, ShoppingBag, Zap, HeartPulse, TrendingUp, HelpCircle } from 'lucide-react';
import { Transaction } from '../../../types';
import { formatCurrency, formatDate } from '../../../utils/formatters';

interface Props {
  transactions: Transaction[];
  onSeeAll?: () => void;
  currencySymbol: string;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Housing': <Home size={18} />,
  'Salary': <Briefcase size={18} />,
  'Food': <Utensils size={18} />,
  'Transport': <Car size={18} />,
  'Entertainment': <Tv size={18} />,
  'Shopping': <ShoppingBag size={18} />,
  'Utilities': <Zap size={18} />,
  'Health': <HeartPulse size={18} />,
  'Investment': <TrendingUp size={18} />,
  'Other': <HelpCircle size={18} />,
};

export const RecentHistory: React.FC<Props> = React.memo(({ transactions, onSeeAll, currencySymbol }) => {
  return (
    <div className="glass p-8 rounded-[3rem]">
      <div className="flex justify-between items-center mb-8 px-2">
        <div>
          <h3 className="text-xl font-bold tracking-tighter">Activity Stream</h3>
          <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest">Tracking your flow</p>
        </div>
        <button
          onClick={onSeeAll}
          className="bg-[var(--bg-primary)] hover:bg-[var(--action-soft)] text-[var(--action-primary)] font-semibold text-[10px] uppercase tracking-widest px-6 py-2.5 rounded-2xl flex items-center gap-2 transition-all group border border-[var(--border-default)]"
        >
          View All <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="space-y-3">
        {transactions.slice(0, 6).map(t => (
          <div
            key={t.id}
            className="flex items-center justify-between p-4 md:p-5 bg-[var(--bg-primary)]/50 hover:bg-[var(--bg-primary)] border border-transparent hover:border-[var(--border-default)] rounded-[2rem] transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-3 md:gap-5 flex-1 min-w-0 mr-4">
              <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex-shrink-0 flex items-center justify-center transition-transform group-hover:scale-110 ${t.type === 'income'
                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30'
                : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30'
                }`}>
                {CATEGORY_ICONS[t.category] || (t.type === 'income' ? <ArrowUpRight size={22} /> : <ArrowDownLeft size={22} />)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm text-[var(--text-primary)] leading-none mb-1.5 truncate">{t.description}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[9px] text-[var(--text-muted)] font-semibold uppercase tracking-widest bg-[var(--bg-secondary)] px-2 py-0.5 rounded-lg border border-[var(--border-default)] whitespace-nowrap">
                    {t.category}
                  </span>
                  <span className="w-1 h-1 bg-[var(--text-muted)]/30 rounded-full hidden sm:block"></span>
                  <span className="text-[9px] text-[var(--text-muted)] font-semibold whitespace-nowrap">{formatDate(t.date)}</span>
                </div>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className={`text-base md:text-lg font-bold tabular-nums tracking-tighter ${t.type === 'income' ? 'text-[var(--success)]' : 'text-[var(--text-primary)]'}`}>
                {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, currencySymbol).replace(currencySymbol + ' ', '')}
                <span className="text-[10px] ml-0.5 opacity-60 font-semibold">{currencySymbol}</span>
              </p>
              <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
                Verified
              </p>
            </div>
          </div>
        ))}
        {transactions.length === 0 && (
          <div className="py-20 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-[var(--bg-primary)] rounded-full flex items-center justify-center mb-4 border-2 border-dashed border-[var(--border-default)]">
              <HelpCircle className="text-[var(--text-muted)]" size={32} />
            </div>
            <p className="font-semibold text-[var(--text-muted)] uppercase tracking-widest text-xs">No Recent Activity Found</p>
            <p className="text-[10px] text-[var(--text-muted)] mt-1 font-semibold">Add your first transaction to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
});


import React from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Zap } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';

interface Props {
  stats: {
    totalBalance: number;
    income: number;
    expenses: number;
  };
  currencySymbol: string;
}

export const KpiCards: React.FC<Props> = ({ stats, currencySymbol }) => {
  const savingsRate = stats.income > 0 ? Math.round(((stats.income - stats.expenses) / stats.income) * 100) : 0;
  const f = (val: number) => formatCurrency(val, currencySymbol);

  // Calculate dynamic projected growth based on current month's net flow vs total balance
  const netFlow = stats.income - stats.expenses;
  const projectedGrowth = stats.totalBalance > 0 
    ? (netFlow / stats.totalBalance) * 100 
    : (netFlow > 0 ? 100 : 0);

  const isPositive = projectedGrowth >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Total Balance Card */}
      <div className="glass glass-glow p-8 rounded-[2.5rem] relative overflow-hidden group">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-[var(--action-soft)] rounded-2xl text-[var(--action-primary)] shadow-[0_0_15px_rgba(249,115,22,0.3)]">
            <Zap size={24} />
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">Net Assets</span>
        </div>
        <div className="text-4xl font-bold font-poppins text-[var(--text-primary)] tracking-tighter drop-shadow-sm">
          {f(stats.totalBalance)}
        </div>
        <div className={`mt-4 flex items-center gap-2 font-semibold text-xs w-fit px-3 py-1 rounded-full border ${
          isPositive 
            ? 'text-[var(--success)] bg-[var(--success-soft)] border-[var(--success)]/20' 
            : 'text-[var(--error)] bg-red-100 dark:bg-red-900/20 border-red-500/20'
        }`}>
          {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />} 
          {isPositive ? '+' : ''}{projectedGrowth.toFixed(1)}% Projected
        </div>
        <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-[var(--action-primary)] opacity-[0.05] rounded-full blur-3xl group-hover:opacity-[0.1] transition-opacity"></div>
      </div>

      {/* Income Card */}
      <div className="glass glass-glow p-8 rounded-[2.5rem] relative overflow-hidden group">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-[var(--success-soft)] rounded-2xl text-[var(--success)] shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <ArrowUpRight size={24} />
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">Flow In</span>
        </div>
        <div className="text-4xl font-bold font-poppins text-[var(--success)] tracking-tighter drop-shadow-sm">
          {f(stats.income)}
        </div>
        <p className="mt-4 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-2">
          Monthly Intake <span className="w-1 h-1 bg-[var(--success)] rounded-full animate-pulse"></span> {savingsRate > 0 ? `${savingsRate}% retained` : '0% retained'}
        </p>
      </div>

      {/* Expenses Card */}
      <div className="glass glass-glow p-8 rounded-[2.5rem] relative overflow-hidden group">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-2xl text-[var(--error)] shadow-[0_0_15px_rgba(239,68,68,0.3)]">
            <ArrowDownRight size={24} />
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">Flow Out</span>
        </div>
        <div className="text-4xl font-bold font-poppins text-[var(--error)] tracking-tighter drop-shadow-sm">
          {f(stats.expenses)}
        </div>
        <div className="mt-4 h-1.5 w-full bg-[var(--bg-primary)] rounded-full overflow-hidden border border-[var(--border-default)]">
          <div 
            className="h-full bg-gradient-to-r from-[var(--error)] to-[var(--action-primary)] transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(239,68,68,0.4)]" 
            style={{ width: `${Math.min(100, (stats.expenses / (stats.income || 1)) * 100)}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-[8px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
          <span>Capacity Usage</span>
          <span>{Math.round((stats.expenses / (stats.income || 1)) * 100)}%</span>
        </div>
      </div>
    </div>
  );
};

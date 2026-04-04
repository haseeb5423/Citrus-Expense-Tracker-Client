import React, { useMemo, useState } from 'react';
import { UserProfile, Transaction, Account } from '../../../types';
import { formatDate, formatCurrency } from '../../../utils/formatters';
import { 
  User as UserIcon, 
  Calendar, 
  Mail, 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface Props {
  user: UserProfile | null;
  transactions: Transaction[];
  accounts: Account[];
  currencySymbol: string;
}

const ITEMS_PER_PAGE = 5;

export const ProfileView: React.FC<Props> = ({
  user,
  transactions,
  accounts,
  currencySymbol
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  const stats = useMemo(() => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const transactionCount = transactions.length;
    const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);
    
    return { totalIncome, totalExpenses, transactionCount, totalBalance };
  }, [transactions, accounts]);

  const allStreamTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions]);

  const totalPages = Math.ceil(allStreamTransactions.length / ITEMS_PER_PAGE);

  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return allStreamTransactions.slice(start, start + ITEMS_PER_PAGE);
  }, [allStreamTransactions, currentPage]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-[var(--action-soft)] flex items-center justify-center text-[var(--action-primary)]">
          <UserIcon size={32} />
        </div>
        <h3 className="text-xl font-bold">Please Sign In</h3>
        <p className="text-[var(--text-muted)] text-sm">Join Citrus Elite to track your profile and history.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 fade-in pb-12">
      {/* Profile Header */}
      <div className="glass rounded-[3rem] p-8 border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--action-primary)] opacity-5 blur-[80px] -mr-32 -mt-32"></div>
        
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-tr from-[var(--action-primary)] to-[#fbbf24] rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition-opacity"></div>
            <img
              src={user.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"}
              alt={user.name}
              className="w-32 h-32 rounded-[2.25rem] border-4 border-white/20 shadow-2xl relative z-10"
            />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#10b981] rounded-full border-4 border-[var(--bg-primary)] flex items-center justify-center shadow-lg">
              <ShieldCheck size={14} className="text-white" />
            </div>
          </div>

          <div className="text-center md:text-left flex-1">
            <h2 className="text-4xl font-black tracking-tighter text-[var(--text-primary)] mb-2">
              {user.name}
            </h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/10 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                <Mail size={14} className="text-[var(--action-primary)]" />
                {user.email}
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/10 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                <Calendar size={14} className="text-[var(--action-primary)]" />
                Joined {formatDate(user.joinedAt)}
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--action-soft)] rounded-xl border border-[var(--action-primary)]/20 text-[11px] font-bold text-[var(--action-primary)] uppercase tracking-widest">
                <TrendingUp size={14} />
                Citrus Elite
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* KPI Cards */}
        <div className="glass rounded-[2rem] p-6 border border-white/10 flex flex-col items-center text-center bg-gradient-to-br from-[var(--action-primary)]/5 to-white/5">
          <div className="w-12 h-12 rounded-2xl bg-[var(--action-soft)] flex items-center justify-center text-[var(--action-primary)] mb-4 shadow-lg shadow-[var(--action-primary)]/10">
            <Wallet size={24} />
          </div>
          <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">Current Net Worth</span>
          <span className="text-2xl font-black tabular-nums text-[var(--action-primary)]">{formatCurrency(stats.totalBalance, currencySymbol)}</span>
        </div>

        <div className="glass rounded-[2rem] p-6 border border-white/10 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-4">
            <TrendingUp size={24} />
          </div>
          <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">Lifetime Income</span>
          <span className="text-2xl font-black tabular-nums">{formatCurrency(stats.totalIncome, currencySymbol)}</span>
        </div>

        <div className="glass rounded-[2rem] p-6 border border-white/10 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 mb-4">
            <TrendingDown size={24} />
          </div>
          <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">Lifetime Expenses</span>
          <span className="text-2xl font-black tabular-nums">{formatCurrency(stats.totalExpenses, currencySymbol)}</span>
        </div>

        <div className="glass rounded-[2rem] p-6 border border-white/10 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 mb-4">
            <Clock size={24} />
          </div>
          <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">Total Activities</span>
          <span className="text-2xl font-black tabular-nums">{stats.transactionCount}</span>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-bold tracking-tight">Financial Stream</h3>
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
              Activity History • Page {currentPage} of {totalPages || 1}
            </span>
          </div>

          <div className="glass rounded-[2.5rem] border border-white/10 overflow-hidden flex flex-col">
            <div className="divide-y divide-white/10 flex-1">
              {paginatedTransactions.length === 0 ? (
                <div className="p-12 text-center text-[var(--text-muted)]">
                  <Wallet size={48} className="mx-auto mb-4 opacity-20" />
                  <p className="font-bold uppercase tracking-widest text-xs">No records found</p>
                </div>
              ) : (
                paginatedTransactions.map(t => (
                  <div key={t.id} className="p-6 hover:bg-white/5 transition-colors group flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        t.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'
                      }`}>
                        {t.type === 'income' ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-[var(--text-primary)] truncate">{t.description}</p>
                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tighter">
                          {formatDate(t.date)} • {t.category}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-sm font-black tabular-nums shrink-0 ${
                        t.type === 'income' ? 'text-emerald-500' : 'text-orange-500'
                      }`}>
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, currencySymbol)}
                      </span>
                      {t.balanceAt !== undefined && (
                        <span className="text-[10px] font-bold text-[var(--text-muted)] tabular-nums">
                          Balance: {formatCurrency(t.balanceAt, currencySymbol)}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {totalPages > 1 && (
              <div className="p-4 bg-white/5 border-t border-white/10 flex items-center justify-between gap-4">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 bg-[var(--bg-primary)] border border-white/10 rounded-xl text-[var(--text-muted)] hover:text-[var(--action-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={18} />
                </button>

                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all shrink-0 ${
                        currentPage === pageNum
                          ? 'bg-[var(--action-primary)] text-white shadow-lg shadow-[var(--action-primary)]/20'
                          : 'bg-[var(--bg-primary)]/40 text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-white/5'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 bg-[var(--bg-primary)] border border-white/10 rounded-xl text-[var(--text-muted)] hover:text-[var(--action-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold tracking-tight px-2">Account Summary</h3>
          <div className="space-y-4">
            {accounts.map(acc => (
              <div key={acc.id} className="glass rounded-2xl p-4 border border-white/10 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--action-soft)] flex items-center justify-center text-[var(--action-primary)] shrink-0">
                  <Wallet size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate">{acc.name}</p>
                  <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{acc.type}</p>
                </div>
                <span className="text-sm font-black tabular-nums">
                  {formatCurrency(acc.balance, currencySymbol)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

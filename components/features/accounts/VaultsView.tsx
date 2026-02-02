
import React, { useState } from 'react';
import { Account, Transaction } from '../../../types';
import { AccountCard } from './AccountCard';
import { RecentHistory } from '../dashboard/RecentHistory';
import { Plus, Info, TrendingUp, TrendingDown, Target, ShieldCheck, ArrowRightLeft } from 'lucide-react';

interface Props {
  accounts: Account[];
  transactions: Transaction[];
  formatCurrency: (val: number) => string;
  onAddVault: () => void;
  onEditVault: (account: Account) => void;
  onDeleteVault: (id: string) => void;
  onTransfer: () => void;
  currencySymbol: string;
  onSeeAll?: () => void;
}

export const VaultsView: React.FC<Props> = ({ accounts, transactions, formatCurrency, onAddVault, onEditVault, onDeleteVault, onTransfer, currencySymbol, onSeeAll }) => {
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id);
  const [deletingVaultId, setDeletingVaultId] = useState<string | null>(null);

  const selectedAccount = accounts.find(a => a.id === selectedAccountId) || accounts[0];
  const vaultTransactions = transactions.filter(t => t.accountId === selectedAccountId);

  const handleDelete = async (id: string) => {
    setDeletingVaultId(id);
    await onDeleteVault(id);
    setDeletingVaultId(null);
  };

  const vaultStats = React.useMemo(() => {
    if (!selectedAccount) return { income: 0, expenses: 0 };
    const now = new Date();
    const monthTransactions = vaultTransactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    const income = monthTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = monthTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    return { income, expenses };
  }, [selectedAccountId, vaultTransactions]);

  return (
    <div className="max-w-7xl mx-auto space-y-10 fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tighter mb-2">My Accounts</h2>
          <p className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-[0.2em]">Manage your money and savings</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={onTransfer}
            className="btn-primary px-8 py-4 rounded-2xl flex items-center gap-3 font-bold uppercase tracking-widest text-xs shadow-xl"
          >
            <ArrowRightLeft size={18} /> Transfer Funds
          </button>
          <button
            onClick={onAddVault}
            className="btn-primary px-8 py-4 rounded-2xl flex items-center gap-3 font-bold uppercase tracking-widest text-xs shadow-xl"
          >
            <Plus size={18} /> Add New Account
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">Your Wallets</h3>
            <span className="text-[10px] font-bold bg-[var(--action-soft)] text-[var(--action-primary)] px-2 py-0.5 rounded-full">{accounts.length} Total</span>
          </div>
          <div className="flex flex-row lg:flex-col gap-6 overflow-x-auto lg:overflow-y-auto lg:overflow-x-hidden p-4 -m-4 lg:m-0 lg:p-4 lg:max-h-[calc(100vh-12rem)] no-scrollbar lg:custom-scrollbar">
            {accounts.map(acc => (
              <div key={acc._id || acc.id} className="shrink-0 lg:shrink py-2">
                <AccountCard
                  account={acc}
                  isSelected={selectedAccountId === (acc._id || acc.id)}
                  onClick={() => setSelectedAccountId(acc._id || acc.id)}
                  onEdit={(e) => { e.stopPropagation(); onEditVault(acc); }}
                  onDelete={deletingVaultId ? undefined : (e) => { e.stopPropagation(); handleDelete(acc._id || acc.id); }}
                  formatCurrency={formatCurrency}
                  isLoading={deletingVaultId === (acc._id || acc.id)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-8 space-y-8">
          {selectedAccount ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="glass p-8 rounded-[2.5rem] relative overflow-hidden group border border-white/10">
                  <div className="flex justify-between mb-6">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                      <TrendingUp size={24} />
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest block">Money In</span>
                      <span className="text-xl font-bold text-emerald-500 tabular-nums">+{formatCurrency(vaultStats.income).replace(currencySymbol + ' ', '')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tighter">
                    <Target size={12} className="text-[var(--action-primary)]" /> Monthly Goal: 85%
                  </div>
                </div>

                <div className="glass p-8 rounded-[2.5rem] relative overflow-hidden group border border-white/10">
                  <div className="flex justify-between mb-6">
                    <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500">
                      <TrendingDown size={24} />
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest block">Money Out</span>
                      <span className="text-xl font-bold text-red-500 tabular-nums">-{formatCurrency(vaultStats.expenses).replace(currencySymbol + ' ', '')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tighter">
                    <ShieldCheck size={12} className="text-emerald-500" /> Secure & Private
                  </div>
                </div>
              </div>

              <div className="glass p-8 rounded-[3rem] border border-white/10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 rounded-full bg-[var(--action-soft)] flex items-center justify-center text-[var(--action-primary)]">
                    <Info size={20} />
                  </div>
                  <h3 className="text-lg font-bold tracking-tight">Account Details</h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  <div>
                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">Status</p>
                    <p className="text-sm font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Active
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">Type</p>
                    <p className="text-sm font-bold uppercase">{selectedAccount.type}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">Owner</p>
                    <p className="text-sm font-bold truncate">{selectedAccount.cardHolder}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">Protection</p>
                    <p className="text-sm font-bold">Encrypted</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[var(--text-muted)] px-2">Recent Transactions</h3>
                <RecentHistory transactions={vaultTransactions} onSeeAll={onSeeAll} currencySymbol={currencySymbol} />
              </div>
            </>
          ) : (
            <div className="h-96 glass rounded-[3rem] flex flex-col items-center justify-center text-center p-10 opacity-60">
              <Target size={48} className="text-[var(--text-muted)] mb-4" />
              <h3 className="text-xl font-bold uppercase tracking-widest">No Account Selected</h3>
              <p className="text-xs font-medium text-[var(--text-muted)] max-w-xs mt-2">Pick an account from the sidebar to see your balance and history.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

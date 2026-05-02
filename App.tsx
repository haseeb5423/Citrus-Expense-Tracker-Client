
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { AccountCard } from './components/features/accounts/AccountCard';
import { KpiCards } from './components/features/dashboard/KpiCards';
// import { MainChart } from './components/features/dashboard/MainChart';
import { RecentHistory } from './components/features/dashboard/RecentHistory';
const TransactionModal = lazy(() => import('./components/features/modals/TransactionModal').then(module => ({ default: module.TransactionModal })));
const AddVaultModal = lazy(() => import('./components/features/modals/AddVaultModal').then(module => ({ default: module.AddVaultModal })));
const TransferModal = lazy(() => import('./components/features/modals/TransferModal').then(module => ({ default: module.TransferModal })));
const LogoutConfirmationModal = lazy(() => import('./components/features/modals/LogoutConfirmationModal').then(module => ({ default: module.LogoutConfirmationModal })));
import { useFinance } from './hooks/useFinance';
import { AuthProvider, useAuth } from './context/AuthContext';
import { formatCurrency } from './utils/formatters';
import { Transaction, Account } from './types';
import { Calendar, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { ChartSkeleton, KpiCardSkeleton } from './components/ui/Skeleton';

// Lazy load heavy components for code splitting
const VaultsView = lazy(() => import('./components/features/accounts/VaultsView').then(module => ({ default: module.VaultsView })));
const HistoryView = lazy(() => import('./components/features/transactions/HistoryView').then(module => ({ default: module.HistoryView })));
const AnalyticsView = lazy(() => import('./components/features/analytics/AnalyticsView').then(module => ({ default: module.AnalyticsView })));
const SettingsView = lazy(() => import('./components/features/settings/SettingsView').then(module => ({ default: module.SettingsView })));
const MainChart = lazy(() => import('./components/features/dashboard/MainChart').then(module => ({ default: module.MainChart })));
const AuthView = lazy(() => import('./components/features/auth/AuthView').then(module => ({ default: module.AuthView })));
const ProfileView = lazy(() => import('./components/features/profile/ProfileView').then(module => ({ default: module.ProfileView })));

import { GlobalLoading } from './components/ui/GlobalLoading';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { OfflineBanner } from './components/ui/OfflineBanner';
import { InstallPrompt } from './components/ui/InstallPrompt';

const FinanceApp: React.FC = () => {
  const { user, loading, logout, showAuth, setShowAuth } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('citrus_dark');
    return saved === null ? true : saved === 'true';
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showAddVault, setShowAddVault] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [chartView, setChartView] = useState<'weekly' | 'monthly'>('weekly');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const {
    accounts,
    transactions,
    accountTypes,
    notifications,
    currency,
    setCurrency,
    stats,
    isLoading,
    isActionLoading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    bulkDeleteTransactions,
    deleteAllTransactions,
    addAccount,
    updateAccount,
    deleteAccount,
    addAccountType,
    deleteAccountType,
    resetData,
    markAllAsRead,
    transferFunds
  } = useFinance();

  useEffect(() => {
    localStorage.setItem('citrus_dark', isDarkMode.toString());
    document.body.className = isDarkMode ? 'theme-dark' : 'theme-light';
  }, [isDarkMode]);


  const handleTransactionSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const type = formData.get('type') as 'income' | 'expense';
    const amount = parseFloat(formData.get('amount') as string);
    const accountId = formData.get('accountId') as string;
    const category = formData.get('category') as string;
    const description = formData.get('description') as string;
    const dateInput = formData.get('date') as string;
    const date = dateInput ? new Date(dateInput).toISOString() : new Date().toISOString();

    if (isNaN(amount) || amount <= 0) return;

    if (editingTransaction) {
      await updateTransaction(editingTransaction.id, { type, amount, accountId, category, description, date });
      setEditingTransaction(null);
    } else {
      await addTransaction({ type, amount, accountId, category, description, date });
      setShowAddTransaction(false);
    }
  };

  const handleVaultSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const type = formData.get('type') as string;

    if (!name) return;

    if (editingAccount) {
      await updateAccount(editingAccount.id, { name, type });
      setEditingAccount(null);
    } else {
      await addAccount({ name, type, balance: 0 });
      setShowAddVault(false);
    }
  };

  const handleTransferSubmit = async (data: any) => {
    try {
      await transferFunds(data);
      setShowTransferModal(false);
    } catch (error) {
      console.error("Transfer failed", error);
    }
  };

  const appFormatCurrency = (val: number) => formatCurrency(val, currency);

  return (
    <div className="relative h-screen w-full bg-transparent overflow-hidden">
      {isLoading && <GlobalLoading fullScreen={true} />}
      <InstallPrompt />
      <OfflineBanner />
      
      <div className="flex h-full w-full">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isOpen={isMobileMenuOpen}
        setIsOpen={setIsMobileMenuOpen}
        user={user}
        onLogout={() => setShowLogoutConfirm(true)}
        onLoginClick={() => setShowAuth(true)}
      />

      <main className="flex-1 flex flex-col min-w-0">
        <TopHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onMobileMenuOpen={() => setIsMobileMenuOpen(true)}
          onAddClick={() => setShowAddTransaction(true)}
          onBack={() => setActiveTab('dashboard')}
          user={user}
          onLogout={() => setShowLogoutConfirm(true)}
          onLoginClick={() => setShowAuth(true)}
          isDarkMode={isDarkMode}
          toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          isLoading={isLoading}
        />

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          {activeTab === 'dashboard' && (
            <div className="max-w-7xl mx-auto space-y-8 fade-in">
              <KpiCards stats={stats} currencySymbol={currency} />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Suspense fallback={<ChartSkeleton />}>
                  <MainChart
                    transactions={transactions}
                    view={chartView}
                    onViewChange={setChartView}
                  />
                </Suspense>

                <div className="flex flex-col gap-6 lg:h-full">
                  <div className="flex justify-between items-center px-1">
                    <h3 className="text-lg font-bold tracking-tight">Active Wallets</h3>
                    <button
                      className="text-[var(--action-primary)] font-semibold text-xs flex items-center gap-1 hover:gap-2 transition-all"
                      onClick={() => setActiveTab('accounts')}
                    >
                      Manage <ChevronRightIcon size={14} />
                    </button>
                  </div>

                  <div className="relative">
                    <div className="flex lg:flex-col gap-8 overflow-x-auto lg:overflow-y-auto lg:max-h-[600px] py-6 lg:py-2 snap-x snap-mandatory no-scrollbar lg:custom-scrollbar -mx-4 px-4 lg:mx-0 lg:px-2">
                      {accounts.map(acc => (
                        <div key={acc.id} className="snap-center shrink-0">
                          <AccountCard
                            account={acc}
                            formatCurrency={appFormatCurrency}
                            onEdit={(e) => { e.stopPropagation(); setEditingAccount(acc); }}
                            onDelete={(e) => { e.stopPropagation(); deleteAccount(acc.id); }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <RecentHistory
                transactions={transactions}
                onSeeAll={() => setActiveTab('transactions')}
                currencySymbol={currency}
              />
            </div>
          )}

          {activeTab === 'accounts' && (
            <Suspense fallback={
              <div className="flex flex-col items-center justify-center h-96 gap-4">
                <LoadingSpinner size={48} />
                <p className="text-sm text-[var(--text-muted)] font-semibold">Loading Accounts...</p>
              </div>
            }>
              <VaultsView
                accounts={accounts}
                transactions={transactions}
                formatCurrency={appFormatCurrency}
                onAddVault={() => setShowAddVault(true)}
                onEditVault={(acc) => setEditingAccount(acc)}
                onDeleteVault={(id) => deleteAccount(id)}
                onTransfer={() => setShowTransferModal(true)}
                currencySymbol={currency}
                onSeeAll={() => setActiveTab('transactions')}
              />
            </Suspense>
          )}

          {activeTab === 'transactions' && (
            <Suspense fallback={
              <div className="flex flex-col items-center justify-center h-96 gap-4">
                <LoadingSpinner size={48} />
                <p className="text-sm text-[var(--text-muted)] font-semibold">Loading Transactions...</p>
              </div>
            }>
              <HistoryView
                transactions={transactions}
                accounts={accounts}
                onEdit={(t) => setEditingTransaction(t)}
                onDelete={deleteTransaction}
                onBulkDelete={bulkDeleteTransactions}
                onDeleteAll={deleteAllTransactions}
                currencySymbol={currency}
              />
            </Suspense>
          )}

          {activeTab === 'reports' && (
            <Suspense fallback={
              <div className="flex flex-col items-center justify-center h-96 gap-4">
                <LoadingSpinner size={48} />
                <p className="text-sm text-[var(--text-muted)] font-semibold">Loading Analytics...</p>
              </div>
            }>
              <AnalyticsView
                transactions={transactions}
                accounts={accounts}
                currencySymbol={currency}
              />
            </Suspense>
          )}

          {activeTab === 'settings' && (
            <Suspense fallback={
              <div className="flex flex-col items-center justify-center h-96 gap-4">
                <LoadingSpinner size={48} />
                <p className="text-sm text-[var(--text-muted)] font-semibold">Loading Settings...</p>
              </div>
            }>
              <SettingsView
                isDarkMode={isDarkMode}
                onToggleTheme={() => setIsDarkMode(!isDarkMode)}
                currency={currency}
                onCurrencyChange={setCurrency}
                accountTypes={accountTypes}
                onAddType={addAccountType}
                onDeleteType={deleteAccountType}
                onResetData={resetData}
              />
            </Suspense>
          )}

          {activeTab === 'profile' && (
            <Suspense fallback={
              <div className="flex flex-col items-center justify-center h-96 gap-4">
                <LoadingSpinner size={48} />
                <p className="text-sm text-[var(--text-muted)] font-semibold">Loading Profile...</p>
              </div>
            }>
              <ProfileView
                user={user}
                transactions={transactions}
                accounts={accounts}
                currencySymbol={currency}
              />
            </Suspense>
          )}
        </div>
      </main >

      <Suspense fallback={null}>
        <TransactionModal
          isOpen={showAddTransaction || !!editingTransaction}
          onClose={() => {
            setShowAddTransaction(false);
            setEditingTransaction(null);
          }}
          accounts={accounts}
          onSubmit={handleTransactionSubmit}
          transaction={editingTransaction}
          currencySymbol={currency}
          isLoading={isActionLoading}
        />

        <AddVaultModal
          isOpen={showAddVault || !!editingAccount}
          onClose={() => {
            setShowAddVault(false);
            setEditingAccount(null);
          }}
          onSubmit={handleVaultSubmit}
          account={editingAccount}
          accountTypes={accountTypes}
          isLoading={isActionLoading}
        />

        <TransferModal
          isOpen={showTransferModal}
          onClose={() => setShowTransferModal(false)}
          accounts={accounts}
          onSubmit={handleTransferSubmit}
          currencySymbol={currency}
          isLoading={isActionLoading}
        />

        <LogoutConfirmationModal
          isOpen={showLogoutConfirm}
          onClose={() => setShowLogoutConfirm(false)}
          onConfirm={() => {
            logout();
            setShowLogoutConfirm(false);
          }}
          userName={user?.name}
        />
      </Suspense>

      {
        showAuth && (
          <div className="fixed inset-0 z-[100] animate-in fade-in duration-300 bg-[var(--bg-primary)]/40 backdrop-blur-md flex items-center justify-center p-6">
            <Suspense fallback={
              <div className="glass p-10 rounded-[3rem] border border-white/10 flex flex-col items-center gap-6">
                <LoadingSpinner size={48} />
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Loading Secure Vault...</p>
              </div>
            }>
              <AuthView onBack={() => setShowAuth(false)} />
            </Suspense>
          </div>
        )
      }
      </div>
    </div >
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <FinanceApp />
  </AuthProvider>
);

export default App;


import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Account, Transaction, Notification, AccountType } from '../types';
import { INITIAL_ACCOUNTS } from '../constants';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const GUEST_DATA_KEY = 'citrus_guest_data';

const DEFAULT_TYPES: AccountType[] = [
  { id: 'type-1', label: 'Family', theme: 'indigo' },
  { id: 'type-2', label: 'Salary', theme: 'emerald' },
  { id: 'type-3', label: 'Current', theme: 'blue' },
  { id: 'type-4', label: 'Savings', theme: 'orange' },
];

export const useFinance = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currency, setCurrency] = useState(() => localStorage.getItem('citrus_currency') || 'Rs.');
  const [isLoading, setIsLoading] = useState(true);
  
  const prevUserRef = useRef<string | null>(null);
  const isSyncing = useRef(false);

  // Unified Data Loading Logic
  useEffect(() => {
    // Start loading whenever user state changes or initial load
    setIsLoading(true);

    const loadData = async () => {
      try {
        // 1. User Just Logged In (Transition)
        if (user && prevUserRef.current === null && !isSyncing.current) {
          isSyncing.current = true;
          const guestDataStr = localStorage.getItem(GUEST_DATA_KEY);
          
          if (guestDataStr) {
            try {
              const guestData = JSON.parse(guestDataStr);
              // SYNC with Backend using axios
              const response = await api.post('/finance/sync', {
                accounts: guestData.accounts || [],
                transactions: guestData.transactions || [],
                accountTypes: guestData.accountTypes || []
              });
              
              if (response.status === 200) {
                localStorage.removeItem(GUEST_DATA_KEY);
                // After sync, fetch fresh data
                await fetchBackendData();
              }
            } catch (e) {
              console.error("Sync failed", e);
            }
          } else {
            await fetchBackendData();
          }
          isSyncing.current = false;
        } 
        // 2. Guest Mode
        else if (!user) {
          const guestData = localStorage.getItem(GUEST_DATA_KEY);
          if (guestData) {
            const loadedData = JSON.parse(guestData);
            setAccounts(loadedData.accounts || INITIAL_ACCOUNTS);
            setTransactions(loadedData.transactions || []);
            setAccountTypes(loadedData.accountTypes || DEFAULT_TYPES);
          } else {
            setAccounts(INITIAL_ACCOUNTS);
          }
        } 
        // 3. User Already Logged In
        else if (user) {
          await fetchBackendData();
        }
  
        setNotifications([{
          id: 'welcome',
          title: user ? `Welcome, ${user.name}` : 'Welcome, Guest',
          message: user ? 'Connected to Citrus Cloud.' : 'Local Mode Active.',
          time: new Date().toISOString(),
          isRead: false,
          type: 'success'
        }]);
    
        prevUserRef.current = user?.id || null;
      } catch (error) {
        console.error("Data loading failed", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  const fetchBackendData = async () => {
    try {
      const { data } = await api.get('/finance/data');
      
      // Normalize MongoDB accounts to have both _id and id
      const normalizedAccounts = data.accounts.map((acc: any) => ({
        ...acc,
        id: acc._id || acc.id,
        // Ensure card holder matches user name if not set or generic
        cardHolder: user?.name ? user.name.toUpperCase() : (acc.cardHolder || 'CITRUS')
      }));
      const normalizedTransactions = data.transactions.map((tx: any) => ({
        ...tx,
        id: tx._id || tx.id
      }));

      // Map backend account types + merge with defaults if needed
      // Actually backend should return all if we sync defaults? 
      // Or we merge client-side. Let's merge backend custom types with DEFAULT_TYPES.
      // But ideally backend data is source of truth.
      // If backend returns accountTypes, use them.
      // The backend response structure for Types needs to be mapped to frontend structure (id, label, theme)
      
      let fetchedTypes: AccountType[] = [];
      if (data.accountTypes && Array.isArray(data.accountTypes)) {
         fetchedTypes = data.accountTypes.map((t: any) => ({
           id: t._id,
           label: t.label,
           theme: t.theme
         }));
      }

      // Merge defaults with fetched. Ensure no duplicates by label.
      // Or just use fetched if we sync defaults? 
      // The requirement is "custom types". Defaults are hardcoded.
      // Let's keep DEFAULT_TYPES always present and append custom fetched ones.
      // Filter out any fetched types that are already in DEFAULT_TYPES (by label)
      
      // Account Types Logic:
      // 1. Get types from backend
      // 2. If backend has types, use them.
      // 3. Always ensure DEFAULT_TYPES are available (merged), but prioritize backend IDs if they match.
      
      let finalTypes: AccountType[] = [...DEFAULT_TYPES];

      // console.log("Account Types from Backend:", data.accountTypes); 

      if (data.accountTypes && Array.isArray(data.accountTypes)) {
         const backendTypes = data.accountTypes.map((t: any) => ({
           id: t._id || t.id,
           label: t.label,
           theme: t.theme
         }));
         
         // Backend is the source of truth.
         // Do NOT merge defaults. If user deleted them, they should be gone.
         finalTypes = backendTypes;
      }
      
      // Sort: Defaults first (by ID or known labels), then others.
      // Actually just alphabetical or creation order is fine.
      
      setAccounts(normalizedAccounts);
      setTransactions(normalizedTransactions);
      setAccountTypes(finalTypes);
      
      // Sort by label for consistency
      // finalTypes.sort((a, b) => a.label.localeCompare(b.label));

      setAccounts(normalizedAccounts);
      setTransactions(normalizedTransactions);
      setAccountTypes(finalTypes); 
    } catch (e) {
      console.error("Fetch failed", e);
    }
  };

  // Persistence Logic (Only for Guest)
  useEffect(() => {
    if (user || isSyncing.current) return;

    const dataToSave = { accounts, transactions, accountTypes };
    localStorage.setItem(GUEST_DATA_KEY, JSON.stringify(dataToSave));
  }, [accounts, transactions, accountTypes, user]);

  useEffect(() => {
    localStorage.setItem('citrus_currency', currency);
  }, [currency]);

  const stats = useMemo(() => {
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const now = new Date();
    const thisMonth = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    const income = thisMonth.filter(t => t.type === 'income' && t.category !== 'Transfer').reduce((s, t) => s + t.amount, 0);
    const expenses = thisMonth.filter(t => t.type === 'expense' && t.category !== 'Transfer').reduce((s, t) => s + t.amount, 0);

    return { totalBalance, income, expenses };
  }, [accounts, transactions]);

  const getChartData = useCallback((days: number) => {
    const dayLabels = Array.from({ length: days }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - ((days - 1) - i));
      return d.toISOString().split('T')[0];
    });

    return dayLabels.map(date => {
      const dayTransactions = transactions.filter(t => t.date.startsWith(date));
      return {
        name: days <= 7 
          ? new Date(date).toLocaleDateString('en-US', { weekday: 'short' })
          : new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: dayTransactions.filter(t => t.type === 'expense' && t.category !== 'Transfer').reduce((s, t) => s + t.amount, 0),
        income: dayTransactions.filter(t => t.type === 'income' && t.category !== 'Transfer').reduce((s, t) => s + t.amount, 0),
      };
    });
  }, [transactions]);

  const weeklyChartData = useMemo(() => getChartData(7), [getChartData]);
  const monthlyChartData = useMemo(() => getChartData(30), [getChartData]);

  // Actions
  const addAccountType = useCallback(async (label: string, theme: AccountType['theme']) => {
    try {
      if (user) {
        const { data } = await api.post('/finance/account-types', { label, theme });
        setAccountTypes(prev => [...prev, { id: data._id, label: data.label, theme: data.theme }]);
      } else {
        const newType: AccountType = { id: `type-${Date.now()}`, label, theme };
        setAccountTypes(prev => [...prev, newType]);
      }
    } catch (error) {
      console.error("Failed to add account type", error);
    }
  }, [user]);

  const deleteAccountType = useCallback(async (id: string) => {
    try {
      // Check if it's a default type (prevent deletion if desired, but here just check logic)
      if (DEFAULT_TYPES.some(t => t.id === id)) {
        // Can't delete default types locally
        return; 
      }

      if (user) {
        await api.delete(`/finance/account-types/${id}`);
        setAccountTypes(prev => prev.filter(t => t.id !== id));
      } else {
        setAccountTypes(prev => prev.filter(t => t.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete account type", error);
    }
  }, [user]);

  const addTransaction = useCallback(async (data: any) => {
    setIsLoading(true);
    try {
      if (user) {
        // API
        const response = await api.post('/finance/transactions', {
          ...data,
          date: new Date().toISOString()
        });
        
        setTransactions(prev => [response.data, ...prev]);
        // Re-fetch to ensure consistency
        await fetchBackendData();
      } else {
        // Local
        const newTransaction: Transaction = {
          id: Date.now().toString(),
          ...data,
          date: new Date().toISOString()
        };
        setTransactions(prev => [newTransaction, ...prev]);
        setAccounts(prev => prev.map(acc => {
          if (acc.id === data.accountId) {
            return {
              ...acc,
              balance: data.type === 'income' ? acc.balance + data.amount : acc.balance - data.amount
            };
          }
          return acc;
        }));
      }
    } catch (error: any) {
      console.error('Add transaction failed:', error.message);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const updateTransaction = useCallback(async (id: string, data: any) => {
    setIsLoading(true);
    try {
      if (user) {
        await api.put(`/finance/transactions/${id}`, data);
        await fetchBackendData();
      } else {
        // Local Logic
        setTransactions(prev => {
          const oldTransaction = prev.find(t => t.id === id);
          if (!oldTransaction) return prev;

          setAccounts(accounts => {
            // Rollback old transaction
            let updated = accounts.map(acc => {
              if (acc.id === oldTransaction.accountId) {
                return { ...acc, balance: oldTransaction.type === 'income' ? acc.balance - oldTransaction.amount : acc.balance + oldTransaction.amount };
              }
              return acc;
            });

            // Apply new transaction
            updated = updated.map(acc => {
              if (acc.id === data.accountId) {
                return { ...acc, balance: data.type === 'income' ? acc.balance + data.amount : acc.balance - data.amount };
              }
              return acc;
            });

            return updated;
          });

          return prev.map(t => t.id === id ? { ...t, ...data } : t);
        });
      }
    } catch (error: any) {
      console.error('Update transaction failed:', error.message);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const addAccount = useCallback(async (data: any) => {
    setIsLoading(true);
    try {
      if (user) {
        await api.post('/finance/accounts', data);
        await fetchBackendData();
      } else {
        const newAccount: Account = {
          id: `acc-${Date.now()}`,
          ...data,
          cardNumber: `**** **** **** ${Math.floor(1000 + Math.random() * 9000)}`,
          cardHolder: 'GUEST USER',
          color: '',
        };
        setAccounts(prev => [...prev, newAccount]);
      }
    } catch (error: any) {
      console.error('Add account failed:', error.message);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const updateAccount = useCallback(async (id: string, data: any) => {
    setIsLoading(true);
    try {
      if (user) {
        await api.put(`/finance/accounts/${id}`, data);
        await fetchBackendData();
      } else {
        setAccounts(prev => prev.map(acc => acc.id === id ? { ...acc, ...data } : acc));
      }
    } catch (error: any) {
      console.error('Update account failed:', error.message);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const deleteAccount = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      if (user) {
        await api.delete(`/finance/accounts/${id}`);
        await fetchBackendData();
      } else {
        setAccounts(prev => prev.filter(acc => acc.id !== id));
        setTransactions(prev => prev.filter(t => t.accountId !== id));
      }
    } catch (error: any) {
      console.error('Delete account failed:', error.message);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const deleteTransaction = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      if (user) {
        await api.delete(`/finance/transactions/${id}`);
        await fetchBackendData();
      } else {
        // Guest mode: rollback balance and remove transaction
        setTransactions(prev => {
          const transaction = prev.find(t => t.id === id);
          if (!transaction) return prev;

          setAccounts(accounts => accounts.map(acc => {
            if (acc.id === transaction.accountId) {
              return {
                ...acc,
                balance: transaction.type === 'income' 
                  ? acc.balance - transaction.amount 
                  : acc.balance + transaction.amount
              };
            }
            return acc;
          }));
          
          return prev.filter(t => t.id !== id);
        });
      }
    } catch (error: any) {
      console.error('Delete transaction failed:', error.message);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const bulkDeleteTransactions = useCallback(async (ids: string[]) => {
    setIsLoading(true);
    try {
      if (user) {
        await api.delete('/finance/transactions/bulk-delete', { data: { ids } });
        await fetchBackendData();
      } else {
        // Guest mode: rollback balances for all selected transactions
        setTransactions(prev => {
          const transactionsToDelete = prev.filter(t => ids.includes(t.id));
          
          setAccounts(accounts => {
            let updated = [...accounts];
            transactionsToDelete.forEach(transaction => {
              updated = updated.map(acc => {
                if (acc.id === transaction.accountId) {
                  return {
                    ...acc,
                    balance: transaction.type === 'income' 
                      ? acc.balance - transaction.amount 
                      : acc.balance + transaction.amount
                  };
                }
                return acc;
              });
            });
            return updated;
          });

          return prev.filter(t => !ids.includes(t.id));
        });
      }
    } catch (error: any) {
      console.error('Bulk delete failed:', error.message);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const deleteAllTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      if (user) {
        await api.delete('/finance/transactions/delete-all');
        await fetchBackendData();
      } else {
        // Guest mode: rollback all balances
        setTransactions(prev => {
          setAccounts(accounts => {
            let updated = [...accounts];
            prev.forEach(transaction => {
              updated = updated.map(acc => {
                if (acc.id === transaction.accountId) {
                  return {
                    ...acc,
                    balance: transaction.type === 'income' 
                      ? acc.balance - transaction.amount 
                      : acc.balance + transaction.amount
                  };
                }
                return acc;
              });
            });
            return updated;
          });
          return [];
        });
      }
    } catch (error: any) {
      console.error('Delete all failed:', error.message);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const transferFunds = useCallback(async (data: { sourceAccountId: string, targetAccountId: string, amount: number, date: string, description?: string }) => {
    setIsLoading(true);
    try {
      if (user) {
        await api.post('/finance/transfer', data);
        await fetchBackendData();
      } else {
        // Local Guest Mode Transfer
        const { sourceAccountId, targetAccountId, amount, date, description } = data;
        
        const sourceAcc = accounts.find(a => a.id === sourceAccountId);
        const targetAcc = accounts.find(a => a.id === targetAccountId);
        
        if (!sourceAcc || !targetAcc) throw new Error('Account not found');

        const expenseTx: Transaction = {
          id: `tx-${Date.now()}-1`,
          accountId: sourceAccountId,
          amount,
          type: 'expense',
          category: 'Transfer',
          description: description || `Transfer to ${targetAcc.name}`,
          date: date || new Date().toISOString()
        };

        const incomeTx: Transaction = {
          id: `tx-${Date.now()}-2`,
          accountId: targetAccountId,
          amount,
          type: 'income',
          category: 'Transfer',
          description: description || `Transfer from ${sourceAcc.name}`,
          date: date || new Date().toISOString()
        };

        setTransactions(prev => [expenseTx, incomeTx, ...prev]);
        
        setAccounts(prev => prev.map(acc => {
          if (acc.id === sourceAccountId) return { ...acc, balance: acc.balance - amount };
          if (acc.id === targetAccountId) return { ...acc, balance: acc.balance + amount };
          return acc;
        }));
      }
    } catch (error: any) {
      console.error('Transfer failed:', error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user, accounts]);

  const resetData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (user) {
        await api.delete('/finance/reset');
        await fetchBackendData();
      } else {
        localStorage.removeItem('nexus_accounts');
        localStorage.removeItem('nexus_transactions');
        localStorage.removeItem('nexus_account_types');
        setAccounts([]);
        setTransactions([]);
        setAccountTypes([]);
      }
    } catch (error: any) {
      console.error('Reset data failed:', error.message);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  }, []);

  return {
    accounts,
    transactions,
    accountTypes,
    notifications,
    currency,
    setCurrency,
    stats,
    isLoading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    bulkDeleteTransactions,
    deleteAllTransactions,
    resetData,
    addAccount,
    updateAccount,
    deleteAccount,
    addAccountType,
    deleteAccountType,
    markAllAsRead,
    weeklyChartData,
    monthlyChartData,
    transferFunds
  };
};

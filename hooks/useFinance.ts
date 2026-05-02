
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Account, Transaction, Notification, AccountType } from '../types';
import { INITIAL_ACCOUNTS } from '../constants';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { syncService } from '../services/syncService';

const GUEST_DATA_KEY = 'citrus_guest_data';

const DEFAULT_TYPES: AccountType[] = [
  { id: 'type-1', label: 'Family', theme: 'indigo' },
  { id: 'type-2', label: 'Salary', theme: 'emerald' },
  { id: 'type-3', label: 'Current', theme: 'blue' },
  { id: 'type-4', label: 'Savings', theme: 'orange' },
];

export const useFinance = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>(() => {
    const cached = localStorage.getItem('citrus_cache_accounts');
    return cached ? JSON.parse(cached) : [];
  });
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const cached = localStorage.getItem('citrus_cache_transactions');
    return cached ? JSON.parse(cached) : [];
  });
  const [accountTypes, setAccountTypes] = useState<AccountType[]>(() => {
    const cached = localStorage.getItem('citrus_cache_types');
    return cached ? JSON.parse(cached) : [];
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currency, setCurrency] = useState(() => localStorage.getItem('citrus_currency') || 'Rs.');
  const [isLoading, setIsLoading] = useState(() => {
    const cachedAccs = localStorage.getItem('citrus_cache_accounts');
    const cachedGuest = localStorage.getItem(GUEST_DATA_KEY);
    return !cachedAccs && !cachedGuest; // Only show loader if we have NO data at all
  });
  const [isActionLoading, setIsActionLoading] = useState(false);

  const prevUserRef = useRef<string | null>(null);
  const isSyncing = useRef(false);

  // Unified Data Loading Logic
  useEffect(() => {
    // Only show full-page loading if we have absolutely no data to show
    if (accounts.length === 0) {
      setIsLoading(true);
    }

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
            setAccounts(loadedData.accounts?.length > 0 ? loadedData.accounts : INITIAL_ACCOUNTS);
            setTransactions(loadedData.transactions || []);
            setAccountTypes(loadedData.accountTypes?.length > 0 ? loadedData.accountTypes : DEFAULT_TYPES);
          } else {
            setAccounts(INITIAL_ACCOUNTS);
            setAccountTypes(DEFAULT_TYPES);
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

      setAccounts(normalizedAccounts);
      setTransactions(normalizedTransactions);
      setAccountTypes(fetchedTypes);

      // SAVE TO CACHE
      if (user) {
        localStorage.setItem('citrus_cache_accounts', JSON.stringify(normalizedAccounts));
        localStorage.setItem('citrus_cache_transactions', JSON.stringify(normalizedTransactions));
        localStorage.setItem('citrus_cache_types', JSON.stringify(fetchedTypes));
      }
    } catch (error) {
      console.error("Backend fetch failed", error);
      // Fallback to cache if available
      const cachedAccs = localStorage.getItem('citrus_cache_accounts');
      const cachedTxs = localStorage.getItem('citrus_cache_transactions');
      const cachedTypes = localStorage.getItem('citrus_cache_types');

      if (cachedAccs) setAccounts(JSON.parse(cachedAccs));
      if (cachedTxs) setTransactions(JSON.parse(cachedTxs));
      if (cachedTypes) setAccountTypes(JSON.parse(cachedTypes));
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


  // Actions
  const addAccountType = useCallback(async (label: string, theme: AccountType['theme']) => {
    try {
      const optimisticType: AccountType = { id: `temp-type-${Date.now()}`, label, theme };
      setAccountTypes(prev => [...prev, optimisticType]);

      if (user) {
        if (!navigator.onLine) {
          syncService.enqueue('POST', '/finance/account-types', { label, theme });
        } else {
          try {
            const { data } = await api.post('/finance/account-types', { label, theme });
            setAccountTypes(prev => prev.map(t => t.id === optimisticType.id ? { id: data._id, label: data.label, theme: data.theme } : t));
          } catch (error: any) {
            if (error.status === 0) {
              syncService.enqueue('POST', '/finance/account-types', { label, theme });
            } else {
              throw error;
            }
          }
        }
      }
    } catch (error) {
      console.error("Failed to add account type", error);
      if (navigator.onLine) await fetchBackendData();
    }
  }, [user]);

  const deleteAccountType = useCallback(async (id: string) => {
    try {
      if (DEFAULT_TYPES.some(t => t.id === id)) return;

      setAccountTypes(prev => prev.filter(t => t.id !== id));

      if (user) {
        if (!navigator.onLine) {
          syncService.enqueue('DELETE', `/finance/account-types/${id}`);
        } else {
          try {
            await api.delete(`/finance/account-types/${id}`);
          } catch (error: any) {
            if (error.status === 0) {
              syncService.enqueue('DELETE', `/finance/account-types/${id}`);
            } else {
              throw error;
            }
          }
        }
      }
    } catch (error) {
      console.error("Failed to delete account type", error);
      if (navigator.onLine) await fetchBackendData();
    }
  }, [user]);

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const addTransaction = useCallback(async (data: any) => {
    try {
      // Optimistic Update
      const targetAcc = accounts.find(a => a.id === data.accountId);

      const currentBalance = Number(targetAcc?.balance || 0);
      const txAmount = Number(data.amount);

      const balanceAt = Number(data.type === 'income'
        ? currentBalance + txAmount
        : currentBalance - txAmount);

      const optimisticTx: Transaction = {
        id: `temp-${Date.now()}`,
        ...data,
        amount: txAmount,
        date: data.date || new Date().toISOString(),
        balanceAt
      };

      // Update state immediately
      setTransactions(prev => {
        const updated = [optimisticTx, ...prev];
        if (user) localStorage.setItem('citrus_cache_transactions', JSON.stringify(updated));
        return updated;
      });
      if (targetAcc) {
        setAccounts(prev => {
          const updated = prev.map(acc =>
            acc.id === data.accountId ? { ...acc, balance: balanceAt } : acc
          );
          if (user) localStorage.setItem('citrus_cache_accounts', JSON.stringify(updated));
          return updated;
        });
      }

      if (user) {
        const txData = {
          ...data,
          date: data.date || new Date().toISOString()
        };

        if (!navigator.onLine) {
          syncService.enqueue('POST', '/finance/transactions', txData);
        } else {
          try {
            setIsActionLoading(true);
            const [response] = await Promise.all([
              api.post('/finance/transactions', txData),
              delay(600)
            ]);
            const savedTx = { ...response.data, id: response.data._id || response.data.id };
            setTransactions(prev => {
              const updated = prev.map(tx => tx.id === optimisticTx.id ? savedTx : tx);
              localStorage.setItem('citrus_cache_transactions', JSON.stringify(updated));
              return updated;
            });
          } catch (error: any) {
            if (error.status === 0) {
              syncService.enqueue('POST', '/finance/transactions', txData);
            } else {
              throw error;
            }
          } finally {
            setIsActionLoading(false);
          }
        }
      }
    } catch (error: any) {
      console.error('Add transaction failed:', error.message);
      if (navigator.onLine) await fetchBackendData();
    }
  }, [user, accounts]);

  const updateTransaction = useCallback(async (id: string, data: any) => {
    try {
      setTransactions(prev => {
        const oldTx = prev.find(t => t.id === id);
        if (!oldTx) return prev;

        // Apply balance changes optimistically
        setAccounts(prevAccs => {
          let updated = [...prevAccs];
          // Rollback old
          updated = updated.map(acc => {
            if (acc.id === oldTx.accountId) {
              const currentBal = Number(acc.balance);
              const oldAmt = Number(oldTx.amount);
              return {
                ...acc,
                balance: oldTx.type === 'income'
                  ? Number(currentBal - oldAmt)
                  : Number(currentBal + oldAmt)
              };
            }
            return acc;
          });
          // Apply new
          const newAmt = Number(data.amount);
          updated = updated.map(acc => {
            if (acc.id === data.accountId) {
              const currentBal = Number(acc.balance);
              return {
                ...acc,
                balance: data.type === 'income'
                  ? Number(currentBal + newAmt)
                  : Number(currentBal - newAmt)
              };
            }
            return acc;
          });
          return updated;
        });

        return prev.map(t => t.id === id ? { ...t, ...data } : t);
      });

      if (user) {
        if (!navigator.onLine) {
          syncService.enqueue('PUT', `/finance/transactions/${id}`, data);
        } else {
          try {
            setIsActionLoading(true);
            await Promise.all([
              api.put(`/finance/transactions/${id}`, data),
              delay(600)
            ]);
          } catch (error: any) {
            if (error.status === 0) {
              syncService.enqueue('PUT', `/finance/transactions/${id}`, data);
            } else {
              throw error;
            }
          } finally {
            setIsActionLoading(false);
          }
        }
      }
    } catch (error: any) {
      console.error('Update transaction failed:', error.message);
      if (navigator.onLine) await fetchBackendData();
    }
  }, [user]);

  const addAccount = useCallback(async (data: any) => {
    try {
      const optimisticAccount: Account = {
        id: `temp-acc-${Date.now()}`,
        ...data,
        cardNumber: `**** **** **** ${Math.floor(1000 + Math.random() * 9000)}`,
        cardHolder: user?.name ? user.name.toUpperCase() : 'GUEST USER',
        color: '',
      };

      setAccounts(prev => [...prev, optimisticAccount]);

      if (user) {
        if (!navigator.onLine) {
          syncService.enqueue('POST', '/finance/accounts', data);
        } else {
          try {
            setIsActionLoading(true);
            const [{ data: savedAccount }] = await Promise.all([
              api.post('/finance/accounts', data),
              delay(600)
            ]);
            setAccounts(prev => {
              const updated = prev.map(acc => acc.id === optimisticAccount.id ? { ...savedAccount, id: savedAccount._id || savedAccount.id } : acc);
              localStorage.setItem('citrus_cache_accounts', JSON.stringify(updated));
              return updated;
            });
          } catch (error: any) {
            if (error.status === 0) {
              syncService.enqueue('POST', '/finance/accounts', data);
            } else {
              throw error;
            }
          } finally {
            setIsActionLoading(false);
          }
        }
      }
    } catch (error: any) {
      console.error('Add account failed:', error.message);
      if (navigator.onLine) await fetchBackendData();
    }
  }, [user]);

  const updateAccount = useCallback(async (id: string, data: any) => {
    try {
      setAccounts(prev => prev.map(acc => acc.id === id ? { ...acc, ...data } : acc));
      if (user) {
        if (!navigator.onLine) {
          syncService.enqueue('PUT', `/finance/accounts/${id}`, data);
        } else {
          try {
            setIsActionLoading(true);
            await Promise.all([
              api.put(`/finance/accounts/${id}`, data),
              delay(600)
            ]);
          } catch (error: any) {
            if (error.status === 0) {
              syncService.enqueue('PUT', `/finance/accounts/${id}`, data);
            } else {
              throw error;
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Update account failed:', error.message);
      if (navigator.onLine) await fetchBackendData();
    }
  }, [user]);

  const deleteAccount = useCallback(async (id: string) => {
    try {
      setAccounts(prev => {
        const updated = prev.filter(acc => acc.id !== id);
        if (user) localStorage.setItem('citrus_cache_accounts', JSON.stringify(updated));
        return updated;
      });
      setTransactions(prev => {
        const updated = prev.filter(t => t.accountId !== id);
        if (user) localStorage.setItem('citrus_cache_transactions', JSON.stringify(updated));
        return updated;
      });

      if (user) {
        if (!navigator.onLine) {
          syncService.enqueue('DELETE', `/finance/accounts/${id}`);
        } else {
          try {
            setIsActionLoading(true);
            await Promise.all([
              api.delete(`/finance/accounts/${id}`),
              delay(600)
            ]);
          } catch (error: any) {
            if (error.status === 0) {
              syncService.enqueue('DELETE', `/finance/accounts/${id}`);
            } else {
              throw error;
            }
          } finally {
            setIsActionLoading(false);
          }
        }
      }
    } catch (error: any) {
      console.error('Delete account failed:', error.message);
      if (navigator.onLine) await fetchBackendData();
    }
  }, [user]);

  const deleteTransaction = useCallback(async (id: string) => {
    try {
      setTransactions(prev => {
        const transaction = prev.find(t => t.id === id);
        if (!transaction) return prev;

        setAccounts(accounts => {
          const updated = accounts.map(acc => {
            if (acc.id === transaction.accountId) {
              const currentBal = Number(acc.balance);
              const amt = Number(transaction.amount);
              return {
                ...acc,
                balance: transaction.type === 'income'
                  ? Number(currentBal - amt)
                  : Number(currentBal + amt)
              };
            }
            return acc;
          });
          if (user) localStorage.setItem('citrus_cache_accounts', JSON.stringify(updated));
          return updated;
        });

        const updatedTxs = prev.filter(t => t.id !== id);
        if (user) localStorage.setItem('citrus_cache_transactions', JSON.stringify(updatedTxs));
        return updatedTxs;
      });

      if (user) {
        if (!navigator.onLine) {
          syncService.enqueue('DELETE', `/finance/transactions/${id}`);
        } else {
          try {
            await api.delete(`/finance/transactions/${id}`);
          } catch (error: any) {
            if (error.status === 0) {
              syncService.enqueue('DELETE', `/finance/transactions/${id}`);
            } else {
              throw error;
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Delete transaction failed:', error.message);
      if (navigator.onLine) await fetchBackendData();
    }
  }, [user]);

  const bulkDeleteTransactions = useCallback(async (ids: string[]) => {
    try {
      setTransactions(prev => {
        const transactionsToDelete = prev.filter(t => ids.includes(t.id));

        setAccounts(accounts => {
          let updated = [...accounts];
          transactionsToDelete.forEach(transaction => {
            updated = updated.map(acc => {
              if (acc.id === transaction.accountId) {
                const currentBal = Number(acc.balance);
                const amt = Number(transaction.amount);
                return {
                  ...acc,
                  balance: transaction.type === 'income'
                    ? Number(currentBal - amt)
                    : Number(currentBal + amt)
                };
              }
              return acc;
            });
          });
          return updated;
        });

        return prev.filter(t => !ids.includes(t.id));
      });

      if (user) {
        if (!navigator.onLine) {
          syncService.enqueue('DELETE', '/finance/transactions/bulk-delete', { ids });
        } else {
          try {
            await api.delete('/finance/transactions/bulk-delete', { data: { ids } });
          } catch (error: any) {
            if (error.status === 0) {
              syncService.enqueue('DELETE', '/finance/transactions/bulk-delete', { ids });
            } else {
              throw error;
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Bulk delete failed:', error.message);
      if (navigator.onLine) await fetchBackendData();
    }
  }, [user]);

  const deleteAllTransactions = useCallback(async () => {
    try {
      setTransactions(prev => {
        setAccounts(accounts => {
          let updated = [...accounts];
          prev.forEach(transaction => {
            updated = updated.map(acc => {
              if (acc.id === transaction.accountId) {
                const currentBal = Number(acc.balance);
                const amt = Number(transaction.amount);
                return {
                  ...acc,
                  balance: transaction.type === 'income'
                    ? Number(currentBal - amt)
                    : Number(currentBal + amt)
                };
              }
              return acc;
            });
          });
          return updated;
        });
        return [];
      });

      if (user) {
        await api.delete('/finance/transactions/delete-all');
      }
    } catch (error: any) {
      console.error('Delete all failed:', error.message);
      await fetchBackendData();
    }
  }, [user]);

  const transferFunds = useCallback(async (data: { sourceAccountId: string, targetAccountId: string, amount: number, date: string, description?: string }) => {
    try {
      const { sourceAccountId, targetAccountId, amount, date, description } = data;

      const sourceAcc = accounts.find(a => a.id === sourceAccountId);
      const targetAcc = accounts.find(a => a.id === targetAccountId);

      if (!sourceAcc || !targetAcc) throw new Error('Account not found');

      const sourceBal = Number(sourceAcc.balance);
      const targetBal = Number(targetAcc.balance);
      const transferAmt = Number(amount);

      const newSourceBalance = Number(sourceBal - transferAmt);
      const newTargetBalance = Number(targetBal + transferAmt);

      const expenseTx: Transaction = {
        id: `temp-${Date.now()}-1`,
        accountId: sourceAccountId,
        amount: transferAmt,
        type: 'expense',
        category: 'Transfer',
        description: description || `Transfer to ${targetAcc.name}`,
        date: date || new Date().toISOString(),
        balanceAt: newSourceBalance
      };

      const incomeTx: Transaction = {
        id: `temp-${Date.now()}-2`,
        accountId: targetAccountId,
        amount: transferAmt,
        type: 'income',
        category: 'Transfer',
        description: description || `Transfer from ${sourceAcc.name}`,
        date: date || new Date().toISOString(),
        balanceAt: newTargetBalance
      };

      setTransactions(prev => [expenseTx, incomeTx, ...prev]);

      setAccounts(prev => prev.map(acc => {
        if (acc.id === sourceAccountId) return { ...acc, balance: newSourceBalance };
        if (acc.id === targetAccountId) return { ...acc, balance: newTargetBalance };
        return acc;
      }));

      if (user) {
        if (!navigator.onLine) {
          syncService.enqueue('POST', '/finance/transfer', data);
        } else {
          try {
            setIsActionLoading(true);
            await Promise.all([
              api.post('/finance/transfer', data),
              delay(600)
            ]);
            // Transfer successful, ensure cache is updated with current state
            localStorage.setItem('citrus_cache_accounts', JSON.stringify(accounts));
            localStorage.setItem('citrus_cache_transactions', JSON.stringify(transactions));
          } catch (error: any) {
            if (error.status === 0) {
              syncService.enqueue('POST', '/finance/transfer', data);
            } else {
              throw error;
            }
          } finally {
            setIsActionLoading(false);
          }
        }
      }
    } catch (error: any) {
      console.error('Transfer failed:', error.message);
      if (navigator.onLine) await fetchBackendData();
      throw error;
    }
  }, [user, accounts]);

  const resetData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (user) {
        await api.delete('/finance/reset');
        await fetchBackendData();
      } else {
        localStorage.removeItem(GUEST_DATA_KEY); // Use the constant
        setAccounts(INITIAL_ACCOUNTS);
        setTransactions([]);
        setAccountTypes(DEFAULT_TYPES);
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
    isActionLoading,
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
    transferFunds
  };
};

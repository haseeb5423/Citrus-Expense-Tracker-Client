
export type TransactionType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: string; 
  description: string;
  date: string;
  accountId: string;
  balanceAt?: number;
}

export interface AccountType {
  id: string;
  label: string;
  theme: 'blue' | 'emerald' | 'orange' | 'purple' | 'rose' | 'slate' | 'indigo';
}

export interface Account {
  id: string;
  _id?: string; // MongoDB ID
  name: string;
  balance: number;
  cardNumber?: string;
  cardHolder?: string;
  type: string; // Changed from union to string for dynamic types
  color: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar: string;
  joinedAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  type: 'info' | 'success' | 'warning';
}

export interface FinancialStats {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
}

export interface Invoice {
  id: string;
  customerName: string;
  customerEmail: string;
  dueDate: string;
  items: InvoiceItem[];
  total: number;
  status: 'draft' | 'sent' | 'paid';
  createdAt: string;
}

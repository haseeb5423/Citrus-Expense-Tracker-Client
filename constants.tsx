
import React from 'react';
import {
  LayoutDashboard, Wallet, Receipt, PieChart, Settings,
  Home, Briefcase, Utensils, Car, Tv, ShoppingBag, Zap, HeartPulse, TrendingUp, HelpCircle,
  Plane, Gift, Coffee, Gamepad, Smartphone
} from 'lucide-react';
import { Category, Account } from './types';

export const COLORS = {
  primary: '#f97316',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
};

export const INITIAL_ACCOUNTS: Account[] = [
  {
    id: 'acc-1',
    name: 'Family Vault',
    balance: 0,
    cardNumber: '**** **** **** 1001',
    cardHolder: 'CITRUS',
    type: 'Family',
    color: 'indigo',
  },
  {
    id: 'acc-2',
    name: 'Salary Account',
    balance: 0,
    cardNumber: '**** **** **** 2002',
    cardHolder: 'CITRUS',
    type: 'Salary',
    color: 'emerald',
  },
  {
    id: 'acc-3',
    name: 'Current Account',
    balance: 0,
    cardNumber: '**** **** **** 3003',
    cardHolder: 'CITRUS',
    type: 'Current',
    color: 'blue',
  },
  {
    id: 'acc-4',
    name: 'Savings Goal',
    balance: 0,
    cardNumber: '**** **** **** 4004',
    cardHolder: 'CITRUS',
    type: 'Savings',
    color: 'orange',
  }
];

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Housing', color: '#f97316', icon: 'Home' },
  { id: 'cat-2', name: 'Salary', color: '#10b981', icon: 'Briefcase' },
  { id: 'cat-3', name: 'Food', color: '#f59e0b', icon: 'Utensils' },
  { id: 'cat-4', name: 'Transport', color: '#3b82f6', icon: 'Car' },
  { id: 'cat-5', name: 'Entertainment', color: '#8b5cf6', icon: 'Tv' },
  { id: 'cat-6', name: 'Shopping', color: '#ec4899', icon: 'ShoppingBag' },
  { id: 'cat-7', name: 'Utilities', color: '#64748b', icon: 'Zap' },
  { id: 'cat-8', name: 'Health', color: '#ef4444', icon: 'HeartPulse' },
  { id: 'cat-9', name: 'Investment', color: '#10b981', icon: 'TrendingUp' },
  { id: 'cat-10', name: 'Other', color: '#94a3b8', icon: 'HelpCircle' }
];

export const AVAILABLE_ICONS = [
  'Home', 'Briefcase', 'Utensils', 'Car', 'Tv', 'ShoppingBag', 'Zap', 'HeartPulse',
  'TrendingUp', 'HelpCircle', 'Plane', 'Gift', 'Coffee', 'Gamepad', 'Smartphone'
];

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard size={20} /> },
  { id: 'accounts', label: 'Vaults', icon: <Wallet size={20} /> },
  { id: 'transactions', label: 'History', icon: <Receipt size={20} /> },
  { id: 'reports', label: 'Analytics', icon: <PieChart size={20} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
];


import React, { useState } from 'react';
import {
  Globe, Moon, Sun, Shield, ChevronRight, Plus,
  Trash2, Layers, Palette, AlertTriangle, X
} from 'lucide-react';
import { AccountType } from '../../../types';

interface Props {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  currency: string;
  onCurrencyChange: (currency: string) => void;
  accountTypes: AccountType[];
  onAddType: (label: string, theme: AccountType['theme']) => void;
  onDeleteType: (id: string) => void;
  onResetData: () => void;
}

const CURRENCIES = [
  { label: 'Pakistani Rupee', symbol: 'Rs.' },
  { label: 'US Dollar', symbol: '$' },
  { label: 'Euro', symbol: '€' },
  { label: 'British Pound', symbol: '£' },
  { label: 'Japanese Yen', symbol: '¥' },
];

const THEMES: AccountType['theme'][] = ['blue', 'emerald', 'orange', 'purple', 'rose', 'slate'];

export const SettingsView: React.FC<Props> = ({
  isDarkMode, onToggleTheme, currency, onCurrencyChange,
  accountTypes, onAddType, onDeleteType, onResetData
}) => {
  const [newTypeLabel, setNewTypeLabel] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<AccountType['theme']>('blue');
  const [showResetModal, setShowResetModal] = useState(false);
  const [isAddingType, setIsAddingType] = useState(false);
  const [deletingTypeId, setDeletingTypeId] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!newTypeLabel.trim()) return;
    setIsAddingType(true);
    await onAddType(newTypeLabel, selectedTheme);
    setIsAddingType(false);
    setNewTypeLabel('');
  };

  const handleDeleteType = async (id: string) => {
    setDeletingTypeId(id);
    await onDeleteType(id);
    setDeletingTypeId(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 fade-in pb-20">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-4xl font-bold tracking-tighter mb-2 uppercase">Settings</h2>
          <p className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-[0.2em]">Configure your Citrus experience</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Preference Section */}
        <section className="glass rounded-[3rem] border border-white/10 overflow-hidden">
          <div className="px-8 py-6 border-b border-white/10 bg-white/5">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">Preferences</h3>
          </div>

          <div className="divide-y divide-white/5">
            <div className="px-8 py-8 flex flex-col md:flex-row md:items-center justify-between gap-6 group">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20 shadow-lg">
                  <Globe size={22} />
                </div>
                <div>
                  <h4 className="text-lg font-bold">Base Currency</h4>
                  <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest">Universal pricing symbol</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <select
                  value={currency}
                  onChange={(e) => onCurrencyChange(e.target.value)}
                  className="bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-2xl px-6 py-3.5 text-xs font-bold uppercase tracking-widest outline-none focus:border-[var(--action-primary)] transition-all cursor-pointer shadow-inner appearance-none min-w-[180px] text-center"
                >
                  {CURRENCIES.map(c => (
                    <option key={c.symbol} value={c.symbol}>{c.label} ({c.symbol})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="px-8 py-8 flex flex-col md:flex-row md:items-center justify-between gap-6 group">
              <div className="flex items-center gap-5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-lg transition-all ${isDarkMode ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>
                  {isDarkMode ? <Sun size={22} /> : <Moon size={22} />}
                </div>
                <div>
                  <h4 className="text-lg font-bold">Visual Spectrum</h4>
                  <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest">Toggle interface atmosphere</p>
                </div>
              </div>

              <button
                onClick={onToggleTheme}
                className={`relative w-20 h-10 rounded-full transition-all duration-500 flex items-center px-1.5 ${isDarkMode ? 'bg-orange-500' : 'bg-slate-700 shadow-inner'}`}
              >
                <div className={`w-7 h-7 bg-white rounded-full shadow-xl transition-all duration-500 transform ${isDarkMode ? 'translate-x-10' : 'translate-x-0'}`}></div>
              </button>
            </div>
          </div>
        </section>

        {/* Dynamic Type Section */}
        <section className="glass rounded-[3rem] border border-white/10 overflow-hidden">
          <div className="px-8 py-6 border-b border-white/10 bg-white/5">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">Type Architecture</h3>
          </div>
          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                  <Layers size={14} className="text-[var(--action-primary)]" /> Managed Types
                </h4>
                <div className="space-y-2 max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
                  {accountTypes.map((type) => (
                    <div key={type.id} className="flex items-center justify-between p-4 bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-default)] group hover:border-[var(--action-primary)] transition-all">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full bg-${type.theme}-500 shadow-lg shadow-${type.theme}-500/20`}></div>
                        <span className="text-xs font-bold uppercase tracking-tighter">{type.label}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteType(type.id)}
                        disabled={deletingTypeId === type.id}
                        className="p-2 text-red-500/40 hover:text-red-500 transition-colors disabled:opacity-50"
                      >
                        {deletingTypeId === type.id ? (
                          <div className="w-3.5 h-3.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>
                    </div>
                  ))}
                  {accountTypes.length === 0 && (
                    <p className="text-center py-6 text-[10px] font-bold text-[var(--text-muted)] uppercase italic">No custom types defined</p>
                  )}
                </div>
              </div>

              <div className="space-y-6 bg-[var(--bg-primary)]/40 p-6 rounded-[2rem] border border-[var(--border-default)]">
                <h4 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                  <Plus size={14} className="text-emerald-500" /> Construct New Type
                </h4>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Label Name</label>
                    <input
                      value={newTypeLabel}
                      onChange={(e) => setNewTypeLabel(e.target.value)}
                      placeholder="e.g., Retirement"
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-[var(--action-primary)]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Visual Theme</label>
                    <div className="flex flex-wrap gap-2">
                      {THEMES.map(theme => (
                        <button
                          key={theme}
                          onClick={() => setSelectedTheme(theme)}
                          className={`w-8 h-8 rounded-lg transition-all border-2 ${selectedTheme === theme ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-60'
                            } bg-${theme}-500`}
                        />
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={handleAdd}
                    disabled={isAddingType || !newTypeLabel.trim()}
                    className="w-full py-3.5 rounded-xl bg-[var(--action-primary)] text-white text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-2"
                  >
                    {isAddingType ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creating...
                      </>
                    ) : (
                      'Initialize Type'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Account Section */}
        <section className="glass rounded-[3rem] border border-white/10 overflow-hidden opacity-60">
          <div className="px-8 py-6 border-b border-white/10 bg-white/5">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">Vault Security</h3>
          </div>
          <div className="p-8 space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 cursor-not-allowed transition-all">
              <div className="flex items-center gap-4">
                <Shield size={18} className="text-emerald-500" />
                <span className="text-sm font-bold">Biometric Authentication</span>
              </div>
              <ChevronRight size={16} />
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="glass rounded-[3rem] border border-red-500/20 overflow-hidden relative">
          <div className="absolute inset-0 bg-red-500/5 pointer-events-none"></div>
          <div className="px-8 py-6 border-b border-red-500/10 bg-red-500/10">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-red-500">Danger Zone</h3>
          </div>
          <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="text-lg font-bold text-[var(--text-primary)]">Reset Application</h4>
              <p className="text-xs font-semibold text-[var(--text-muted)] mt-1">
                Permanently delete all data and reset to fresh state. This action cannot be undone.
              </p>
            </div>
            <button
              onClick={() => setShowResetModal(true)}
              className="px-6 py-3 rounded-2xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 hover:border-red-500 transition-all font-bold text-xs uppercase tracking-widest flex items-center gap-2"
            >
              <Trash2 size={16} />
              Erase All Data
            </button>
          </div>
        </section>

        {/* Reset Confirmation Modal */}
        {showResetModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center shrink-0">
                  <AlertTriangle className="text-red-500" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[var(--text-primary)]">Factory Reset</h3>
                  <p className="text-xs font-bold text-red-500 uppercase tracking-widest mt-1">Irreversible Action</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  You are about to securely erase all transactions, accounts, and custom settings. This will return the application to its default state.
                </p>
                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 flex items-start gap-3">
                  <Shield size={16} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs font-semibold text-red-500/80">
                    All local and synced data will be permanently destroyed.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowResetModal(false)}
                  className="py-3 px-4 rounded-xl font-bold text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onResetData();
                    setShowResetModal(false);
                  }}
                  className="py-3 px-4 rounded-xl font-bold text-sm bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} />
                  Confirm Reset
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="text-center pt-8">
          <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.4em]">Citrus Expense Tracker v2.5.0 • Dynamic Core Enabled</p>
        </div>
      </div>
    </div>
  );
};

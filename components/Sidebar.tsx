
import React from 'react';
import { NAV_ITEMS } from '../constants';
import { Citrus, X, LogOut, Sun, Moon } from 'lucide-react';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isOpen?: boolean; // Mobile state
  setIsOpen?: (open: boolean) => void;
  user?: any;
  onLogout?: () => void;
  onLoginClick?: () => void;
}

export const Sidebar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  isDarkMode,
  toggleDarkMode,
  isCollapsed,
  setIsCollapsed,
  isOpen,
  setIsOpen,
  user,
  onLogout,
  onLoginClick
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen?.(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out bg-[var(--bg-secondary)] border-r border-[var(--border-default)] flex flex-col p-6 pb-10
          ${isCollapsed ? 'w-24' : 'w-72'} 
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} mb-10 shrink-0`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--action-primary)] flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Citrus className="text-white" size={24} />
            </div>
            {!isCollapsed && <h1 className="text-2xl font-black tracking-tighter text-[var(--text-primary)]">Citrus</h1>}
          </div>
          <button className="lg:hidden p-2 text-[var(--text-secondary)]" onClick={() => setIsOpen?.(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-2 mb-4">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsOpen?.(false);
              }}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'px-4'} py-3.5 rounded-2xl transition-all group relative ${activeTab === item.id
                ? 'bg-[var(--action-primary)] text-white shadow-xl shadow-orange-500/10'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-primary)]'
                }`}
            >
              <span className={activeTab === item.id ? 'text-white' : 'text-[var(--text-muted)] group-hover:text-[var(--action-primary)]'}>
                {item.icon}
              </span>
              {!isCollapsed && (
                <span className="font-bold text-sm ml-4 whitespace-nowrap">{item.label}</span>
              )}
              {activeTab === item.id && !isCollapsed && (
                <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="mt-auto pt-6 border-t border-[var(--border-default)] space-y-4 shrink-0">
          <button
            onClick={toggleDarkMode}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} p-3 rounded-2xl hover:bg-[var(--bg-primary)] transition-all`}
          >
            {!isCollapsed && <span className="text-xs font-bold text-[var(--text-secondary)]">Theme</span>}
            {isDarkMode ? <Sun size={18} className="text-orange-400" /> : <Moon size={18} className="text-slate-500" />}
          </button>

          {user ? (
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 p-3'} rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-default)] shadow-sm overflow-hidden`}>
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name || 'Felix'}`}
                className="w-10 h-10 rounded-xl border-2 border-white shadow-sm shrink-0"
                alt="User"
              />
              {!isCollapsed && (
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs font-black truncate text-[var(--text-primary)]">{user.name}</span>
                  <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-tighter">Verified User</span>
                </div>
              )}
              {!isCollapsed && (
                <button
                  onClick={onLogout}
                  className="text-[var(--text-muted)] hover:text-red-500 transition-colors p-1"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'px-6'} py-4 bg-[var(--action-primary)] text-white rounded-2xl font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-orange-500/20`}
            >
              <LogOut size={18} className="rotate-180" />
              {!isCollapsed && <span className="text-xs ml-3">Sign In</span>}
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

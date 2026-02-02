
import React from 'react';
import { NAV_ITEMS } from '../../constants';
import { Citrus, X, LogOut, Sun, Moon, Zap, User as UserIcon } from 'lucide-react';
import { UserProfile } from '../../types';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
  user: UserProfile | null;
  onLogout: () => void;
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
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-md"
          onClick={() => setIsOpen?.(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 transition-all duration-300 ease-out glass border-r border-[var(--border-default)] flex flex-col p-6 pb-10
          ${isCollapsed ? 'w-24' : 'w-72'} 
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          will-change-transform
        `}
      >
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} mb-12 shrink-0`}>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-[1.25rem] bg-gradient-to-br from-[#f97316] to-[#fbbf24] flex items-center justify-center shadow-[0_5px_15px_rgba(249,115,22,0.4)] relative">
              <Citrus className="text-white" size={24} />
              <div className={`absolute -top-1 -right-1 w-3 h-3 ${user ? 'bg-[#10b981]' : 'bg-slate-400'} rounded-full border-2 border-white animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]`}></div>
            </div>
            {!isCollapsed && <h1 className="text-2xl font-bold tracking-tighter text-[var(--text-primary)]">Citrus</h1>}
          </div>
          <button className="lg:hidden p-2 text-[var(--text-secondary)]" onClick={() => setIsOpen?.(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-2 mb-4">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsOpen?.(false);
              }}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'px-5'} py-4 rounded-[1.5rem] transition-all group relative border ${activeTab === item.id
                ? 'bg-gradient-to-r from-[var(--action-primary)] to-[#fbbf24] text-white border-transparent shadow-[0_10px_20px_rgba(249,115,22,0.2)]'
                : 'text-[var(--text-secondary)] hover:bg-[var(--action-soft)] border-transparent hover:border-[var(--action-primary)]/20'
                }`}
            >
              <span className={activeTab === item.id ? 'text-white drop-shadow-md' : 'text-[var(--text-muted)] group-hover:text-[var(--action-primary)] transition-colors'}>
                {item.icon}
              </span>
              {!isCollapsed && (
                <span className="font-semibold text-sm ml-4 whitespace-nowrap tracking-tight">{item.label}</span>
              )}
              {activeTab === item.id && !isCollapsed && (
                <div className="absolute right-5 w-2 h-2 rounded-full bg-white shadow-[0_0_10px_white] animate-pulse" />
              )}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-[var(--border-default)] space-y-4 shrink-0">
          <div
            onClick={!user ? onLoginClick : undefined}
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 p-3'} rounded-[1.75rem] glass-glow bg-white/10 border border-white/20 shadow-xl overflow-hidden cursor-pointer hover:bg-white/20 transition-all`}
          >
            <div className="relative shrink-0">
              {user ? (
                <img
                  src={user.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"}
                  className="w-10 h-10 rounded-2xl border-2 border-[var(--action-primary)]/50 shadow-sm"
                  alt="User"
                />
              ) : (
                <div className="w-10 h-10 rounded-2xl bg-[var(--bg-primary)] flex items-center justify-center text-[var(--text-muted)] border-2 border-dashed border-[var(--border-default)]">
                  <UserIcon size={20} />
                </div>
              )}
              <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 ${user ? 'bg-[#10b981]' : 'bg-slate-400'} rounded-full border-2 border-white shadow-sm`}></div>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-bold truncate text-[var(--text-primary)]">
                  {user ? user.name : 'Guest User'}
                </span>
                <span className={`text-[9px] font-bold uppercase tracking-tighter w-fit px-1.5 rounded ${user ? 'text-[var(--action-primary)] bg-[var(--action-soft)]' : 'text-slate-500 bg-slate-100'}`}>
                  {user ? 'Citrus Elite' : 'Local Mode'}
                </span>
              </div>
            )}
            {!isCollapsed && user && (
              <button
                onClick={(e) => { e.stopPropagation(); onLogout(); }}
                className="text-[var(--text-muted)] hover:text-[var(--error)] transition-colors p-2 hover:bg-rose-50 rounded-xl"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
          {!user && !isCollapsed && (
            <button
              onClick={onLoginClick}
              className="w-full py-2.5 text-[10px] font-bold uppercase tracking-widest text-[var(--action-primary)] hover:bg-[var(--action-soft)] rounded-xl border border-[var(--action-primary)]/20 transition-all"
            >
              Sign In to Sync
            </button>
          )}
        </div>
      </aside>
    </>
  );
};


import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, Plus, ArrowLeft, Check, Clock, Sun, Moon, 
  User as UserIcon, LogOut, Settings, User 
} from 'lucide-react';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Notification, UserProfile } from '../../types';
import { formatDate } from '../../utils/formatters';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onMobileMenuOpen: () => void;
  onAddClick: () => void;
  onBack: () => void;
  user: UserProfile | null;
  onLogout: () => void;
  onLoginClick?: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isLoading?: boolean;
}

export const TopHeader: React.FC<Props> = React.memo(({
  activeTab,
  setActiveTab,
  onMobileMenuOpen,
  onAddClick,
  onBack,
  user,
  onLogout,
  onLoginClick,
  isDarkMode,
  toggleDarkMode,
  isLoading
}) => {
  const isDashboard = activeTab === 'dashboard';
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-20 glass flex items-center justify-between px-8 z-30 shrink-0 relative">
      <div className="flex items-center gap-2 sm:gap-4">
        {!isDashboard ? (
          <button
            onClick={onBack}
            className="p-2 hover:bg-[var(--bg-primary)] rounded-xl text-[var(--action-primary)] transition-all flex items-center gap-2 group"
            title="Back to Dashboard"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-widest">Dashboard</span>
          </button>
        ) : (
          <button
            className="lg:hidden p-2 hover:bg-[var(--bg-primary)] rounded-xl"
            onClick={onMobileMenuOpen}
          >
            <Menu size={20} />
          </button>
        )}

        <div className="w-px h-6 bg-[var(--border-default)] mx-1 hidden sm:block" />

        <h2 className="text-lg sm:text-xl font-bold tracking-tight capitalize whitespace-nowrap overflow-hidden text-ellipsis">
          {activeTab.replace('-', ' ')}
        </h2>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={toggleDarkMode}
          className="p-2.5 hover:bg-[var(--bg-primary)] rounded-xl text-[var(--text-secondary)] hover:text-[var(--action-primary)] transition-all group"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? (
            <Sun size={20} className="group-hover:rotate-45 transition-transform" />
          ) : (
            <Moon size={20} className="group-hover:-rotate-12 transition-transform" />
          )}
        </button>

        <button
          onClick={onAddClick}
          className="btn-primary px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2"
        >
          <Plus size={18} />
          <span className="hidden md:inline">Add New</span>
        </button>

        {isLoading ? (
          <div className="flex items-center justify-center w-8">
            <LoadingSpinner size={18} />
          </div>
        ) : (
          <div className="w-px h-6 bg-[var(--border-default)] mx-1" />
        )}

        <div className="relative" ref={profileMenuRef}>
          <button
            onClick={() => user ? setShowProfileMenu(!showProfileMenu) : onLoginClick?.()}
            className={`flex items-center gap-2 p-1.5 rounded-2xl transition-all ${showProfileMenu ? 'bg-[var(--action-soft)]' : 'hover:bg-[var(--bg-primary)]'}`}
          >
            <div className="relative">
              {user ? (
                <img
                  src={user.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"}
                  className="w-9 h-9 rounded-xl border-2 border-[var(--action-primary)]/50"
                  alt={user.name}
                />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-[var(--bg-primary)] flex items-center justify-center text-[var(--text-muted)] border-2 border-dashed border-[var(--border-default)]">
                  <UserIcon size={18} />
                </div>
              )}
              <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${user ? 'bg-[#10b981]' : 'bg-slate-400'} rounded-full border-2 border-white shadow-sm`}></div>
            </div>
          </button>

          {showProfileMenu && user && (
            <div className="absolute right-0 mt-4 w-56 bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-[2rem] shadow-2xl overflow-hidden z-[100] animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-300">
              <div className="p-5 border-b border-[var(--border-default)] bg-white/5">
                <p className="text-xs font-bold truncate text-[var(--text-primary)]">{user.name}</p>
                <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-0.5">Citrus Elite</p>
              </div>
              <div className="p-2">
                <button
                  onClick={() => {
                    setActiveTab('profile');
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[var(--action-soft)] text-[var(--text-secondary)] hover:text-[var(--action-primary)] font-bold text-[10px] uppercase tracking-widest transition-all"
                >
                  <User size={16} />
                  My Profile
                </button>
                <button
                  onClick={() => {
                    setActiveTab('settings');
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[var(--action-soft)] text-[var(--text-secondary)] hover:text-[var(--action-primary)] font-bold text-[10px] uppercase tracking-widest transition-all"
                >
                  <Settings size={16} />
                  Settings
                </button>
                <div className="h-px bg-[var(--border-default)] my-2 mx-2" />
                <button
                  onClick={() => {
                    onLogout();
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-rose-50 text-[var(--text-muted)] hover:text-rose-500 font-bold text-[10px] uppercase tracking-widest transition-all"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
});

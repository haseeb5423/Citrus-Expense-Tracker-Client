
import React from 'react';
import { X, ShieldCheck, Wallet, Landmark, CreditCard, Zap, Layers } from 'lucide-react';
import { Account, AccountType } from '../../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  account?: Account | null;
  accountTypes: AccountType[];
}

export const AddVaultModal: React.FC<Props> = ({ isOpen, onClose, onSubmit, account, accountTypes }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xl z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-[var(--bg-primary)] w-full max-w-md rounded-[3rem] overflow-hidden shadow-[0_40px_80px_-15px_rgba(0,0,0,0.6)] animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 border border-white/10 glass-glow">
        
        <div className="px-10 pt-10 pb-6 flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold uppercase tracking-tighter leading-none mb-1">
              {account ? 'Update Vault' : 'New Account'}
            </h3>
            <p className="text-[9px] font-semibold text-[var(--text-muted)] uppercase tracking-[0.3em]">
              {account ? 'Modify vault settings' : 'Enter details below'}
            </p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-[var(--bg-primary)] hover:bg-red-50 hover:text-red-500 rounded-xl transition-all border border-[var(--border-default)] shadow-sm">
            <X size={18} />
          </button>
        </div>

        <div className="px-10 pb-10">
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-5">
               <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-[var(--text-secondary)] ml-3">
                    <Wallet size={11} /> Name
                  </label>
                  <input 
                    name="name" required placeholder="e.g., My Savings" 
                    defaultValue={account?.name}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-xl px-6 py-4 outline-none font-bold text-xs focus:border-[var(--action-primary)] transition-all shadow-sm" 
                  />
               </div>

               <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-[var(--text-secondary)] ml-3">
                    <ShieldCheck size={11} /> Starting Balance
                  </label>
                  <input 
                    name="balance" type="number" step="0.01" required placeholder="0.00" 
                    defaultValue={account?.balance}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-xl px-6 py-4 outline-none font-bold text-xs focus:border-[var(--action-primary)] transition-all shadow-sm" 
                  />
               </div>

               <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-[var(--text-secondary)] ml-3">
                    <Layers size={11} /> Account Type
                  </label>
                  <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto no-scrollbar p-1">
                    {accountTypes.map((type) => (
                      <label key={type.id} className="cursor-pointer group">
                        <input 
                          type="radio" 
                          name="type" 
                          value={type.label} 
                          className="hidden peer" 
                          defaultChecked={account?.type === type.label || (!account && type.label === 'Debit')} 
                        />
                        <div className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-primary)] peer-checked:bg-[var(--action-primary)] peer-checked:text-white transition-all`}>
                          <span className="text-[10px] font-bold uppercase tracking-tighter truncate w-full text-center">{type.label}</span>
                        </div>
                      </label>
                    ))}
                    {accountTypes.length === 0 && (
                      <p className="col-span-2 text-center text-[8px] font-bold text-[var(--text-muted)] uppercase py-4">No types defined in settings</p>
                    )}
                  </div>
               </div>
            </div>

            <button 
              type="submit" 
              className="w-full group bg-gradient-to-r from-[var(--action-primary)] to-[#fbbf24] text-white py-5 rounded-2xl font-bold uppercase tracking-[0.15em] shadow-xl shadow-orange-500/20 hover:shadow-orange-500/40 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4"
            >
              {account ? 'Confirm Changes' : 'Add Account'}
              <ShieldCheck size={18} className="group-hover:rotate-12 transition-transform" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

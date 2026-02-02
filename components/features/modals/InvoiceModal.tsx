import React, { useState } from 'react';
import { X, Plus, Trash2, FileText, User, Mail, Calendar, DollarSign } from 'lucide-react';
import { InvoiceItem } from '../../../types';
import { formatCurrency } from '../../../utils/formatters';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    customerName: string;
    customerEmail: string;
    dueDate: string;
    items: InvoiceItem[];
    status: 'sent';
  }) => void;
}

export const InvoiceModal: React.FC<Props> = ({ isOpen, onClose, onSubmit }) => {
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([{ description: '', quantity: 1, price: 0 }]);

  if (!isOpen) return null;

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, price: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerEmail || !dueDate || items.some(i => !i.description || i.price <= 0)) return;
    onSubmit({ customerName, customerEmail, dueDate, items, status: 'sent' });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xl z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-[var(--bg-secondary)] w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 max-h-[95vh] flex flex-col border border-white/10 glass-glow">
        
        <div className="px-10 pt-10 pb-6 flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-2xl font-bold uppercase tracking-tighter leading-none mb-1">Generate Invoice</h3>
            <p className="text-[9px] font-semibold text-[var(--text-muted)] uppercase tracking-[0.3em]">Create a professional bill</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-[var(--bg-primary)] hover:bg-red-50 hover:text-red-500 rounded-xl transition-all border border-[var(--border-default)] shadow-sm">
            <X size={18} />
          </button>
        </div>

        <div className="px-10 pb-10 overflow-y-auto no-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-[var(--text-secondary)] ml-3">
                  <User size={11} /> Customer Name
                </label>
                <input 
                  value={customerName} onChange={e => setCustomerName(e.target.value)} required
                  placeholder="John Doe" 
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-xl px-6 py-4 outline-none font-bold text-xs focus:border-[var(--action-primary)] transition-all shadow-sm" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-[var(--text-secondary)] ml-3">
                  <Mail size={11} /> Email Address
                </label>
                <input 
                  type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} required
                  placeholder="john@example.com" 
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-xl px-6 py-4 outline-none font-bold text-xs focus:border-[var(--action-primary)] transition-all shadow-sm" 
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-[var(--text-secondary)] ml-3">
                  <Calendar size={11} /> Due Date
                </label>
                <input 
                  type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-xl px-6 py-4 outline-none font-bold text-xs focus:border-[var(--action-primary)] transition-all shadow-sm" 
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center px-3">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Invoice Items</h4>
                <button type="button" onClick={addItem} className="text-[var(--action-primary)] flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest hover:bg-[var(--action-soft)] px-3 py-1.5 rounded-lg transition-all">
                  <Plus size={14} /> Add Line
                </button>
              </div>

              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="flex gap-3 items-end group animate-in slide-in-from-left-4 duration-300">
                    <div className="flex-[3] space-y-1">
                      <input 
                        placeholder="Description" value={item.description}
                        onChange={e => updateItem(index, 'description', e.target.value)}
                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-xl px-4 py-3 outline-none font-bold text-[11px] focus:border-[var(--action-primary)] transition-all"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <input 
                        type="number" placeholder="Qty" value={item.quantity} min="1"
                        onChange={e => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-xl px-3 py-3 outline-none font-bold text-[11px] focus:border-[var(--action-primary)] transition-all text-center"
                      />
                    </div>
                    <div className="flex-[1.5] space-y-1">
                      <input 
                        type="number" placeholder="Price" value={item.price} min="0"
                        onChange={e => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-xl px-3 py-3 outline-none font-bold text-[11px] focus:border-[var(--action-primary)] transition-all"
                      />
                    </div>
                    <button type="button" onClick={() => removeItem(index)} className="p-3 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 rounded-xl transition-all mb-0.5">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8 mt-4 border-t border-[var(--border-default)] flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">Total Billable</p>
                <h2 className="text-3xl font-bold font-poppins tracking-tighter text-[var(--action-primary)]">
                  {formatCurrency(total)}
                </h2>
              </div>
              <button 
                type="submit" 
                className="btn-primary px-10 py-4 rounded-2xl font-bold uppercase tracking-[0.15em] text-xs flex items-center gap-3 shadow-xl shadow-orange-500/20"
              >
                <FileText size={18} /> Generate & Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
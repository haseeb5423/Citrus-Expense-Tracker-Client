
import React, { useMemo } from 'react';
import { Transaction, Account } from '../../../types';
import { formatCurrency } from '../../../utils/formatters';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend 
} from 'recharts';
import { Target, TrendingDown, PieChart as PieIcon, BarChart3, ArrowRight } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  accounts: Account[];
  currencySymbol: string;
}

const COLORS = ['#f97316', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#64748b', '#ef4444'];

export const AnalyticsView: React.FC<Props> = ({ transactions, accounts, currencySymbol }) => {
  const categoryData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const totals: Record<string, number> = {};
    expenses.forEach(t => {
      totals[t.category] = (totals[t.category] || 0) + t.amount;
    });

    return Object.entries(totals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const monthlyComparison = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const getStats = (m: number, y: number) => {
      const filtered = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === m && d.getFullYear() === y;
      });
      const income = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      return { income, expense };
    };

    const current = getStats(currentMonth, currentYear);
    const previous = getStats(lastMonth, lastMonthYear);

    return [
      { name: 'Last Month', Income: previous.income, Expenses: previous.expense },
      { name: 'This Month', Income: current.income, Expenses: current.expense },
    ];
  }, [transactions]);

  const stats = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const totalExpense = expenses.reduce((s, t) => s + t.amount, 0);
    const avgSpend = expenses.length > 0 ? totalExpense / 30 : 0; 
    const topCategory = categoryData[0]?.name || 'N/A';
    
    return { avgSpend, topCategory, totalExpense };
  }, [categoryData, transactions]);

  return (
    <div className="max-w-7xl mx-auto space-y-10 fade-in pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tighter mb-2 uppercase">Analytics</h2>
          <p className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-[0.2em]">Spending Insights & Trends</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass p-8 rounded-[2.5rem] border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-[var(--action-soft)] text-[var(--action-primary)] rounded-xl">
              <TrendingDown size={20} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Avg. Daily Outflow</span>
          </div>
          <p className="text-3xl font-bold tabular-nums tracking-tighter">{formatCurrency(stats.avgSpend, currencySymbol)}</p>
          <div className="mt-4 flex items-center gap-1 text-[var(--text-muted)] text-[10px] font-bold uppercase">
             Capital flow <ArrowRight size={12} /> Optimization suggested
          </div>
        </div>

        <div className="glass p-8 rounded-[2.5rem] border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
              <Target size={20} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Top Expense Category</span>
          </div>
          <p className="text-3xl font-bold tracking-tighter uppercase">{stats.topCategory}</p>
          <div className="mt-4 h-1.5 w-full bg-[var(--bg-primary)] rounded-full overflow-hidden">
             <div className="h-full bg-emerald-500 w-[65%]"></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="glass p-8 rounded-[3rem] border border-white/10 flex flex-col">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-[var(--bg-primary)] flex items-center justify-center border border-[var(--border-default)]">
              <PieIcon className="text-[var(--action-primary)]" size={20} />
            </div>
            <h3 className="text-lg font-bold tracking-tight">Spending Breakdown</h3>
          </div>
          
          <div className="flex-1 flex flex-col md:flex-row items-center gap-10">
            <div className="h-64 w-full md:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '20px', 
                      background: 'var(--bg-secondary)', 
                      backdropFilter: 'blur(10px)',
                      border: '1px solid var(--border-default)',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-4 w-full">
               {categoryData.slice(0, 5).map((cat, i) => (
                 <div key={cat.name} className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                       <span className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                          {cat.name}
                       </span>
                       <span className="text-[var(--text-primary)]">{stats.totalExpense > 0 ? Math.round((cat.value / stats.totalExpense) * 100) : 0}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-[var(--bg-primary)] rounded-full overflow-hidden">
                       <div 
                         className="h-full transition-all duration-1000" 
                         style={{ 
                           backgroundColor: COLORS[i % COLORS.length], 
                           width: `${stats.totalExpense > 0 ? (cat.value / stats.totalExpense) * 100 : 0}%` 
                         }}
                       ></div>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </div>

        <div className="glass p-8 rounded-[3rem] border border-white/10">
          <div className="flex items-center gap-3 mb-10">
             <div className="w-10 h-10 rounded-xl bg-[var(--bg-primary)] flex items-center justify-center border border-[var(--border-default)]">
               <BarChart3 className="text-emerald-500" size={20} />
             </div>
             <h3 className="text-lg font-bold tracking-tight">Performance Trend</h3>
          </div>
          
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyComparison} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 'bold', fill: 'var(--text-muted)' }} 
                />
                <YAxis hide />
                <Tooltip 
                   cursor={{ fill: 'var(--bg-primary)', opacity: 0.4 }}
                   contentStyle={{ 
                    borderRadius: '20px', 
                    background: 'var(--bg-secondary)', 
                    backdropFilter: 'blur(10px)',
                    border: '1px solid var(--border-default)',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                <Bar dataKey="Income" fill="#10b981" radius={[10, 10, 0, 0]} barSize={40} />
                <Bar dataKey="Expenses" fill="#f97316" radius={[10, 10, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

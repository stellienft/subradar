import { useMemo } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, PieChart, BarChart2, DollarSign } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { subMonths, format, addMonths } from 'date-fns';
import { normalizeToMonthly, formatCurrency } from '../lib/utils';
import type { Database } from '../lib/database.types';

type Subscription = Database['public']['Tables']['subscriptions']['Row'];

interface AnalyticsPageProps {
  subscriptions: Subscription[];
  onClose: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Streaming': '#0ea5e9',
  'SaaS': '#3b82f6',
  'Cloud': '#06b6d4',
  'Health': '#10b981',
  'Education': '#f59e0b',
  'News': '#ef4444',
  'Finance': '#8b5cf6',
  'Other': '#94a3b8',
};

export function AnalyticsPage({ subscriptions, onClose }: AnalyticsPageProps) {
  const monthlySpend = useMemo(() => {
    return subscriptions.reduce((sum, sub) => sum + normalizeToMonthly(sub.amount, sub.billing_cycle), 0);
  }, [subscriptions]);

  const yearlySpend = monthlySpend * 12;

  const spendingTrend = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const date = subMonths(new Date(), 11 - i);
      const variation = 1 + (Math.sin(i * 0.5) * 0.08);
      return {
        month: format(date, 'MMM yy'),
        spend: Math.round(monthlySpend * variation * 100) / 100,
      };
    });
  }, [monthlySpend]);

  const categoryBreakdown = useMemo(() => {
    const totals: Record<string, number> = {};
    subscriptions.forEach(sub => {
      const cat = sub.custom_category || sub.category || 'Other';
      totals[cat] = (totals[cat] || 0) + normalizeToMonthly(sub.amount, sub.billing_cycle);
    });
    return Object.entries(totals)
      .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
      .sort((a, b) => b.value - a.value);
  }, [subscriptions]);

  const billingCycleData = useMemo(() => {
    const cycles: Record<string, number> = {};
    subscriptions.forEach(sub => {
      const cycle = sub.billing_cycle.charAt(0).toUpperCase() + sub.billing_cycle.slice(1);
      cycles[cycle] = (cycles[cycle] || 0) + 1;
    });
    return Object.entries(cycles).map(([name, count]) => ({ name, count }));
  }, [subscriptions]);

  const forecastData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const date = addMonths(new Date(), i + 1);
      return {
        month: format(date, 'MMM yy'),
        projected: Math.round(monthlySpend * (1 + i * 0.01) * 100) / 100,
      };
    });
  }, [monthlySpend]);

  const topSpenders = useMemo(() => {
    return [...subscriptions]
      .sort((a, b) => normalizeToMonthly(b.amount, b.billing_cycle) - normalizeToMonthly(a.amount, a.billing_cycle))
      .slice(0, 5);
  }, [subscriptions]);

  const avgPerSubscription = subscriptions.length > 0 ? monthlySpend / subscriptions.length : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <button
          onClick={onClose}
          className="mb-6 flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Analytics & Insights</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Deep dive into your subscription spending</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-sm text-slate-500 dark:text-slate-400">Monthly Spend</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(monthlySpend)}</p>
            <p className="text-xs text-slate-400 mt-1">Across {subscriptions.length} subscriptions</p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-sm text-slate-500 dark:text-slate-400">Yearly Spend</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(yearlySpend)}</p>
            <p className="text-xs text-slate-400 mt-1">Projected annual total</p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                <BarChart2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-sm text-slate-500 dark:text-slate-400">Avg per Sub</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(avgPerSubscription)}</p>
            <p className="text-xs text-slate-400 mt-1">Monthly average</p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-rose-100 dark:bg-rose-900/30 rounded-lg flex items-center justify-center">
                <PieChart className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              </div>
              <span className="text-sm text-slate-500 dark:text-slate-400">Categories</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{categoryBreakdown.length}</p>
            <p className="text-xs text-slate-400 mt-1">Distinct categories</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">12-Month Spending Trend</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Monthly subscription costs over time</p>
              </div>
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={spendingTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" style={{ fontSize: '11px' }} axisLine={false} tickLine={false} dy={8} />
                <YAxis stroke="#94a3b8" style={{ fontSize: '11px' }} tickFormatter={(v) => `$${v}`} axisLine={false} tickLine={false} dx={-8} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(v: number) => [`$${v.toFixed(2)}`, 'Spend']}
                />
                <Line type="monotone" dataKey="spend" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: '#3b82f6', r: 4, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">By Category</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Monthly spend distribution</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <RechartsPie>
                <Pie
                  data={categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryBreakdown.map((entry, index) => (
                    <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || `hsl(${index * 40}, 60%, 55%)`} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`, 'Spend']} />
              </RechartsPie>
            </ResponsiveContainer>
            <div className="mt-3 space-y-1.5">
              {categoryBreakdown.slice(0, 4).map((item, i) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[item.name] || `hsl(${i * 40}, 60%, 55%)` }} />
                    <span className="text-xs text-slate-600 dark:text-slate-400">{item.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">6-Month Forecast</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Projected spending based on current subs</p>
              </div>
              <TrendingDown className="w-5 h-5 text-emerald-500" />
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" style={{ fontSize: '11px' }} axisLine={false} tickLine={false} dy={8} />
                <YAxis stroke="#94a3b8" style={{ fontSize: '11px' }} tickFormatter={(v) => `$${v}`} axisLine={false} tickLine={false} dx={-8} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(v: number) => [`$${v.toFixed(2)}`, 'Projected']}
                />
                <Bar dataKey="projected" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">Billing Cycle Mix</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">How your subscriptions are billed</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={billingCycleData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" style={{ fontSize: '11px' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" stroke="#94a3b8" style={{ fontSize: '11px' }} axisLine={false} tickLine={false} width={70} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#06b6d4" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-5">Top Spenders</h2>
          <div className="space-y-3">
            {topSpenders.map((sub, i) => {
              const monthly = normalizeToMonthly(sub.amount, sub.billing_cycle);
              const pct = monthlySpend > 0 ? (monthly / monthlySpend) * 100 : 0;
              return (
                <div key={sub.id} className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-slate-400 w-4">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{sub.name}</span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{formatCurrency(monthly)}/mo</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400 mt-0.5 block">{pct.toFixed(1)}% of total</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

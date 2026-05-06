import { DollarSign, FileText, CheckCircle, Clock } from 'lucide-react';
import { normalizeToMonthly, formatCurrency, getDaysUntil } from '../lib/utils';
import type { Database } from '../lib/database.types';

type Subscription = Database['public']['Tables']['subscriptions']['Row'];

interface MetricsCardsProps {
  subscriptions: Subscription[];
}

export function MetricsCards({ subscriptions }: MetricsCardsProps) {
  const totalSubscriptions = subscriptions.length;

  const totalMonthlySpend = subscriptions.reduce((sum, sub) => {
    return sum + normalizeToMonthly(sub.amount, sub.billing_cycle);
  }, 0);

  const totalYearlySpend = totalMonthlySpend * 12;

  const upcomingThisWeek = subscriptions.filter(sub => {
    if (!sub.next_payment_date) return false;
    const days = getDaysUntil(sub.next_payment_date);
    return days !== null && days >= 0 && days <= 7;
  }).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Monthly Cost</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(totalMonthlySpend)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Yearly Cost</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(totalYearlySpend)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Active Subscriptions</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalSubscriptions}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
            <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Due This Week</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{upcomingThisWeek}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

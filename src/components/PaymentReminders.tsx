import { Bell, Calendar, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { getDaysUntil, formatCurrency, getLogoUrl } from '../lib/utils';
import type { Database } from '../lib/database.types';

type Subscription = Database['public']['Tables']['subscriptions']['Row'];

interface PaymentRemindersProps {
  subscriptions: Subscription[];
  onSelectSubscription: (sub: Subscription) => void;
}

function getUrgencyStyle(days: number) {
  if (days <= 3) return { bar: 'bg-red-500', badge: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400', label: 'Urgent' };
  if (days <= 7) return { bar: 'bg-amber-500', badge: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400', label: 'Soon' };
  return { bar: 'bg-blue-500', badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400', label: 'Upcoming' };
}

export function PaymentReminders({ subscriptions, onSelectSubscription }: PaymentRemindersProps) {
  const upcoming = subscriptions
    .filter(sub => {
      const days = getDaysUntil(sub.next_payment_date);
      return days !== null && days >= 0 && days <= 30;
    })
    .sort((a, b) => getDaysUntil(a.next_payment_date) - getDaysUntil(b.next_payment_date));

  const totalDue7Days = upcoming
    .filter(s => getDaysUntil(s.next_payment_date) <= 7)
    .reduce((sum, s) => sum + s.amount, 0);

  if (upcoming.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-8 text-center">
        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
          <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">No payments due in the next 30 days</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">You're all clear for now</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
            <Bell className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Payment Reminders</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{upcoming.length} due in next 30 days</p>
          </div>
        </div>
        {totalDue7Days > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <AlertCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
            <span className="text-xs font-semibold text-red-700 dark:text-red-400">
              {formatCurrency(totalDue7Days)} due this week
            </span>
          </div>
        )}
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {upcoming.map(sub => {
          const days = getDaysUntil(sub.next_payment_date);
          const urgency = getUrgencyStyle(days);
          const logoUrl = getLogoUrl(sub.domain);

          return (
            <div
              key={sub.id}
              onClick={() => onSelectSubscription(sub)}
              className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors group"
            >
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={sub.name}
                      className="w-full h-full object-contain p-1.5"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                      {sub.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${urgency.bar} border-2 border-white dark:border-slate-900`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{sub.name}</p>
                  <span className={`flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${urgency.badge}`}>
                    {urgency.label}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {days === 0 ? 'Due today' : days === 1 ? 'Due tomorrow' : `Due in ${days} days`}
                    {sub.next_payment_date && ` · ${format(new Date(sub.next_payment_date), 'd MMM yyyy')}`}
                  </span>
                </div>
              </div>

              <div className="flex-shrink-0 text-right">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(sub.amount)}</p>
                <p className="text-xs text-slate-400">{sub.billing_cycle}</p>
              </div>

              <ExternalLink className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors flex-shrink-0" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

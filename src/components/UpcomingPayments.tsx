import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';
import { formatCurrency, getDaysUntil, getUrgencyColor, getLogoUrl, getInitials } from '../lib/utils';
import type { Database } from '../lib/database.types';

type Subscription = Database['public']['Tables']['subscriptions']['Row'];

interface UpcomingPaymentsProps {
  subscriptions: Subscription[];
  loading: boolean;
  onSelectSubscription: (subscription: Subscription) => void;
}

export function UpcomingPayments({ subscriptions, loading, onSelectSubscription }: UpcomingPaymentsProps) {
  const upcomingPayments = subscriptions
    .filter(sub => sub.next_payment_date && getDaysUntil(sub.next_payment_date) <= 30)
    .sort((a, b) => {
      if (!a.next_payment_date) return 1;
      if (!b.next_payment_date) return -1;
      return new Date(a.next_payment_date).getTime() - new Date(b.next_payment_date).getTime();
    });

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-slate-200">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (upcomingPayments.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 border border-slate-200 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No upcoming payments</h3>
          <p className="text-slate-600">
            You don't have any payments due in the next 30 days.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">
          Upcoming Payments ({upcomingPayments.length})
        </h2>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        {upcomingPayments.map(subscription => (
          <UpcomingPaymentRow
            key={subscription.id}
            subscription={subscription}
            onClick={() => onSelectSubscription(subscription)}
          />
        ))}
      </div>
    </div>
  );
}

function UpcomingPaymentRow({ subscription, onClick }: { subscription: Subscription; onClick: () => void }) {
  const [logoError, setLogoError] = useState(false);
  const daysUntil = getDaysUntil(subscription.next_payment_date);
  const urgencyColor = getUrgencyColor(daysUntil);
  const logoUrl = getLogoUrl(subscription.domain);

  return (
    <div
      onClick={onClick}
      className="p-4 hover:bg-slate-50 transition-colors cursor-pointer group"
    >
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          {subscription.domain && !logoError ? (
            <img
              src={logoUrl}
              alt={subscription.name}
              className="w-10 h-10 rounded-lg object-cover"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-xs">
              {getInitials(subscription.name)}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
            {subscription.name}
          </h3>
          {subscription.next_payment_date && (
            <p className="text-sm text-slate-500">
              {format(new Date(subscription.next_payment_date), 'EEEE, MMMM d, yyyy')}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="font-semibold text-slate-900">
              {formatCurrency(subscription.amount, subscription.currency)}
            </div>
            <div className={`text-xs font-medium px-2 py-1 rounded border inline-block ${urgencyColor}`}>
              {daysUntil === 0 ? 'Today' :
               daysUntil === 1 ? 'Tomorrow' :
               daysUntil < 0 ? 'Overdue' :
               `in ${daysUntil} days`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

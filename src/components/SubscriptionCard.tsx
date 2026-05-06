import { useState } from 'react';
import { format } from 'date-fns';
import { formatCurrency, getDaysUntil, getUrgencyColor, getCategoryColor, getLogoUrl, getInitials } from '../lib/utils';
import type { Database } from '../lib/database.types';

type Subscription = Database['public']['Tables']['subscriptions']['Row'];

interface SubscriptionCardProps {
  subscription: Subscription;
  onClick: () => void;
}

export function SubscriptionCard({ subscription, onClick }: SubscriptionCardProps) {
  const [logoError, setLogoError] = useState(false);
  const daysUntil = getDaysUntil(subscription.next_payment_date);
  const urgencyColor = getUrgencyColor(daysUntil);
  const categoryColor = getCategoryColor(subscription.category);
  const logoUrl = getLogoUrl(subscription.domain);

  const formatBillingCycle = (cycle: string) => {
    switch (cycle.toLowerCase()) {
      case 'monthly':
        return '/mo';
      case 'annual':
      case 'yearly':
        return '/yr';
      case 'weekly':
        return '/wk';
      default:
        return '';
    }
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl p-5 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer group"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          {subscription.domain && !logoError ? (
            <img
              src={logoUrl}
              alt={subscription.name}
              className="w-12 h-12 rounded-lg object-cover"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
              {getInitials(subscription.name)}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
            {subscription.name}
          </h3>

          <div className="flex items-center gap-2 mt-1">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${categoryColor}`}>
              {subscription.category}
            </span>
            {subscription.status === 'trial' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                Trial
              </span>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div>
              <div className="text-lg font-bold text-slate-900">
                {formatCurrency(subscription.amount, subscription.currency)}
                <span className="text-sm font-normal text-slate-500">
                  {formatBillingCycle(subscription.billing_cycle)}
                </span>
              </div>
            </div>

            {subscription.next_payment_date && (
              <div className={`text-xs font-medium px-2 py-1 rounded border ${urgencyColor}`}>
                {daysUntil === 0 ? 'Today' :
                 daysUntil === 1 ? 'Tomorrow' :
                 daysUntil < 0 ? 'Overdue' :
                 `${daysUntil}d`}
              </div>
            )}
          </div>

          {subscription.next_payment_date && (
            <div className="mt-2 text-xs text-slate-500">
              Next: {format(new Date(subscription.next_payment_date), 'MMM d, yyyy')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

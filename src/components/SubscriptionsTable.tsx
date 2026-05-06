import { ArrowUpDown, Landmark } from 'lucide-react';
import { formatCurrency, getDaysUntil } from '../lib/utils';
import { format } from 'date-fns';
import type { Database } from '../lib/database.types';

type Subscription = Database['public']['Tables']['subscriptions']['Row'];

interface SubscriptionsTableProps {
  subscriptions: Subscription[];
  onSelectSubscription: (subscription: Subscription) => void;
}

export function SubscriptionsTable({ subscriptions, onSelectSubscription }: SubscriptionsTableProps) {
  const getServiceLogo = (name: string) => {
    const logos: { [key: string]: string } = {
      'Netflix': 'https://logo.clearbit.com/netflix.com',
      'Spotify': 'https://logo.clearbit.com/spotify.com',
      'Amazon Prime': 'https://logo.clearbit.com/amazon.com',
      'Disney+': 'https://logo.clearbit.com/disneyplus.com',
      'Adobe Creative Cloud': 'https://logo.clearbit.com/adobe.com',
      'Microsoft 365': 'https://logo.clearbit.com/microsoft.com',
      'Dropbox': 'https://logo.clearbit.com/dropbox.com',
      'GitHub': 'https://logo.clearbit.com/github.com',
      'AWS': 'https://logo.clearbit.com/aws.amazon.com',
      'ChatGPT Plus': 'https://logo.clearbit.com/openai.com',
      'Claude Pro': 'https://logo.clearbit.com/anthropic.com',
      'Apple Services': 'https://logo.clearbit.com/apple.com',
      'Notion': 'https://logo.clearbit.com/notion.so',
      'Figma': 'https://logo.clearbit.com/figma.com',
      'DigitalOcean': 'https://logo.clearbit.com/digitalocean.com',
      'ExpressVPN': 'https://logo.clearbit.com/expressvpn.com',
      'Binge': 'https://logo.clearbit.com/binge.com.au',
      'Cursor': 'https://logo.clearbit.com/cursor.sh',
      'Aussie Broadband': 'https://logo.clearbit.com/aussiebroadband.com.au',
    };
    return logos[name] || null;
  };

  const getFrequencyBadge = (cycle: string) => {
    const colors = {
      monthly: 'bg-blue-100 text-blue-700',
      yearly: 'bg-teal-100 text-teal-700',
      quarterly: 'bg-purple-100 text-purple-700',
      weekly: 'bg-orange-100 text-orange-700'
    };
    return colors[cycle as keyof typeof colors] || 'bg-slate-100 text-slate-700';
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'streaming': 'text-slate-600',
      'apps_tools': 'text-slate-600',
      'cloud': 'text-slate-600',
      'utilities': 'text-slate-600',
      'other': 'text-slate-600'
    };
    return colors[category as keyof typeof colors] || 'text-slate-600';
  };

  const formatCategory = (category: string) => {
    return category.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' & ');
  };

  const getNextBillingInfo = (date: string | null) => {
    if (!date) return { text: '-', days: null };
    const days = getDaysUntil(date);
    const formattedDate = format(new Date(date), 'd MMM yyyy');
    const daysText = days !== null ? `in ${days} days` : '';
    return { text: formattedDate, days: daysText };
  };

  const getLastChargedText = (date: string | null) => {
    if (!date) return '-';
    const now = new Date();
    const lastCharged = new Date(date);
    const diffDays = Math.floor((now.getTime() - lastCharged.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays === 2) return '2d ago';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 14) return '1w ago';
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return `${Math.floor(diffDays / 30)}mo ago`;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
              <th className="px-4 py-3 text-left">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300" />
              </th>
              <th className="px-4 py-3 text-left">
                <button className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white uppercase tracking-wide">
                  Provider
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white uppercase tracking-wide">
                  Category
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white uppercase tracking-wide">
                  Amount
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white uppercase tracking-wide">
                  Frequency
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white uppercase tracking-wide">
                  Next Billing
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white uppercase tracking-wide">
                  Status
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white uppercase tracking-wide">
                  Last Charged
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white uppercase tracking-wide">
                  Source
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((sub) => {
              const billingInfo = getNextBillingInfo(sub.next_payment_date);
              return (
                <tr
                  key={sub.id}
                  onClick={() => onSelectSubscription(sub)}
                  className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 rounded border-slate-300"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden border border-slate-200 dark:border-slate-700">
                        {getServiceLogo(sub.name) ? (
                          <img
                            src={getServiceLogo(sub.name)!}
                            alt={sub.name}
                            className="w-full h-full object-contain p-1"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling!.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <span className={`text-sm font-semibold text-slate-700 dark:text-slate-300 ${getServiceLogo(sub.name) ? 'hidden' : ''}`}>
                          {sub.name.charAt(0)}
                        </span>
                      </div>
                      <span className="font-medium text-slate-900 dark:text-white">{sub.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-sm text-slate-600 dark:text-slate-400`}>
                      {formatCategory(sub.category)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(sub.amount)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getFrequencyBadge(sub.billing_cycle)} dark:opacity-90`}>
                      {sub.billing_cycle.charAt(0).toUpperCase() + sub.billing_cycle.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {billingInfo.text}
                      </span>
                      {billingInfo.days && (
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {billingInfo.days}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-600 dark:bg-teal-400"></span>
                      Active
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {getLastChargedText(sub.last_charged)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      <Landmark className="w-3 h-3" />
                      Bank
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

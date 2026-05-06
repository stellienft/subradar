import { useState, useMemo } from 'react';
import { Filter, Crown } from 'lucide-react';
import { SubscriptionCard } from './SubscriptionCard';
import { BlurredSubscriptionCard } from './BlurredSubscriptionCard';
import { useSubscription } from '../hooks/useSubscription';
import type { Database } from '../lib/database.types';

type Subscription = Database['public']['Tables']['subscriptions']['Row'];

interface SubscriptionsListProps {
  subscriptions: Subscription[];
  loading: boolean;
  onSelectSubscription: (subscription: Subscription) => void;
  onUpgradeClick: () => void;
}

type SortOption = 'cost-high' | 'cost-low' | 'name' | 'date' | 'category';
type FilterCategory = 'all' | string;

export function SubscriptionsList({ subscriptions, loading, onSelectSubscription, onUpgradeClick }: SubscriptionsListProps) {
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
  const [showFilters, setShowFilters] = useState(false);
  const subscriptionData = useSubscription();

  const categories = useMemo(() => {
    const cats = new Set(subscriptions.map(s => s.category));
    return ['all', ...Array.from(cats)];
  }, [subscriptions]);

  const filteredAndSorted = useMemo(() => {
    let filtered = subscriptions;

    if (filterCategory !== 'all') {
      filtered = filtered.filter(s => s.category === filterCategory);
    }

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'cost-high':
          return b.amount - a.amount;
        case 'cost-low':
          return a.amount - b.amount;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          if (!a.next_payment_date) return 1;
          if (!b.next_payment_date) return -1;
          return new Date(a.next_payment_date).getTime() - new Date(b.next_payment_date).getTime();
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

    return sorted;
  }, [subscriptions, sortBy, filterCategory]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-slate-200">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 border border-slate-200 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Filter className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No subscriptions yet</h3>
          <p className="text-slate-600">
            Connect your Gmail to automatically detect your subscriptions, or try the demo mode.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Your Subscriptions ({filteredAndSorted.length})
        </h2>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filter
          </button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <option value="date">Next Payment</option>
            <option value="cost-high">Cost: High to Low</option>
            <option value="cost-low">Cost: Low to High</option>
            <option value="name">Name</option>
            <option value="category">Category</option>
          </select>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  filterCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat === 'all' ? 'All' : cat}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAndSorted.slice(0, subscriptionData.maxVisibleSubscriptions).map(subscription => (
          <SubscriptionCard
            key={subscription.id}
            subscription={subscription}
            onClick={() => onSelectSubscription(subscription)}
          />
        ))}

        {!subscriptionData.isPremium && filteredAndSorted.length > subscriptionData.maxVisibleSubscriptions && (
          <>
            {Array.from({ length: Math.min(6, filteredAndSorted.length - subscriptionData.maxVisibleSubscriptions) }).map((_, i) => (
              <BlurredSubscriptionCard key={`blurred-${i}`} />
            ))}
          </>
        )}
      </div>

      {!subscriptionData.isPremium && filteredAndSorted.length > subscriptionData.maxVisibleSubscriptions && (
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {filteredAndSorted.length - subscriptionData.maxVisibleSubscriptions} more subscription{filteredAndSorted.length - subscriptionData.maxVisibleSubscriptions !== 1 ? 's' : ''} hidden
                </h3>
                <p className="text-sm text-slate-600">
                  Upgrade to Premium to view all your subscriptions and unlock unlimited accounts
                </p>
              </div>
            </div>
            <button
              onClick={onUpgradeClick}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <Crown className="w-4 h-4" />
              Upgrade to Premium
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

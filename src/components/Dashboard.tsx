import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { MetricsCards } from './MetricsCards';
import { SpendingChart } from './SpendingChart';
import { SubscriptionsList } from './SubscriptionsList';
import { SubscriptionDetail } from './SubscriptionDetail';
import { GmailConnection } from './GmailConnection';
import { CategoryFilters } from './CategoryFilters';
import { Header } from './Header';
import { UpgradeModal } from './UpgradeModal';
import { PricingPage } from './PricingPage';
import { SettingsPage } from './SettingsPage';
import { LinkedAccountsPage } from './LinkedAccountsPage';
import { BillingPage } from './BillingPage';
import { AnalyticsPage } from './AnalyticsPage';
import { InsightsPanel } from './InsightsPanel';
import { PaymentReminders } from './PaymentReminders';
import { ExportButton } from './ExportButton';
import type { Database } from '../lib/database.types';

type Subscription = Database['public']['Tables']['subscriptions']['Row'];
type ViewMode = 'dashboard' | 'pricing' | 'settings' | 'linked-accounts' | 'billing' | 'analytics';

export function Dashboard() {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');

  useEffect(() => {
    if (user) {
      loadSubscriptions();
    }
  }, [user]);

  const loadSubscriptions = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .neq('status', 'cancelled')
      .order('next_payment_date', { ascending: true });

    if (error) {
      console.error('Error loading subscriptions:', error);
    } else {
      setSubscriptions(data || []);
    }
    setLoading(false);
  };

  const handleUpgrade = () => {
    setShowUpgradeModal(false);
    setViewMode('pricing');
  };

  if (viewMode === 'analytics') {
    return (
      <AnalyticsPage
        subscriptions={subscriptions}
        onClose={() => setViewMode('dashboard')}
      />
    );
  }

  if (viewMode === 'pricing') {
    return (
      <PricingPage
        onUpgrade={() => alert('Stripe integration coming soon! Add your Stripe keys to enable payments.')}
        onClose={() => setViewMode('dashboard')}
      />
    );
  }

  if (viewMode === 'settings') {
    return (
      <SettingsPage
        onClose={() => setViewMode('dashboard')}
        onNavigateToLinkedAccounts={() => setViewMode('linked-accounts')}
        onNavigateToBilling={() => setViewMode('billing')}
        onNavigateToPricing={() => setViewMode('pricing')}
        onNavigateToAnalytics={() => setViewMode('analytics')}
      />
    );
  }

  if (viewMode === 'linked-accounts') {
    return (
      <LinkedAccountsPage
        onClose={() => setViewMode('dashboard')}
        onUpgradeClick={() => setViewMode('pricing')}
      />
    );
  }

  if (viewMode === 'billing') {
    return (
      <BillingPage
        onClose={() => setViewMode('dashboard')}
        onUpgrade={() => setViewMode('pricing')}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <Header
          onNavigateToSettings={() => setViewMode('settings')}
          onNavigateToPricing={() => setViewMode('pricing')}
          onNavigateToAnalytics={() => setViewMode('analytics')}
        />
        <div className="flex items-center justify-center h-[calc(100vh-56px)] sm:h-[calc(100vh-64px)]">
          <div className="text-slate-600 dark:text-slate-400">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header
        onNavigateToSettings={() => setViewMode('settings')}
        onNavigateToPricing={() => setViewMode('pricing')}
        onNavigateToAnalytics={() => setViewMode('analytics')}
      />

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        <GmailConnection />

        <MetricsCards subscriptions={subscriptions} />

        <SpendingChart subscriptions={subscriptions} />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <InsightsPanel
              subscriptions={subscriptions}
              onSelectSubscription={setSelectedSubscription}
            />
          </div>
          <div>
            <PaymentReminders
              subscriptions={subscriptions}
              onSelectSubscription={setSelectedSubscription}
            />
          </div>
        </div>

        <CategoryFilters />

        <div className="space-y-3">
          <div className="flex justify-end">
            <ExportButton subscriptions={subscriptions} />
          </div>
          <SubscriptionsList
            subscriptions={subscriptions}
            loading={loading}
            onSelectSubscription={setSelectedSubscription}
            onUpgradeClick={() => setShowUpgradeModal(true)}
          />
        </div>
      </main>

      {selectedSubscription && (
        <SubscriptionDetail
          subscription={selectedSubscription}
          onClose={() => setSelectedSubscription(null)}
          onUpdate={loadSubscriptions}
        />
      )}

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={handleUpgrade}
        hiddenCount={subscriptions.length > 10 ? subscriptions.length - 10 : 0}
      />
    </div>
  );
}

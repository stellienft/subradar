import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface SubscriptionTierData {
  tier: 'free' | 'premium';
  status: 'active' | 'past_due' | 'canceled' | 'trialing';
  maxAccounts: number;
  maxVisibleSubscriptions: number;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  subscriptionEndsAt: string | null;
  loading: boolean;
}

export function useSubscription() {
  const { user } = useAuth();
  const [data, setData] = useState<SubscriptionTierData>({
    tier: 'free',
    status: 'active',
    maxAccounts: 1,
    maxVisibleSubscriptions: 10,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    subscriptionEndsAt: null,
    loading: true,
  });

  useEffect(() => {
    if (!user) {
      setData(prev => ({ ...prev, loading: false }));
      return;
    }

    async function loadSubscriptionData() {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('subscription_tier, subscription_status, max_accounts_allowed, stripe_customer_id, stripe_subscription_id, subscription_ends_at')
          .eq('id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (profile) {
          setData({
            tier: (profile.subscription_tier as 'free' | 'premium') || 'free',
            status: (profile.subscription_status as any) || 'active',
            maxAccounts: profile.max_accounts_allowed || 1,
            maxVisibleSubscriptions: profile.subscription_tier === 'premium' ? 999999 : 10,
            stripeCustomerId: profile.stripe_customer_id,
            stripeSubscriptionId: profile.stripe_subscription_id,
            subscriptionEndsAt: profile.subscription_ends_at,
            loading: false,
          });
        } else {
          setData(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        console.error('Error loading subscription data:', error);
        setData(prev => ({ ...prev, loading: false }));
      }
    }

    loadSubscriptionData();
  }, [user]);

  const isPremium = data.tier === 'premium' && data.status === 'active';
  const canAddAccount = data.maxAccounts > 1;
  const canViewAllSubscriptions = data.tier === 'premium';

  return {
    ...data,
    isPremium,
    canAddAccount,
    canViewAllSubscriptions,
  };
}

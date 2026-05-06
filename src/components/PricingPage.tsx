import { Check, Crown, Sparkles, Zap, Shield, TrendingUp } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';

interface PricingPageProps {
  onUpgrade: () => void;
  onClose: () => void;
}

export function PricingPage({ onUpgrade, onClose }: PricingPageProps) {
  const { tier, isPremium } = useSubscription();

  const freeFeatures = [
    '1 email account',
    '10 visible subscriptions',
    'Basic subscription tracking',
    'Manual entry',
    'Community support',
  ];

  const premiumFeatures = [
    'Unlimited subscription tracking',
    'Unlimited email accounts',
    'Advanced analytics & insights',
    'Export data (CSV/JSON)',
    'Priority email support',
    'Early access to new features',
    'Custom categories and tags',
    'Payment reminder notifications',
    'Cancellation link tracking',
    'Spending trends analysis',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <button
          onClick={onClose}
          className="mb-8 text-slate-600 hover:text-slate-900 font-medium transition-colors"
        >
          ← Back to Dashboard
        </button>

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4" />
            Simple, transparent pricing
          </div>
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            Take Control of Your Subscriptions
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Start free, upgrade when you need more. No hidden fees, cancel anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white rounded-2xl p-8 border-2 border-slate-200 shadow-lg">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Free</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-5xl font-bold text-slate-900">$0</span>
                <span className="text-slate-500 text-lg">/month</span>
              </div>
              <p className="text-slate-600">Perfect for getting started with subscription tracking</p>
            </div>

            <ul className="space-y-4 mb-8">
              {freeFeatures.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700">{feature}</span>
                </li>
              ))}
            </ul>

            {tier === 'free' && (
              <div className="bg-slate-100 text-slate-700 font-semibold py-3 px-6 rounded-lg text-center">
                Current Plan
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-8 border-2 border-blue-700 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>

            <div className="relative">
              <div className="inline-flex items-center gap-2 bg-white/20 text-white px-3 py-1.5 rounded-full text-sm font-bold mb-4">
                <Crown className="w-4 h-4" />
                MOST POPULAR
              </div>

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Premium</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-5xl font-bold text-white">$20</span>
                  <span className="text-blue-100 text-lg">/month</span>
                </div>
                <p className="text-blue-100">Everything you need for complete subscription management</p>
              </div>

              <ul className="space-y-4 mb-8">
                {premiumFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                    <span className="text-white">{feature}</span>
                  </li>
                ))}
              </ul>

              {isPremium ? (
                <div className="bg-white/20 text-white font-semibold py-3 px-6 rounded-lg text-center backdrop-blur-sm">
                  Current Plan
                </div>
              ) : (
                <button
                  onClick={onUpgrade}
                  className="w-full bg-white text-blue-600 font-bold py-4 px-6 rounded-lg hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <Crown className="w-5 h-5" />
                  Upgrade to Premium
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 border border-slate-200 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-semibold text-slate-900 mb-2">Money-back guarantee</h4>
            <p className="text-sm text-slate-600">14-day refund policy, no questions asked</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-semibold text-slate-900 mb-2">Instant access</h4>
            <p className="text-sm text-slate-600">Premium features activate immediately</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="font-semibold text-slate-900 mb-2">Cancel anytime</h4>
            <p className="text-sm text-slate-600">No commitments, downgrade when you want</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-8 border border-slate-200">
          <h3 className="text-2xl font-bold text-slate-900 mb-6 text-center">Frequently Asked Questions</h3>

          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Can I cancel my subscription anytime?</h4>
              <p className="text-slate-600">Yes, you can cancel your premium subscription at any time from your account settings. You'll continue to have access until the end of your billing period.</p>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-2">What happens to my data if I downgrade?</h4>
              <p className="text-slate-600">Your data is never deleted. If you downgrade to free, you'll only be able to view 10 subscriptions, but all your data remains safely stored and accessible if you upgrade again.</p>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-2">How does the 14-day money-back guarantee work?</h4>
              <p className="text-slate-600">If you're not satisfied with Premium for any reason within 14 days of subscribing, contact us and we'll refund you in full, no questions asked.</p>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-2">How secure is my data?</h4>
              <p className="text-slate-600">We use bank-level encryption and security measures. Your email credentials are encrypted, and we never store your passwords. All data is transmitted over secure HTTPS connections.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

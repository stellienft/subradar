import { useState, useEffect } from 'react';
import { CreditCard, Calendar, Download, Crown, Loader2, ExternalLink } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import { supabase } from '../lib/supabase';

interface BillingPageProps {
  onClose: () => void;
  onUpgrade: () => void;
}

export function BillingPage({ onClose, onUpgrade }: BillingPageProps) {
  const { user } = useAuth();
  const { tier, isPremium, status, subscriptionEndsAt, loading: subscriptionLoading } = useSubscription();
  const [managingBilling, setManagingBilling] = useState(false);

  async function handleManageBilling() {
    setManagingBilling(true);
    try {
      alert('Stripe Billing Portal integration coming soon!');
    } catch (error) {
      console.error('Error opening billing portal:', error);
    } finally {
      setManagingBilling(false);
    }
  }

  if (subscriptionLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={onClose}
          className="mb-6 text-slate-600 hover:text-slate-900 font-medium transition-colors"
        >
          ← Back to Dashboard
        </button>

        <h1 className="text-3xl font-bold text-slate-900 mb-8">Billing & Subscription</h1>

        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-2">Current Plan</h2>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-lg ${
                    isPremium ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {isPremium && <Crown className="w-5 h-5" />}
                    {tier === 'premium' ? 'Premium' : 'Free'}
                  </span>
                  {status === 'canceled' && subscriptionEndsAt && (
                    <span className="text-sm text-orange-600 font-medium">
                      Expires {new Date(subscriptionEndsAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              {!isPremium && (
                <button
                  onClick={onUpgrade}
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Crown className="w-4 h-4" />
                  Upgrade to Premium
                </button>
              )}
            </div>

            {tier === 'free' ? (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-2">Free Plan Features</h3>
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li>• 1 email account</li>
                    <li>• 10 visible subscriptions</li>
                    <li>• Basic subscription tracking</li>
                    <li>• Community support</li>
                  </ul>
                </div>

                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-slate-900 mb-2">Unlock Premium for $20/month</h3>
                  <ul className="space-y-2 text-sm text-slate-700 mb-4">
                    <li>• Unlimited subscription tracking</li>
                    <li>• Unlimited email accounts</li>
                    <li>• Advanced analytics and insights</li>
                    <li>• Export data to CSV/JSON</li>
                    <li>• Priority support</li>
                  </ul>
                  <button
                    onClick={onUpgrade}
                    className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Crown className="w-4 h-4" />
                    Upgrade Now
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-slate-900 mb-2">Premium Plan Benefits</h3>
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li>✓ Unlimited subscription tracking</li>
                    <li>✓ Unlimited email accounts</li>
                    <li>✓ Advanced analytics and insights</li>
                    <li>✓ Export data to CSV/JSON</li>
                    <li>✓ Priority email support</li>
                    <li>✓ Early access to new features</li>
                  </ul>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <p className="font-semibold text-slate-900">$20.00 / month</p>
                    <p className="text-sm text-slate-600">Billed monthly</p>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span className="text-sm font-medium">Active</span>
                  </div>
                </div>

                {/* <div className="pt-4 border-t border-slate-200">
                  <button
                    onClick={handleManageBilling}
                    disabled={managingBilling}
                    className="w-full px-6 py-3 border-2 border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {managingBilling ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Opening Portal...
                      </>
                    ) : (
                      <>
                        <ExternalLink className="w-4 h-4" />
                        Manage Billing
                      </>
                    )}
                  </button>
                  <p className="text-xs text-center text-slate-500 mt-2">
                    Update payment method, view invoices, or cancel subscription
                  </p>
                </div> */}
              </div>
            )}
          </div>

          {isPremium && (
            <>
              <div className="bg-white rounded-xl p-6 border border-slate-200">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Payment Method</h2>
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-slate-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">Visa ending in 4242</p>
                    <p className="text-sm text-slate-600">Expires 12/2025</p>
                  </div>
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Update
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-slate-900">Billing History</h2>
                </div>

                <div className="space-y-3">
                  {[
                    { date: '2024-03-01', amount: '$20.00', status: 'Paid', invoice: '#INV-001' },
                    { date: '2024-02-01', amount: '$20.00', status: 'Paid', invoice: '#INV-002' },
                    { date: '2024-01-01', amount: '$20.00', status: 'Paid', invoice: '#INV-003' },
                  ].map((payment, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">{payment.date}</span>
                        </div>
                        <span className="font-semibold text-slate-900">{payment.amount}</span>
                        <span className="text-sm text-green-600 font-medium">{payment.status}</span>
                      </div>
                      <button className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
                        <Download className="w-4 h-4" />
                        Invoice
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="bg-slate-100 rounded-xl p-6 border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-2">Need help?</h3>
            <p className="text-sm text-slate-600 mb-4">
              Have questions about billing or need to make changes? Our support team is here to help.
            </p>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Contact Support →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

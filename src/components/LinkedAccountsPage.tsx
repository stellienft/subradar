import { useState, useEffect } from 'react';
import { Mail, Plus, CheckCircle, AlertCircle, Loader2, Trash2, RefreshCw, Crown, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import { supabase } from '../lib/supabase';

interface LinkedAccountsPageProps {
  onClose: () => void;
  onUpgradeClick: () => void;
}

interface LinkedAccount {
  id: string;
  email_provider: string;
  email_address: string;
  is_primary: boolean;
  last_scan_at: string | null;
  connected_at: string;
  status: string;
  subscription_count: number;
}

export function LinkedAccountsPage({ onClose, onUpgradeClick }: LinkedAccountsPageProps) {
  const { user } = useAuth();
  const { tier, isPremium, maxAccounts, canAddAccount } = useSubscription();
  const [accounts, setAccounts] = useState<LinkedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddAccount, setShowAddAccount] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, [user]);

  async function loadAccounts() {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('linked_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('is_primary', { ascending: false })
        .order('connected_at', { ascending: false });

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleAddAccount() {
    if (!canAddAccount) {
      onUpgradeClick();
      return;
    }
    setShowAddAccount(true);
  }

  async function handleDisconnect(accountId: string) {
    if (!confirm('Are you sure you want to disconnect this account? Your subscription data will remain, but we will stop scanning this email.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('linked_accounts')
        .delete()
        .eq('id', accountId);

      if (error) throw error;
      loadAccounts();
    } catch (error) {
      console.error('Error disconnecting account:', error);
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-100';
      case 'expired': return 'text-red-600 bg-red-100';
      case 'scanning': return 'text-blue-600 bg-blue-100';
      case 'error': return 'text-orange-600 bg-orange-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'connected': return <CheckCircle className="w-4 h-4" />;
      case 'expired': return <AlertCircle className="w-4 h-4" />;
      case 'scanning': return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  }

  if (loading) {
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

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Linked Accounts</h1>
          <p className="text-slate-600">
            Manage your connected email accounts to track subscriptions across multiple inboxes
          </p>
        </div>

        {!isPremium && (
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 mb-1">
                  Free Plan: {accounts.length} of {maxAccounts} account{maxAccounts !== 1 ? 's' : ''} connected
                </h3>
                <p className="text-sm text-slate-600 mb-3">
                  Upgrade to Premium to connect unlimited email accounts and track all your subscriptions
                </p>
                <button
                  onClick={onUpgradeClick}
                  className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Upgrade to Premium →
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {accounts.map((account) => (
            <div key={account.id} className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900">{account.email_address}</h3>
                      {account.is_primary && (
                        <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                          PRIMARY
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${getStatusColor(account.status)}`}>
                        {getStatusIcon(account.status)}
                        {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
                      </span>
                      <span className="text-sm text-slate-500">
                        {account.subscription_count} subscription{account.subscription_count !== 1 ? 's' : ''} found
                      </span>
                    </div>

                    <div className="text-sm text-slate-600 space-y-1">
                      <p>Connected: {new Date(account.connected_at).toLocaleDateString()}</p>
                      {account.last_scan_at && (
                        <p>Last scan: {new Date(account.last_scan_at).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {account.status === 'expired' && (
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <RefreshCw className="w-5 h-5" />
                    </button>
                  )}
                  {!account.is_primary && (
                    <button
                      onClick={() => handleDisconnect(account.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {accounts.length === 0 && (
            <div className="bg-white rounded-xl p-12 border border-slate-200 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No accounts connected</h3>
              <p className="text-slate-600 mb-6">
                Connect your first email account to start tracking subscriptions
              </p>
            </div>
          )}

          <button
            onClick={handleAddAccount}
            className={`w-full border-2 border-dashed rounded-xl p-6 transition-all ${
              canAddAccount
                ? 'border-blue-300 hover:border-blue-400 hover:bg-blue-50 text-blue-600'
                : 'border-slate-300 bg-slate-50 text-slate-400 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center justify-center gap-3">
              {canAddAccount ? (
                <>
                  <Plus className="w-6 h-6" />
                  <span className="font-semibold">Add Another Account</span>
                </>
              ) : (
                <>
                  <Lock className="w-6 h-6" />
                  <span className="font-semibold">Add Another Account (Premium Only)</span>
                </>
              )}
            </div>
            {!canAddAccount && (
              <p className="text-sm text-slate-500 mt-2">
                Upgrade to Premium to connect unlimited accounts
              </p>
            )}
          </button>
        </div>

        {!isPremium && (
          <div className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h3 className="text-xl font-bold mb-1">Track subscriptions from all your emails</h3>
                <p className="text-blue-100">Upgrade to Premium for unlimited account linking</p>
              </div>
              <button
                onClick={onUpgradeClick}
                className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors shadow-lg flex items-center gap-2"
              >
                <Crown className="w-4 h-4" />
                Upgrade Now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

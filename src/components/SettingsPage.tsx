import { useState, useEffect } from 'react';
import { User, Bell, Settings, CreditCard, Shield, ChevronRight, Save, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import { supabase } from '../lib/supabase';
import { Header } from './Header';

interface SettingsPageProps {
  onClose: () => void;
  onNavigateToLinkedAccounts: () => void;
  onNavigateToBilling: () => void;
  onNavigateToPricing: () => void;
  onNavigateToAnalytics: () => void;
}

type SettingsTab = 'profile' | 'notifications' | 'preferences' | 'security';

export function SettingsPage({ onClose, onNavigateToLinkedAccounts, onNavigateToBilling, onNavigateToPricing, onNavigateToAnalytics }: SettingsPageProps) {
  const { user } = useAuth();
  const { tier, isPremium } = useSubscription();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    weekly_reports_enabled: true,
    payment_reminders: true,
    notifications_enabled: true,
  });

  const [preferences, setPreferences] = useState({
    currency_preference: 'USD',
    theme_preference: 'system' as 'light' | 'dark' | 'system',
  });

  useEffect(() => {
    loadSettings();
  }, [user]);

  async function loadSettings() {
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .maybeSingle();

    if (profile) {
      setProfileData({
        full_name: profile.full_name || '',
        email: profile.email || '',
      });
    }

    const { data: settings } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (settings) {
      setNotificationSettings({
        email_notifications: settings.email_notifications,
        weekly_reports_enabled: settings.weekly_reports_enabled,
        payment_reminders: settings.payment_reminders,
        notifications_enabled: settings.notifications_enabled,
      });
      setPreferences({
        currency_preference: settings.currency_preference,
        theme_preference: settings.theme_preference as any,
      });
    }
  }

  async function saveSettings() {
    if (!user) return;

    setSaving(true);
    setSaveSuccess(false);

    try {
      await supabase
        .from('profiles')
        .update({ full_name: profileData.full_name })
        .eq('id', user.id);

      const { error: settingsError } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          ...notificationSettings,
          ...preferences,
        });

      if (settingsError) throw settingsError;

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  }

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'preferences' as const, label: 'Preferences', icon: Settings },
    { id: 'security' as const, label: 'Security', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header
        onNavigateToSettings={onClose}
        onNavigateToPricing={onNavigateToPricing}
        onNavigateToAnalytics={onNavigateToAnalytics}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <button
          onClick={onClose}
          className="mb-6 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium transition-colors text-sm"
        >
          ← Back to Dashboard
        </button>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-8">Settings</h1>

        <div className="grid md:grid-cols-4 gap-6">
          <div className="md:col-span-1 space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
                  activeTab === tab.id
                    ? 'bg-teal-600 text-white'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <tab.icon className="w-4 h-4 flex-shrink-0" />
                <span>{tab.label}</span>
              </button>
            ))}

            <button
              onClick={onNavigateToLinkedAccounts}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors text-sm font-medium"
            >
              <span>Linked Accounts</span>
              <ChevronRight className="w-4 h-4 flex-shrink-0" />
            </button>

            <button
              onClick={onNavigateToBilling}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors text-sm font-medium"
            >
              <div className="flex items-center gap-3">
                <CreditCard className="w-4 h-4 flex-shrink-0" />
                <span>Billing</span>
              </div>
              <ChevronRight className="w-4 h-4 flex-shrink-0" />
            </button>
          </div>

          <div className="md:col-span-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Profile Information</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={profileData.full_name}
                      onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={profileData.email}
                      disabled
                      className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Current Plan</label>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1.5 rounded-lg font-semibold text-sm ${
                        isPremium
                          ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}>
                        {tier === 'premium' ? 'Premium' : 'Free'}
                      </span>
                      {!isPremium && (
                        <button
                          onClick={onNavigateToPricing}
                          className="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium transition-colors"
                        >
                          Upgrade
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Notification Preferences</h2>

                <div className="space-y-1">
                  {[
                    { key: 'notifications_enabled' as const, label: 'Enable Notifications', desc: 'Master toggle for all notifications' },
                    { key: 'email_notifications' as const, label: 'Email Notifications', desc: 'Receive updates via email' },
                    { key: 'weekly_reports_enabled' as const, label: 'Weekly Reports', desc: 'Get a weekly summary of your subscriptions' },
                    { key: 'payment_reminders' as const, label: 'Payment Reminders', desc: 'Get reminded before upcoming payments' },
                  ].map(({ key, label, desc }, i, arr) => (
                    <div key={key} className={`flex items-center justify-between py-4 ${i < arr.length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''}`}>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white text-sm">{label}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings[key]}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, [key]: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 dark:peer-focus:ring-teal-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Preferences</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Currency</label>
                    <select
                      value={preferences.currency_preference}
                      onChange={(e) => setPreferences({ ...preferences, currency_preference: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 transition-colors"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="CAD">CAD ($)</option>
                      <option value="AUD">AUD ($)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Theme</label>
                    <select
                      value={preferences.theme_preference}
                      onChange={(e) => setPreferences({ ...preferences, theme_preference: e.target.value as any })}
                      className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 transition-colors"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Security</h2>

                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">Password management is handled through Supabase authentication.</p>
                    <button className="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium transition-colors">
                      Change Password
                    </button>
                  </div>

                  <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/50 rounded-lg">
                    <h3 className="font-semibold text-red-900 dark:text-red-400 mb-2 text-sm">Danger Zone</h3>
                    <p className="text-sm text-red-700 dark:text-red-400/80 mb-3">Permanently delete your account and all associated data.</p>
                    <button className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium transition-colors">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                {saveSuccess && (
                  <p className="text-sm text-teal-600 dark:text-teal-400 font-medium">Settings saved successfully!</p>
                )}
              </div>
              <button
                onClick={saveSettings}
                disabled={saving}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

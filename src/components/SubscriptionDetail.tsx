import { useState } from 'react';
import { X, ExternalLink, Clock, DollarSign, Calendar, Mail, AlertCircle, Tag, FileText, Save } from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency, normalizeToMonthly, getLogoUrl, getInitials, getCategoryColor } from '../lib/utils';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Subscription = Database['public']['Tables']['subscriptions']['Row'];

interface SubscriptionDetailProps {
  subscription: Subscription;
  onClose: () => void;
  onUpdate: () => void;
}

const PRESET_CATEGORIES = ['Streaming', 'SaaS', 'Cloud', 'Health', 'Education', 'Finance', 'News', 'Utilities', 'Gaming', 'Music', 'Fitness', 'Security', 'Storage', 'Communication', 'Other'];

export function SubscriptionDetail({ subscription, onClose, onUpdate }: SubscriptionDetailProps) {
  const [logoError, setLogoError] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [customCategory, setCustomCategory] = useState(subscription.custom_category || subscription.category || '');
  const [notes, setNotes] = useState(subscription.notes || '');
  const [reminderDays, setReminderDays] = useState(subscription.reminder_days_before ?? 3);
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const logoUrl = getLogoUrl(subscription.domain);
  const categoryColor = getCategoryColor(subscription.category);
  const monthlyAmount = normalizeToMonthly(subscription.amount, subscription.billing_cycle);

  const handleSaveCustomizations = async () => {
    setSaving(true);
    try {
      await supabase
        .from('subscriptions')
        .update({
          custom_category: customCategory || null,
          notes: notes || null,
          reminder_days_before: reminderDays,
        })
        .eq('id', subscription.id);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      onUpdate();
    } catch (error) {
      console.error('Error saving customizations:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    if (subscription.cancellation_url) {
      window.open(subscription.cancellation_url, '_blank');
    } else {
      const searchUrl = `https://www.google.com/search?q=how+to+cancel+${encodeURIComponent(subscription.name)}+subscription`;
      window.open(searchUrl, '_blank');
    }

    setIsUpdating(true);
    try {
      await supabase
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('id', subscription.id);
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating subscription:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSnooze = async (days: number) => {
    setIsUpdating(true);
    try {
      const currentDate = subscription.next_payment_date
        ? new Date(subscription.next_payment_date)
        : new Date();
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + days);

      await supabase
        .from('subscriptions')
        .update({ next_payment_date: newDate.toISOString().split('T')[0] })
        .eq('id', subscription.id);

      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error snoozing subscription:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white dark:bg-slate-900 shadow-2xl z-50 overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Subscription Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-start gap-4">
            {subscription.domain && !logoError ? (
              <img
                src={logoUrl}
                alt={subscription.name}
                className="w-16 h-16 rounded-xl object-cover"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-lg">
                {getInitials(subscription.name)}
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{subscription.name}</h3>
              <div className="flex items-center gap-2 mt-2">
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${categoryColor}`}>
                  {subscription.category}
                </span>
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                  subscription.status === 'active' ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' :
                  subscription.status === 'trial' ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800' :
                  'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}>
                  {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <DollarSign className="w-5 h-5 text-slate-600 dark:text-slate-400 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Cost</div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {formatCurrency(subscription.amount, subscription.currency)}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Billed {subscription.billing_cycle}
                  {subscription.billing_cycle !== 'monthly' && (
                    <span className="ml-2 text-slate-600 dark:text-slate-400">
                      (~{formatCurrency(monthlyAmount)}/mo)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {subscription.next_payment_date && (
              <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <Calendar className="w-5 h-5 text-slate-600 dark:text-slate-400 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Next Payment</div>
                  <div className="text-lg font-semibold text-slate-900 dark:text-white mt-1">
                    {format(new Date(subscription.next_payment_date), 'MMMM d, yyyy')}
                  </div>
                </div>
              </div>
            )}

            {subscription.trial_ends_at && (
              <div className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-800">
                <AlertCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-purple-700 dark:text-purple-400">Trial Ends</div>
                  <div className="text-lg font-semibold text-purple-900 dark:text-purple-300 mt-1">
                    {format(new Date(subscription.trial_ends_at), 'MMMM d, yyyy')}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <Clock className="w-5 h-5 text-slate-600 dark:text-slate-400 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-slate-600 dark:text-slate-400">First Detected</div>
                <div className="text-sm text-slate-900 dark:text-white mt-1">
                  {format(new Date(subscription.first_detected_at), 'MMMM d, yyyy')}
                </div>
              </div>
            </div>

            {subscription.email_address && (
              <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <Mail className="w-5 h-5 text-slate-600 dark:text-slate-400 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Email Address</div>
                  <div className="text-sm text-slate-900 dark:text-white mt-1">
                    {subscription.email_address}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setShowEditPanel(!showEditPanel)}
              className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Customize Category & Notes</span>
              </div>
              <span className="text-xs text-slate-400">{showEditPanel ? 'Hide' : 'Edit'}</span>
            </button>

            {showEditPanel && (
              <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wide">Custom Category</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {PRESET_CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setCustomCategory(cat)}
                        className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                          customCategory === cat
                            ? 'bg-blue-600 text-white'
                            : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:border-blue-400'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Or type a custom category..."
                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wide">Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add a note about this subscription..."
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wide">Remind me</label>
                  <select
                    value={reminderDays}
                    onChange={(e) => setReminderDays(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={1}>1 day before</option>
                    <option value={3}>3 days before</option>
                    <option value={7}>7 days before</option>
                    <option value={14}>14 days before</option>
                  </select>
                </div>

                <button
                  onClick={handleSaveCustomizations}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <button
              onClick={handleCancel}
              disabled={isUpdating}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium rounded-lg transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Cancel Subscription
            </button>

            <div className="space-y-2">
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Snooze Reminder</div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleSnooze(30)}
                  disabled={isUpdating}
                  className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:bg-slate-50 dark:disabled:bg-slate-900 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg transition-colors"
                >
                  30 days
                </button>
                <button
                  onClick={() => handleSnooze(60)}
                  disabled={isUpdating}
                  className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:bg-slate-50 dark:disabled:bg-slate-900 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg transition-colors"
                >
                  60 days
                </button>
                <button
                  onClick={() => handleSnooze(90)}
                  disabled={isUpdating}
                  className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:bg-slate-50 dark:disabled:bg-slate-900 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg transition-colors"
                >
                  90 days
                </button>
              </div>
            </div>
          </div>

          {subscription.domain && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <a
                href={`https://${subscription.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
              >
                Visit {subscription.name}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

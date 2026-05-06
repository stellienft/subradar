import { useMemo } from 'react';
import { Lightbulb, AlertTriangle, TrendingDown, RefreshCw, Star, XCircle, Calendar, ArrowRight } from 'lucide-react';
import { normalizeToMonthly, formatCurrency, getDaysUntil } from '../lib/utils';
import type { Database } from '../lib/database.types';

type Subscription = Database['public']['Tables']['subscriptions']['Row'];

interface Insight {
  id: string;
  type: 'warning' | 'tip' | 'saving' | 'info';
  title: string;
  description: string;
  action?: string;
  subscriptionId?: string;
  value?: number;
}

interface InsightsPanelProps {
  subscriptions: Subscription[];
  onSelectSubscription?: (sub: Subscription) => void;
}

function generateInsights(subscriptions: Subscription[]): Insight[] {
  const insights: Insight[] = [];

  const totalMonthly = subscriptions.reduce((s, sub) => s + normalizeToMonthly(sub.amount, sub.billing_cycle), 0);

  const expensiveMonthlySubs = subscriptions.filter(sub => {
    const monthly = normalizeToMonthly(sub.amount, sub.billing_cycle);
    return sub.billing_cycle === 'monthly' && sub.amount > 30;
  });

  expensiveMonthlySubs.forEach(sub => {
    const annualSaving = sub.amount * 12 * 0.2;
    insights.push({
      id: `annual-switch-${sub.id}`,
      type: 'saving',
      title: `Switch ${sub.name} to annual`,
      description: `Most annual plans save ~20%. You could save around ${formatCurrency(annualSaving)}/year by switching ${sub.name} to an annual plan.`,
      action: 'View subscription',
      subscriptionId: sub.id,
      value: annualSaving,
    });
  });

  const trialSubs = subscriptions.filter(s => s.status === 'trial' && s.trial_ends_at);
  trialSubs.forEach(sub => {
    const days = getDaysUntil(sub.trial_ends_at!);
    if (days !== null && days >= 0 && days <= 7) {
      insights.push({
        id: `trial-ending-${sub.id}`,
        type: 'warning',
        title: `${sub.name} trial ends in ${days} day${days !== 1 ? 's' : ''}`,
        description: `Your free trial for ${sub.name} (${formatCurrency(sub.amount)}/${sub.billing_cycle}) is about to convert to a paid subscription. Cancel now if you don't want to be charged.`,
        action: 'Manage subscription',
        subscriptionId: sub.id,
      });
    }
  });

  const dueSoon = subscriptions.filter(sub => {
    const days = getDaysUntil(sub.next_payment_date);
    return days !== null && days >= 0 && days <= 3;
  });
  if (dueSoon.length > 0) {
    const totalDue = dueSoon.reduce((s, sub) => s + sub.amount, 0);
    insights.push({
      id: 'payments-due-soon',
      type: 'warning',
      title: `${dueSoon.length} payment${dueSoon.length !== 1 ? 's' : ''} due in the next 3 days`,
      description: `${dueSoon.map(s => s.name).join(', ')} will charge a combined ${formatCurrency(totalDue)} within 3 days. Make sure your payment method is up to date.`,
      value: totalDue,
    });
  }

  const streamingSubs = subscriptions.filter(s => s.category === 'Streaming');
  if (streamingSubs.length >= 3) {
    const streamingTotal = streamingSubs.reduce((s, sub) => s + normalizeToMonthly(sub.amount, sub.billing_cycle), 0);
    insights.push({
      id: 'streaming-overload',
      type: 'tip',
      title: `You have ${streamingSubs.length} streaming services`,
      description: `You're spending ${formatCurrency(streamingTotal)}/month on streaming alone (${streamingSubs.map(s => s.name).join(', ')}). Consider rotating services to reduce costs.`,
      value: streamingTotal,
    });
  }

  const saasHeavy = subscriptions.filter(s => s.category === 'SaaS');
  if (saasHeavy.length >= 4) {
    const saasTotal = saasHeavy.reduce((s, sub) => s + normalizeToMonthly(sub.amount, sub.billing_cycle), 0);
    insights.push({
      id: 'saas-audit',
      type: 'tip',
      title: 'Time for a SaaS audit',
      description: `You have ${saasHeavy.length} SaaS tools costing ${formatCurrency(saasTotal)}/month. Review which ones you actively use — unused tools are easy savings.`,
      value: saasTotal,
    });
  }

  const annualSubs = subscriptions.filter(s => s.billing_cycle === 'annual' || s.billing_cycle === 'yearly');
  if (annualSubs.length > 0) {
    const renewingSoon = annualSubs.filter(s => {
      const days = getDaysUntil(s.next_payment_date);
      return days !== null && days >= 0 && days <= 30;
    });
    renewingSoon.forEach(sub => {
      insights.push({
        id: `annual-renewal-${sub.id}`,
        type: 'info',
        title: `${sub.name} annual renewal coming up`,
        description: `Your ${sub.name} annual plan renews for ${formatCurrency(sub.amount)} within 30 days. This is a good time to review if you still need it.`,
        action: 'View subscription',
        subscriptionId: sub.id,
        value: sub.amount,
      });
    });
  }

  if (totalMonthly > 200) {
    insights.push({
      id: 'high-spend',
      type: 'warning',
      title: 'High subscription spend detected',
      description: `You're spending ${formatCurrency(totalMonthly)}/month (${formatCurrency(totalMonthly * 12)}/year) on subscriptions. Consider reviewing and cancelling services you don't actively use.`,
      value: totalMonthly,
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: 'all-good',
      type: 'info',
      title: 'Your subscriptions look healthy',
      description: `You have ${subscriptions.length} active subscription${subscriptions.length !== 1 ? 's' : ''} totalling ${formatCurrency(totalMonthly)}/month. No immediate action needed.`,
    });
  }

  return insights;
}

const INSIGHT_STYLES: Record<Insight['type'], { bg: string; border: string; icon: typeof Lightbulb; iconColor: string }> = {
  warning: { bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', icon: AlertTriangle, iconColor: 'text-amber-500' },
  saving: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800', icon: TrendingDown, iconColor: 'text-emerald-500' },
  tip: { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', icon: Lightbulb, iconColor: 'text-blue-500' },
  info: { bg: 'bg-slate-50 dark:bg-slate-800', border: 'border-slate-200 dark:border-slate-700', icon: Star, iconColor: 'text-slate-400' },
};

export function InsightsPanel({ subscriptions, onSelectSubscription }: InsightsPanelProps) {
  const insights = useMemo(() => generateInsights(subscriptions), [subscriptions]);

  const subMap = useMemo(() => {
    const map: Record<string, Subscription> = {};
    subscriptions.forEach(s => { map[s.id] = s; });
    return map;
  }, [subscriptions]);

  const totalPotentialSavings = insights
    .filter(i => i.type === 'saving')
    .reduce((s, i) => s + (i.value || 0), 0);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Smart Insights</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{insights.length} recommendation{insights.length !== 1 ? 's' : ''} for you</p>
          </div>
        </div>
        {totalPotentialSavings > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
            <TrendingDown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              Save up to {formatCurrency(totalPotentialSavings)}/yr
            </span>
          </div>
        )}
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {insights.map(insight => {
          const style = INSIGHT_STYLES[insight.type];
          const Icon = style.icon;
          const linkedSub = insight.subscriptionId ? subMap[insight.subscriptionId] : null;

          return (
            <div key={insight.id} className={`p-5 ${style.bg} border-l-4 ${style.border}`}>
              <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${style.iconColor}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">{insight.title}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{insight.description}</p>
                  {insight.action && linkedSub && onSelectSubscription && (
                    <button
                      onClick={() => onSelectSubscription(linkedSub)}
                      className="mt-2 flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                    >
                      {insight.action}
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
                {insight.value && insight.type === 'saving' && (
                  <div className="flex-shrink-0 text-right">
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      -{formatCurrency(insight.value)}
                    </p>
                    <p className="text-xs text-slate-400">potential/yr</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

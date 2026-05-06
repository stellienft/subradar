import { supabase } from './supabase';
import { normalizeToMonthly } from './utils';
import type { Database } from './database.types';

type Subscription = Database['public']['Tables']['subscriptions']['Row'];

function flattenForExport(subscriptions: Subscription[]) {
  return subscriptions.map(sub => ({
    id: sub.id,
    name: sub.name,
    category: sub.custom_category || sub.category,
    amount: sub.amount,
    currency: sub.currency,
    billing_cycle: sub.billing_cycle,
    monthly_equivalent: normalizeToMonthly(sub.amount, sub.billing_cycle).toFixed(2),
    status: sub.status,
    next_payment_date: sub.next_payment_date || '',
    first_detected_at: sub.first_detected_at,
    domain: sub.domain || '',
    cancellation_url: sub.cancellation_url || '',
    notes: (sub as any).notes || '',
  }));
}

export function exportAsCSV(subscriptions: Subscription[], filename = 'subscriptions.csv') {
  const rows = flattenForExport(subscriptions);
  if (rows.length === 0) return;

  const headers = Object.keys(rows[0]);
  const csvLines = [
    headers.join(','),
    ...rows.map(row =>
      headers.map(h => {
        const val = String((row as any)[h] ?? '');
        return val.includes(',') || val.includes('"') ? `"${val.replace(/"/g, '""')}"` : val;
      }).join(',')
    ),
  ];

  const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportAsJSON(subscriptions: Subscription[], filename = 'subscriptions.json') {
  const rows = flattenForExport(subscriptions);
  const blob = new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export async function logExport(userId: string, format: 'csv' | 'json', count: number) {
  await supabase.from('export_logs').insert({
    user_id: userId,
    export_format: format,
    record_count: count,
  });
}

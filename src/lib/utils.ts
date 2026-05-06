import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function normalizeToMonthly(amount: number, cycle: string): number {
  switch (cycle.toLowerCase()) {
    case 'annual':
    case 'yearly':
      return amount / 12;
    case 'weekly':
      return amount * 4.33;
    case 'monthly':
    default:
      return amount;
  }
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function getDaysUntil(dateString: string | null): number {
  if (!dateString) return Infinity;
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  const diffTime = date.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getUrgencyColor(daysUntil: number): string {
  if (daysUntil <= 7) return 'text-red-600 bg-red-50 border-red-200';
  if (daysUntil <= 30) return 'text-amber-600 bg-amber-50 border-amber-200';
  return 'text-green-600 bg-green-50 border-green-200';
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'Streaming': 'bg-teal-100 text-teal-700 border-teal-200',
    'SaaS': 'bg-blue-100 text-blue-700 border-blue-200',
    'Health': 'bg-purple-100 text-purple-700 border-purple-200',
    'Finance': 'bg-amber-100 text-amber-700 border-amber-200',
    'News': 'bg-rose-100 text-rose-700 border-rose-200',
    'Cloud': 'bg-sky-100 text-sky-700 border-sky-200',
    'Education': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  };
  return colors[category] || 'bg-gray-100 text-gray-700 border-gray-200';
}

export function getLogoUrl(domain: string | null): string {
  if (!domain) return '';
  return `https://logo.clearbit.com/${domain}`;
}

export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

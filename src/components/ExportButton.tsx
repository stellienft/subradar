import { useState } from 'react';
import { Download, ChevronDown, FileText, FileJson } from 'lucide-react';
import { exportAsCSV, exportAsJSON, logExport } from '../lib/export';
import { useAuth } from '../contexts/AuthContext';
import type { Database } from '../lib/database.types';

type Subscription = Database['public']['Tables']['subscriptions']['Row'];

interface ExportButtonProps {
  subscriptions: Subscription[];
}

export function ExportButton({ subscriptions }: ExportButtonProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExport = async (format: 'csv' | 'json') => {
    if (!user || exporting) return;
    setExporting(true);
    setOpen(false);
    try {
      const date = new Date().toISOString().split('T')[0];
      if (format === 'csv') {
        exportAsCSV(subscriptions, `subscriptions-${date}.csv`);
      } else {
        exportAsJSON(subscriptions, `subscriptions-${date}.json`);
      }
      await logExport(user.id, format, subscriptions.length);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={exporting || subscriptions.length === 0}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Download className="w-4 h-4" />
        Export
        <ChevronDown className="w-3.5 h-3.5" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-20 overflow-hidden">
            <button
              onClick={() => handleExport('csv')}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <FileText className="w-4 h-4 text-emerald-500" />
              Export as CSV
            </button>
            <button
              onClick={() => handleExport('json')}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <FileJson className="w-4 h-4 text-blue-500" />
              Export as JSON
            </button>
          </div>
        </>
      )}
    </div>
  );
}

import { Mail, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { FunctionsHttpError } from '@supabase/supabase-js';

export function GmailConnection() {
  const { user } = useAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState<Date | null>(null);
  const [hasGmailAccess, setHasGmailAccess] = useState(false);

  useEffect(() => {
    checkGmailAccess();
  }, [user]);

  const checkGmailAccess = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const hasToken = !!session?.provider_token;
    console.log('Gmail access check:', {
      hasSession: !!session,
      hasProviderToken: hasToken,
      hasProviderRefreshToken: !!session?.provider_refresh_token,
      provider: session?.user?.app_metadata?.provider,
      providerTokenLength: session?.provider_token?.length || 0,
    });
    setHasGmailAccess(hasToken);
  };

  const handleScanGmail = async () => {
    if (!user) return;

    setIsScanning(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      console.log('Session data:', {
        hasSession: !!session,
        hasProviderToken: !!session?.provider_token,
        provider: session?.user?.app_metadata?.provider
      });

      if (!session?.provider_token) {
        console.error('No provider token found. Session:', {
          hasSession: !!session,
          provider: session?.user?.app_metadata?.provider,
          hasProviderRefreshToken: !!session?.provider_refresh_token,
        });
        throw new Error('Gmail access token not found. Please sign out and sign in again to grant Gmail permissions.');
      }

      console.log('Provider token found, length:', session.provider_token.length);

      console.log('Calling scan-gmail function...');
      const { data, error } = await supabase.functions.invoke('scan-gmail', {
        body: {
          access_token: session.provider_token
        },
      });

      console.log('Function response:', { data, error });

      if (error && error instanceof FunctionsHttpError) {
        const errorMessage = await error.context.json();
        console.log('Function returned an error:', errorMessage);
        throw new Error(errorMessage.error || 'Failed to scan Gmail');
      }

      if (error) throw error;

      if (data?.success === false) {
        throw new Error(data.error || 'Failed to scan Gmail');
      }

      setLastScan(new Date());
      alert(`Successfully found ${data.count} subscriptions!`);
      window.location.reload();
    } catch (error) {
      console.error('Error scanning Gmail:', error);
      alert(error instanceof Error ? error.message : 'Failed to scan Gmail. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Gmail Connection</h2>
            {hasGmailAccess ? (
              <CheckCircle className="w-4 h-4 text-teal-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-600" />
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {user?.email || 'Connected'}
          </p>
          {!hasGmailAccess && (
            <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
              Gmail access not granted. Sign out and sign in again.
            </p>
          )}
          {lastScan && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Last scanned: {lastScan.toLocaleTimeString()}
            </p>
          )}
        </div>
        <button
          onClick={handleScanGmail}
          disabled={isScanning || !hasGmailAccess}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isScanning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <Mail className="w-4 h-4" />
              Scan Gmail
            </>
          )}
        </button>
      </div>
    </div>
  );
}

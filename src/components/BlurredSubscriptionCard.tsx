import { Lock } from 'lucide-react';

export function BlurredSubscriptionCard() {
  return (
    <div className="relative bg-white rounded-xl p-6 border border-slate-200 overflow-hidden">
      <div className="filter blur-sm pointer-events-none select-none">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-200 rounded-lg"></div>
            <div>
              <div className="h-5 w-32 bg-slate-200 rounded mb-2"></div>
              <div className="h-4 w-20 bg-slate-100 rounded"></div>
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <div className="h-4 w-24 bg-slate-100 rounded"></div>
            <div className="h-4 w-16 bg-slate-200 rounded"></div>
          </div>
          <div className="flex justify-between">
            <div className="h-4 w-28 bg-slate-100 rounded"></div>
            <div className="h-4 w-20 bg-slate-200 rounded"></div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <div className="h-4 w-full bg-slate-100 rounded"></div>
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-white/70 to-white/90 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
          <Lock className="w-6 h-6 text-slate-400" />
        </div>
        <p className="text-sm font-medium text-slate-600">Upgrade to view</p>
      </div>
    </div>
  );
}

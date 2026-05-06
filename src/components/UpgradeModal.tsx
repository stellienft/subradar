import { X, Crown, Check, Sparkles } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  hiddenCount?: number;
}

export function UpgradeModal({ isOpen, onClose, onUpgrade, hiddenCount }: UpgradeModalProps) {
  if (!isOpen) return null;

  const premiumFeatures = [
    'Unlimited subscription tracking',
    'Unlimited email accounts',
    'Advanced analytics and insights',
    'Export data to CSV/JSON',
    'Priority email support',
    'Early access to new features',
    'Custom categories and tags',
    'Payment reminder notifications',
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Upgrade to Premium</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {hiddenCount && hiddenCount > 0 && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900">
                    You have {hiddenCount} subscription{hiddenCount !== 1 ? 's' : ''} hidden
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    Upgrade now to see all your subscriptions and take full control of your spending
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div className="border-2 border-slate-200 rounded-xl p-6">
              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Free</div>
              <div className="text-3xl font-bold text-slate-900 mb-4">$0<span className="text-lg font-normal text-slate-500">/month</span></div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-sm text-slate-600">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>1 email account</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-600">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>10 visible subscriptions</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-600">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Basic subscription tracking</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-600">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Community support</span>
                </li>
              </ul>
            </div>

            <div className="border-2 border-teal-500 rounded-xl p-6 bg-teal-50 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                BEST VALUE
              </div>
              <div className="text-sm font-semibold text-teal-600 uppercase tracking-wide mb-2">Premium</div>
              <div className="text-3xl font-bold text-slate-900 mb-4">$20<span className="text-lg font-normal text-slate-500">/month</span></div>
              <ul className="space-y-3">
                {premiumFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-slate-700">
                    <Check className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <p className="text-sm text-slate-600 text-center">
              <span className="font-semibold text-slate-900">Join 1,000+ users</span> who are taking control of their subscription spending with SubRadar Premium
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
            >
              Maybe Later
            </button>
            <button
              onClick={onUpgrade}
              className="flex-1 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Crown className="w-5 h-5" />
              Upgrade Now
            </button>
          </div>

          <p className="text-xs text-center text-slate-500">
            Cancel anytime. No questions asked. 14-day money-back guarantee.
          </p>
        </div>
      </div>
    </div>
  );
}

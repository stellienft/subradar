import { Mail, TrendingUp, Bell, Shield, Sparkles, Check, DollarSign, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';

export function LoginPage() {
  const { signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const target = 247;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setAnimatedValue(target);
        clearInterval(timer);
      } else {
        setAnimatedValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, []);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Error signing in:', error);
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: TrendingUp,
      title: 'Track All Subscriptions',
      description: 'Automatically detect and monitor all your recurring payments',
      bg: 'bg-blue-50',
      iconColor: 'text-blue-500',
    },
    {
      icon: Bell,
      title: 'Never Miss a Payment',
      description: 'Get smart reminders before your next billing date',
      bg: 'bg-emerald-50',
      iconColor: 'text-emerald-500',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Bank-level encryption keeps your financial data safe',
      bg: 'bg-rose-50',
      iconColor: 'text-rose-500',
    },
  ];

  const exampleSubscriptions = [
    { name: 'Netflix', amount: 15.99, color: 'bg-black', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg', svg: null },
    { name: 'Spotify', amount: 9.99, color: 'bg-black', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg', svg: null },
    {
      name: 'Adobe', amount: 54.99, color: 'bg-[#FF0000]', logo: null,
      svg: (
        <svg viewBox="0 0 240 234" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path d="M42.5 0h65L240 234h-65z" fill="#fff"/>
          <path d="M197.5 0h-65L0 234h65z" fill="#fff"/>
          <path d="M88 152h64l20 82H68z" fill="#fff"/>
        </svg>
      )
    },
    { name: 'ChatGPT', amount: 20.00, color: 'bg-[#10a37f]', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg', svg: null },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 overflow-x-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-100/30 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-100/20 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3"></div>
      </div>

      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-20">

          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">

            {/* Left column */}
            <div className="flex flex-col items-center lg:items-start gap-6 sm:gap-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 px-4 py-2 rounded-full">
                <Sparkles className="w-4 h-4 text-teal-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-teal-700">Stop overspending on subscriptions</span>
              </div>

              <div className="w-full">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-slate-900 mb-4 leading-[1.1]">
                  Take Control of Your
                  <span className="block bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">
                    Subscriptions
                  </span>
                </h1>
                <p className="text-base sm:text-lg lg:text-xl text-slate-500 leading-relaxed max-w-xl mx-auto lg:mx-0">
                  Discover hidden subscriptions, track spending, and save money. SubRadar automatically finds all your recurring payments in one place.
                </p>
              </div>

              {/* Stats card */}
              <div className="w-full bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-sm font-medium">Monthly Spending</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-slate-400">Live</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <DollarSign className="w-7 h-7 sm:w-8 sm:h-8 text-teal-500" />
                  <span className="text-4xl sm:text-5xl font-bold text-slate-900">{animatedValue}</span>
                  <span className="text-xl sm:text-2xl text-slate-400">.00</span>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Active Subscriptions</p>
                    <p className="text-xl sm:text-2xl font-bold text-slate-900">12</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Potential Savings</p>
                    <p className="text-xl sm:text-2xl font-bold text-emerald-500">$89</p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="w-full flex flex-col items-center lg:items-start gap-3">
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 disabled:opacity-70 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30 hover:scale-[1.02] overflow-hidden"
                >
                  <Mail className="w-5 h-5 flex-shrink-0" />
                  <span>{isLoading ? 'Connecting...' : 'Get Started with Gmail'}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none"></div>
                </button>
                <p className="text-sm text-slate-400 flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-500 flex-shrink-0" />
                  Free to start &bull; No credit card required
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-teal-500 flex-shrink-0" />
                  <span>Bank-level security</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-500 flex-shrink-0" />
                  <span>1,000+ users</span>
                </div>
              </div>
            </div>

            {/* Right column — hidden on small mobile, shown from md up */}
            <div className="hidden md:block relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-3xl blur-3xl opacity-10 pointer-events-none"></div>

              <div className="relative space-y-4">
                {/* Subscriptions list */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-slate-800 font-semibold">Active Subscriptions</h3>
                    <Calendar className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="space-y-2.5">
                    {exampleSubscriptions.map((sub, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors duration-200 group"
                        style={{ animation: `slideIn 0.5s ease-out ${index * 0.1}s both` }}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 ${sub.color} rounded-lg overflow-hidden flex items-center justify-center shadow-sm p-1.5`}>
                            {sub.svg ? sub.svg : (
                              <img src={sub.logo!} alt={sub.name} className="w-full h-full object-contain" />
                            )}
                          </div>
                          <span className="text-slate-700 font-medium group-hover:text-teal-600 transition-colors truncate">{sub.name}</span>
                        </div>
                        <span className="text-slate-800 font-semibold flex-shrink-0 ml-2">${sub.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Feature cards */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className={`bg-white border rounded-xl p-3 sm:p-4 transition-all duration-500 shadow-sm ${
                        activeFeature === index
                          ? 'border-teal-300 scale-105 shadow-md shadow-teal-100'
                          : 'border-slate-200'
                      }`}
                    >
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 ${feature.bg} rounded-lg flex items-center justify-center mb-2 sm:mb-3`}>
                        <feature.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${feature.iconColor}`} />
                      </div>
                      <h4 className="text-slate-800 text-xs sm:text-sm font-semibold mb-1 leading-snug">{feature.title}</h4>
                      <p className="text-slate-500 text-xs leading-relaxed hidden sm:block">{feature.description}</p>
                    </div>
                  ))}
                </div>

                {/* Insight banner */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5 sm:p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="text-slate-800 font-semibold mb-1 sm:mb-2">Smart Insights</h4>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        You could save <span className="text-emerald-600 font-bold">$89/month</span> by canceling unused subscriptions
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats bar — always visible */}
          <div className="mt-14 sm:mt-16 lg:mt-20 border-t border-slate-200 pt-10 sm:pt-12">
            <div className="grid grid-cols-3 gap-4 sm:gap-8 text-center">
              <div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-1">$2.5M+</div>
                <div className="text-xs sm:text-sm text-slate-500">Spending tracked</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-1">15,000+</div>
                <div className="text-xs sm:text-sm text-slate-500">Subscriptions found</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-1">1,000+</div>
                <div className="text-xs sm:text-sm text-slate-500">Happy users</div>
              </div>
            </div>
          </div>

          {/* Mobile-only feature list */}
          <div className="md:hidden mt-10 space-y-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-4 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <div className={`w-10 h-10 flex-shrink-0 ${feature.bg} rounded-lg flex items-center justify-center`}>
                  <feature.icon className={`w-5 h-5 ${feature.iconColor}`} />
                </div>
                <div>
                  <h4 className="text-slate-800 text-sm font-semibold mb-0.5">{feature.title}</h4>
                  <p className="text-slate-500 text-xs leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

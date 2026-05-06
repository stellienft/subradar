import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Filter } from 'lucide-react';

const categories = [
  { id: 'all', label: 'All' },
  { id: 'streaming', label: 'Streaming' },
  { id: 'apps_tools', label: 'Apps & Tools' },
  { id: 'cloud', label: 'Cloud' },
  { id: 'health', label: 'Health' },
  { id: 'security', label: 'Security' },
  { id: 'transport', label: 'Transport' },
  { id: 'utilities', label: 'Utilities' },
  { id: 'other', label: 'Other' },
];

export function CategoryFilters() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeLabel = categories.find(c => c.id === activeCategory)?.label ?? 'All';

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-slate-600 dark:text-slate-400 flex-shrink-0 flex items-center gap-1.5">
        <Filter className="w-3.5 h-3.5" />
        Filter:
      </span>

      {/* Mobile: dropdown */}
      <div className="relative sm:hidden flex-1" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-full flex items-center justify-between gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          <span>{activeLabel}</span>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {dropdownOpen && (
          <div className="absolute left-0 right-0 mt-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden z-30">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => { setActiveCategory(category.id); setDropdownOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                  activeCategory === category.id
                    ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 font-medium'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Desktop: pill buttons */}
      <div className="hidden sm:flex items-center gap-2 flex-wrap">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeCategory === category.id
                ? 'bg-teal-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>
    </div>
  );
}

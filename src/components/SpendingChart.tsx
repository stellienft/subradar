import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { subMonths, format } from 'date-fns';
import { normalizeToMonthly } from '../lib/utils';
import type { Database } from '../lib/database.types';

type Subscription = Database['public']['Tables']['subscriptions']['Row'];

interface SpendingChartProps {
  subscriptions: Subscription[];
}

export function SpendingChart({ subscriptions }: SpendingChartProps) {
  const generateChartData = () => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      months.push({
        month: format(date, 'MMM yy'),
        spend: subscriptions.reduce((sum, sub) => {
          return sum + normalizeToMonthly(sub.amount, sub.billing_cycle);
        }, 0),
      });
    }
    return months;
  };

  const data = generateChartData();
  const currentSpend = data[data.length - 1]?.spend || 0;
  const previousSpend = data[data.length - 2]?.spend || 0;
  const changePercent = previousSpend > 0
    ? ((currentSpend - previousSpend) / previousSpend * 100).toFixed(1)
    : '0.0';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-1">Spending Trends</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Monthly subscription cost over time</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">${currentSpend.toFixed(0)}</div>
          <p className="text-xs text-slate-500 dark:text-slate-400">{changePercent}% from last month</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:opacity-20" vertical={false} />
          <XAxis
            dataKey="month"
            stroke="#94a3b8"
            className="dark:opacity-70"
            style={{ fontSize: '11px' }}
            axisLine={false}
            tickLine={false}
            dy={10}
          />
          <YAxis
            stroke="#94a3b8"
            className="dark:opacity-70"
            style={{ fontSize: '11px' }}
            tickFormatter={(value) => `$${value}`}
            axisLine={false}
            tickLine={false}
            dx={-10}
            domain={[0, 'dataMax + 500']}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '12px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Spend']}
          />
          <Line
            type="monotone"
            dataKey="spend"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ fill: '#3b82f6', r: 5, strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

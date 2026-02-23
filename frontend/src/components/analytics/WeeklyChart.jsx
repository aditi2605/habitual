import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';

const WeeklyChart = ({ data }) => {
  const COLORS = {
    high: '#6db85c',
    medium: '#e8c46a',
    low: '#e87a6a',
  };

  const getColor = (pct) => {
    if (pct >= 80) return COLORS.high;
    if (pct >= 50) return COLORS.medium;
    return COLORS.low;
  };

  return (
    <div className="bg-surface border border-border rounded-2xl p-6">
      <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-4">
        This Week — Completion %
      </h3>
      <ResponsiveContainer width="100%" height={120}>
        <BarChart data={data}>
          <XAxis 
            dataKey="day_short" 
            axisLine={false} 
            tickLine={false}
            tick={{ fill: '#9ca3af', fontSize: 11 }}
          />
          <YAxis hide />
          <Bar dataKey="completion_percentage" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.completion_percentage)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklyChart;
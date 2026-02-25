import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';

const MonthlyTrendChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-2xl p-6">
        <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-4">
          📈 Monthly Trend
        </h3>
        <div className="h-48 flex items-center justify-center text-gray-500 text-sm">
          Log habits for a few days to see trends
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm uppercase tracking-wider text-gray-500">
          📈 Monthly Trend
        </h3>
        <div className="text-sm text-gray-500">
          Avg: <span className="text-green-light font-semibold">
            {Math.round(data.reduce((acc, w) => acc + w.completion_percentage, 0) / data.length)}%
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <defs>
            <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6db85c" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#6db85c" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a1d1a" opacity={0.3} />
          <XAxis 
            dataKey="week" 
            stroke="#6db85c"
            style={{ fontSize: '11px', fontFamily: 'monospace' }}
            tickLine={false}
          />
          <YAxis 
            stroke="#6db85c"
            style={{ fontSize: '11px', fontFamily: 'monospace' }}
            tickLine={false}
            domain={[0, 100]}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#0f110f', 
              border: '1px solid #6db85c',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            labelStyle={{ color: '#9dd48e' }}
            itemStyle={{ color: '#9dd48e' }}
          />
          <Line 
            type="monotone" 
            dataKey="completion_percentage" 
            stroke="#6db85c" 
            strokeWidth={3}
            fill="url(#colorGreen)"
            dot={{ fill: '#9dd48e', r: 4, strokeWidth: 2, stroke: '#0f110f' }}
            activeDot={{ r: 6, fill: '#6db85c', stroke: '#9dd48e', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyTrendChart;

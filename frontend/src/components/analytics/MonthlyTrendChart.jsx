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
      <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-4">
        📈 Monthly Trend
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <defs>
            <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6db85c" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#6db85c" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#242824" />
          <XAxis 
            dataKey="week" 
            stroke="#6db85c"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#6db85c"
            style={{ fontSize: '12px' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#121512', 
              border: '1px solid #6db85c',
              borderRadius: '8px'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="completion_percentage" 
            stroke="#6db85c" 
            strokeWidth={3}
            fill="url(#colorGreen)"
            dot={{ fill: '#9dd48e', r: 5 }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyTrendChart;
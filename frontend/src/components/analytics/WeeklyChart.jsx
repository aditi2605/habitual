const WeeklyChart = ({ data }) => {
  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map(d => d.completion_percentage));

  return (
    <div className="bg-surface border border-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xs uppercase tracking-wider text-gray-500">📈 Weekly Progress</h3>
        <div className="text-sm text-gray-500">
          Avg: <span className="text-green-light font-semibold">
            {Math.round(data.reduce((acc, d) => acc + d.completion_percentage, 0) / data.length)}%
          </span>
        </div>
      </div>

      <div className="flex items-end justify-between gap-3 h-64 mb-4">
        {data.map((day, index) => {
          const isToday = index === data.length - 1;
          const height = day.completion_percentage;
          const barColor = height === 100 
            ? 'from-green to-green-light' 
            : height >= 75 
            ? 'from-green/80 to-green-light/80'
            : height >= 50
            ? 'from-amber to-amber/80'
            : 'from-coral to-coral/80';

          return (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-3 group">
              <div className="flex-1 w-full flex items-end justify-center relative">
                <div
                  className={`w-full rounded-t-xl transition-all duration-500 bg-gradient-to-t ${barColor} ${
                    isToday ? 'shadow-lg shadow-green/30' : ''
                  } relative overflow-hidden`}
                  style={{ height: `${height}%`, minHeight: '8px' }}
                >
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  {/* Percentage tooltip */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-bg border border-border rounded-lg px-2 py-1 text-xs font-semibold whitespace-nowrap">
                      {height}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Day labels */}
              <div className="text-center">
                <div className={`text-xs uppercase tracking-wider mb-1 ${
                  isToday ? 'text-green-light font-semibold' : 'text-gray-500'
                }`}>
                  {isToday ? 'Today' : day.day_short}
                </div>
                <div className="text-xs text-gray-600">{day.date.split('-')[2]}</div>
                
                {/* Completion indicator */}
                <div className="mt-2">
                  {height === 100 ? (
                    <span className="text-xs">✓</span>
                  ) : height === 0 ? (
                    <span className="text-xs text-coral">○</span>
                  ) : (
                    <span className="text-xs text-amber">◐</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-xs text-gray-500 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green to-green-light" />
          <span>100%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-amber to-amber/80" />
          <span>50-99%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-coral to-coral/80" />
          <span>&lt;50%</span>
        </div>
      </div>
    </div>
  );
};

export default WeeklyChart;
const ProgressRing = ({ percentage, completed, total }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-surface border border-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs uppercase tracking-wider text-gray-500">
          Today's Progress
        </h3>
        <div className="text-xs text-gray-500">
          {completed}/{total} habits
        </div>
      </div>
      
      <div className="relative w-40 h-40 mx-auto mb-6">
        <svg className="transform -rotate-90 w-full h-full">
          {/* Background circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="#1a1d1a"
            strokeWidth="12"
          />
          {/* Progress circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth="5"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{
              filter: 'drop-shadow(0 0 8px rgba(109, 184, 92, 0.5))'
            }}
          />
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6db85c" />
              <stop offset="100%" stopColor="#9dd48e" />
            </linearGradient>
          </defs>
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-3xl font-bold text-green-light mb-1">
            {percentage}%
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">
            Complete
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="p-3 bg-bg rounded-xl">
          <div className="text-xl font-bold text-green-light">{completed}</div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Done</div>
        </div>
        <div className="p-3 bg-bg rounded-xl">
          <div className="text-xl font-bold text-amber">{total - completed}</div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Left</div>
        </div>
        <div className="p-3 bg-bg rounded-xl">
          <div className="text-xl font-bold text-green">{total}</div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Total</div>
        </div>
      </div>
    </div>
  );
};

export default ProgressRing;
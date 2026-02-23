const ProgressRing = ({ percentage, completed, total }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col items-center">
      <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-4 self-start">
        Today's Progress
      </h3>
      
      <div className="relative w-32 h-32 mb-4">
        <svg className="transform -rotate-90 w-full h-full">
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke="#242824"
            strokeWidth="10"
          />
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3a7a2a" />
              <stop offset="100%" stopColor="#9dd48e" />
            </linearGradient>
          </defs>
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-3xl font-serif text-green-light">{percentage}%</div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Done</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 w-full text-center text-sm">
        <div>
          <div className="font-semibold text-green-light">{completed}</div>
          <div className="text-xs text-gray-500 uppercase">Done</div>
        </div>
        <div>
          <div className="font-semibold text-amber">{total - completed}</div>
          <div className="text-xs text-gray-500 uppercase">Left</div>
        </div>
        <div>
          <div className="font-semibold text-amber">🔥 12</div>
          <div className="text-xs text-gray-500 uppercase">Streak</div>
        </div>
      </div>
    </div>
  );
};

export default ProgressRing;
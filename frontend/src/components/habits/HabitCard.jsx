import { useState } from 'react';
import { Check } from 'lucide-react';

const HabitCard = ({ habit, onToggle, onEdit, onDelete }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);
    await onToggle(habit.id);
    setIsLoading(false);
  };

  return (
    <div 
      className={`bg-surface border rounded-2xl p-4 flex items-center gap-4 transition-all hover:bg-surface/80 cursor-pointer ${
        habit.completed_today ? 'border-green/40 bg-green/5' : 'border-border'
      }`}
      style={{ borderLeftColor: habit.color, borderLeftWidth: '4px' }}
    >
      <div 
        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
        style={{ backgroundColor: habit.color + '20' }}
      >
        {habit.icon}
      </div>

      <div className="flex-1">
        <h3 className={`font-medium ${habit.completed_today ? 'line-through text-gray-500' : ''}`}>
          {habit.name}
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">
          {habit.target_time || 'Anytime'} • Streak: {habit.current_streak} 🔥
        </p>
      </div>

      {habit.current_streak > 0 && (
        <div className="text-sm font-semibold text-amber flex items-center gap-1">
          🔥 {habit.current_streak}
        </div>
      )}

      <button
        onClick={handleToggle}
        disabled={isLoading || habit.completed_today}
        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition ${
          habit.completed_today
            ? 'bg-green border-green text-bg'
            : 'border-border hover:border-green'
        }`}
      >
        {habit.completed_today && <Check size={16} strokeWidth={3} />}
      </button>
    </div>
  );
};

export default HabitCard;
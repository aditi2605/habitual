import { useState } from 'react';

const HabitCard = ({ habit, onToggle, onDelete }) => {
  const [isCompleting, setIsCompleting] = useState(false);

  const handleToggle = async () => {
    setIsCompleting(true);
    await onToggle(habit.id);
    // Card will disappear via parent re-render after completion
  };

  if (habit.completed_today && isCompleting) {
    return null; // Hide completed habits immediately
  }

  return (
    <div className="flex items-center gap-4 flex-1">
      {/* Checkbox */}
      <button
        onClick={handleToggle}
        disabled={isCompleting}
        className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
          habit.completed_today
            ? 'bg-green border-green'
            : 'border-gray-700 hover:border-green'
        } ${isCompleting ? 'opacity-50' : ''}`}
      >
        {habit.completed_today && <span className="text-white text-sm">✓</span>}
      </button>

      {/* Icon & Info */}
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl">{habit.icon || '⚡'}</span>
          <div className="flex-1">
            <h3 className={`font-medium ${habit.completed_today ? 'line-through text-gray-600' : ''}`}>
              {habit.name}
            </h3>
            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
              {habit.reminder_time && (
                <span className="flex items-center gap-1">
                  ⏰ {habit.reminder_time}
                </span>
              )}
              <span className="flex items-center gap-1">
                🔥 {habit.current_streak || 0} day streak
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="flex-shrink-0">
        {habit.completed_today ? (
          <span className="text-green text-sm font-semibold">Done ✓</span>
        ) : (
          <span className="text-gray-600 text-sm">Pending</span>
        )}
      </div>
    </div>
  );
};

export default HabitCard;
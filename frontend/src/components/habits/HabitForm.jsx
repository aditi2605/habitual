import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const EMOJI_OPTIONS = ['🧘', '💧', '📖', '🏃', '🍎', '💪', '🎯', '✍️', '🌱', '☕', '🚴', '🧠', '😴', '🎨', '🎵'];
const COLOR_OPTIONS = ['#6db85c', '#60a5fa', '#e8c46a', '#e87a6a', '#c084fc', '#34d399'];

const HABIT_SUGGESTIONS = [
  { name: 'Morning Meditation', icon: '🧘', time: '7:00 AM', frequency: 'daily' },
  { name: 'Drink 8 Glasses of Water', icon: '💧', time: '9:00 AM', frequency: 'daily' },
  { name: 'Read 20 Pages', icon: '📖', time: '9:00 PM', frequency: 'daily' },
  { name: 'Evening Run', icon: '🏃', time: '6:00 PM', frequency: 'daily' },
  { name: 'No Junk Food', icon: '🍎', time: '', frequency: 'daily' },
  { name: 'Gym Workout', icon: '💪', time: '6:00 AM', frequency: 'daily' },
];

// iOS-Style Time Picker Component
const IOSTimePicker = ({ value, onChange, onClose }) => {
  const [hour, setHour] = useState('7');
  const [minute, setMinute] = useState('00');
  const [period, setPeriod] = useState('AM');

  useEffect(() => {
    if (value) {
      const match = value.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (match) {
        setHour(match[1]);
        setMinute(match[2]);
        setPeriod(match[3].toUpperCase());
      }
    }
  }, [value]);

  const handleDone = () => {
    onChange(`${hour}:${minute} ${period}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50" onClick={onClose}>
      <div 
        className="bg-surface border-t border-border rounded-t-3xl w-full max-w-md pb-safe"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <button onClick={onClose} className="text-green font-medium">Cancel</button>
          <div className="font-semibold">Set Time</div>
          <button onClick={handleDone} className="text-green font-semibold">Done</button>
        </div>

        {/* Picker Wheels */}
        <div className="flex items-center justify-center py-6 gap-2">
          {/* Hour Picker */}
          <select
            value={hour}
            onChange={(e) => setHour(e.target.value)}
            className="text-3xl bg-transparent border-none focus:outline-none text-center cursor-pointer"
            style={{ width: '80px', appearance: 'none' }}
          >
            {[...Array(12)].map((_, i) => {
              const h = String(i + 1).padStart(2, '0');
              return <option key={h} value={h}>{h}</option>;
            })}
          </select>

          <span className="text-3xl">:</span>

          {/* Minute Picker */}
          <select
            value={minute}
            onChange={(e) => setMinute(e.target.value)}
            className="text-3xl bg-transparent border-none focus:outline-none text-center cursor-pointer"
            style={{ width: '80px', appearance: 'none' }}
          >
            {['00', '15', '30', '45'].map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          {/* AM/PM Picker */}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="text-3xl bg-transparent border-none focus:outline-none text-center cursor-pointer ml-2"
            style={{ width: '80px', appearance: 'none' }}
          >
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
        </div>

        {/* Visual wheel effect */}
        <div className="absolute inset-x-0 top-[100px] h-12 border-y-2 border-green/30 pointer-events-none" />
      </div>
    </div>
  );
};

const HabitForm = ({ onSubmit, onCancel, initialData = null }) => {
  const [showSuggestions, setShowSuggestions] = useState(!initialData);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    icon: initialData?.icon || '🌱',
    color: initialData?.color || '#6db85c',
    target_time: initialData?.target_time || '',
    frequency: initialData?.frequency || 'daily',
    description: initialData?.description || '',
  });

  const handleSuggestionClick = (suggestion) => {
    setFormData({
      ...formData,
      name: suggestion.name,
      icon: suggestion.icon,
      target_time: suggestion.time,
    });
    setShowSuggestions(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-border rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-surface border-b border-border p-6 flex items-center justify-between">
          <h2 className="text-xl font-serif">
            {initialData ? 'Edit Habit' : 'Create New Habit'}
          </h2>
          <button onClick={onCancel} className="text-gray-500 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Suggestions */}
          {showSuggestions && !initialData && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm text-gray-400">Popular Habits</label>
                <button
                  type="button"
                  onClick={() => setShowSuggestions(false)}
                  className="text-xs text-green hover:underline"
                >
                  Create custom →
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {HABIT_SUGGESTIONS.map((suggestion, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="flex items-center gap-2 p-3 bg-bg border border-border rounded-xl hover:border-green transition text-left text-sm"
                  >
                    <span className="text-xl">{suggestion.icon}</span>
                    <span className="flex-1 truncate">{suggestion.name}</span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setShowSuggestions(false)}
                className="w-full mt-3 py-2 border border-dashed border-border rounded-xl text-sm text-gray-400 hover:border-green hover:text-green transition"
              >
                + Create custom habit
              </button>
            </div>
          )}

          {/* Form */}
          {(!showSuggestions || initialData) && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Habit Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Morning Meditation"
                  className="w-full bg-bg border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-green"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Icon</label>
                <div className="flex gap-2 flex-wrap">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: emoji })}
                      className={`w-12 h-12 rounded-xl text-xl flex items-center justify-center transition ${
                        formData.icon === emoji
                          ? 'bg-green/20 border-2 border-green'
                          : 'bg-bg border border-border hover:border-green/50'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Color</label>
                <div className="flex gap-3">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-10 h-10 rounded-full transition ${
                        formData.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-bg' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* iOS Time Picker Trigger */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Target Time</label>
                <button
                  type="button"
                  onClick={() => setShowTimePicker(true)}
                  className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-left hover:border-green transition"
                >
                  {formData.target_time || 'Set time'}
                </button>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Frequency</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  className="w-full bg-bg border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-green"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 px-4 py-3 rounded-xl border border-border hover:border-green transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-green to-green-light text-white font-semibold hover:shadow-lg hover:shadow-green/20 transition"
                >
                  {initialData ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* iOS Time Picker Modal */}
      {showTimePicker && (
        <IOSTimePicker
          value={formData.target_time}
          onChange={(time) => setFormData({ ...formData, target_time: time })}
          onClose={() => setShowTimePicker(false)}
        />
      )}
    </div>
  );
};

export default HabitForm;
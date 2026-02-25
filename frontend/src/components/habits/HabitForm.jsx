import { useState, useEffect } from 'react';
import { X, Clock, ChevronDown } from 'lucide-react';

const PRESET_HABITS = [
  { emoji: '🏃', name: 'Morning Run', defaultTime: '06:00' },
  { emoji: '🏋️', name: 'Gym Workout', defaultTime: '07:00' },
  { emoji: '💧', name: 'Drink 2L Water', defaultTime: '09:00' },
  { emoji: '📖', name: 'Read 20 Pages', defaultTime: '20:00' },
  { emoji: '🧘', name: 'Meditation', defaultTime: '06:30' },
  { emoji: '✍️', name: 'Journaling', defaultTime: '21:00' },
  { emoji: '🥗', name: 'Healthy Meal', defaultTime: '12:00' },
  { emoji: '🚫', name: 'No Social Media', defaultTime: '22:00' },
  { emoji: '💤', name: 'Sleep 8 Hours', defaultTime: '22:30' },
  { emoji: '🎯', name: 'Work on Side Project', defaultTime: '19:00' },
  { emoji: '🧠', name: 'Learn Something New', defaultTime: '18:00' },
  { emoji: '🤝', name: 'Call Family/Friends', defaultTime: '17:00' },
];

const HabitForm = ({ habit, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    reminder_time: '09:00',
    icon: '⚡',
  });
  const [showPresets, setShowPresets] = useState(true);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timePickerValue, setTimePickerValue] = useState({ hour: '09', minute: '00', period: 'AM' });

  useEffect(() => {
    if (habit) {
      setFormData({
        name: habit.name || '',
        description: habit.description || '',
        reminder_time: habit.reminder_time || '09:00',
        icon: habit.icon || '⚡',
      });
      setShowPresets(false);
      
      // Parse existing time
      if (habit.reminder_time) {
        const [hours, minutes] = habit.reminder_time.split(':');
        const hour24 = parseInt(hours);
        const period = hour24 >= 12 ? 'PM' : 'AM';
        const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
        setTimePickerValue({
          hour: hour12.toString().padStart(2, '0'),
          minute: minutes,
          period
        });
      }
    }
  }, [habit]);

  const handlePresetSelect = (preset) => {
    setFormData({
      name: preset.name,
      description: '',
      reminder_time: preset.defaultTime,
      icon: preset.emoji,
    });
    setShowPresets(false);
    
    // Parse preset time
    const [hours, minutes] = preset.defaultTime.split(':');
    const hour24 = parseInt(hours);
    const period = hour24 >= 12 ? 'PM' : 'AM';
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    setTimePickerValue({
      hour: hour12.toString().padStart(2, '0'),
      minute: minutes,
      period
    });
  };

  const handleTimeChange = (field, value) => {
  const newTime = { ...timePickerValue, [field]: value };
  setTimePickerValue(newTime);
  
  // Convert to 24h format for backend
  let hour24 = parseInt(newTime.hour);
  if (newTime.period === 'PM' && hour24 !== 12) {
    hour24 += 12;
  } else if (newTime.period === 'AM' && hour24 === 12) {
    hour24 = 0;
  }
  
  const formattedTime = `${hour24.toString().padStart(2, '0')}:${newTime.minute}`;
  console.log('Setting time to:', formattedTime); 
  
  setFormData({
    ...formData,
    reminder_time: formattedTime
  });
};

 const handleSubmit = (e) => {
  e.preventDefault();
  
  const submitData = {
    ...formData,
    reminder_time: formData.reminder_time || null, 
  };
  
  console.log('Submitting habit with data:', submitData);
  onSubmit(submitData);
};

  // Generate minute options from 00 to 60
  const minuteOptions = [];
  for (let i = 0; i <= 60; i++) {
    minuteOptions.push(i.toString().padStart(2, '0'));
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-surface border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-serif">
            {habit ? 'Edit Habit' : 'Create New Habit'}
          </h2>
          <button onClick={onCancel} className="p-2 hover:bg-bg rounded-lg transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          
          {/* Preset Habits */}
          {showPresets && !habit && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs uppercase tracking-wider text-gray-500">Popular Habits</h3>
                <button
                  type="button"
                  onClick={() => setShowPresets(false)}
                  className="text-xs text-green-light hover:text-green transition"
                >
                  Skip →
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {PRESET_HABITS.map((preset, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handlePresetSelect(preset)}
                    className="p-4 bg-bg border border-border rounded-xl hover:border-green transition flex flex-col items-center gap-2 text-center"
                  >
                    <span className="text-2xl">{preset.emoji}</span>
                    <span className="text-xs">{preset.name}</span>
                  </button>
                ))}
              </div>
              <div className="relative text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-surface text-xs uppercase tracking-wider text-gray-500">
                    Or create custom
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Custom Habit Form */}
          {(!showPresets || habit) && (
            <div className="space-y-6">
              
              {/* Habit Name */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">
                  Habit Name <span className="text-coral">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Morning Workout"
                  className="w-full px-4 py-3 bg-bg border border-border rounded-xl focus:border-green focus:outline-none transition"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional details about your habit..."
                  className="w-full px-4 py-3 bg-bg border border-border rounded-xl focus:border-green focus:outline-none transition resize-none"
                  rows="3"
                />
              </div>

              {/* Reminder Time */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">
                  Reminder Time
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowTimePicker(!showTimePicker)}
                    className="w-full px-4 py-3 bg-bg border border-border rounded-xl hover:border-green transition flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Clock size={18} className="text-gray-500" />
                      <span>{timePickerValue.hour}:{timePickerValue.minute} {timePickerValue.period}</span>
                    </div>
                    <ChevronDown size={18} className={`text-gray-500 transition-transform ${showTimePicker ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Time Picker Dropdown */}
                  {showTimePicker && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-xl p-4 shadow-2xl z-10">
                      <div className="flex items-center justify-center gap-2 mb-4">
                        {/* Hour */}
                        <select
                          value={timePickerValue.hour}
                          onChange={(e) => handleTimeChange('hour', e.target.value)}
                          className="px-3 py-2 bg-bg border border-border rounded-lg focus:border-green focus:outline-none text-center text-lg font-semibold w-20"
                        >
                          {[...Array(12)].map((_, i) => {
                            const hour = (i + 1).toString().padStart(2, '0');
                            return <option key={hour} value={hour}>{hour}</option>;
                          })}
                        </select>

                        <span className="text-2xl font-bold">:</span>

                        {/* Minute (00-60) */}
                        <select
                          value={timePickerValue.minute}
                          onChange={(e) => handleTimeChange('minute', e.target.value)}
                          className="px-3 py-2 bg-bg border border-border rounded-lg focus:border-green focus:outline-none text-center text-lg font-semibold w-20"
                        >
                          {minuteOptions.map(min => (
                            <option key={min} value={min}>{min}</option>
                          ))}
                        </select>

                        {/* AM/PM */}
                        <select
                          value={timePickerValue.period}
                          onChange={(e) => handleTimeChange('period', e.target.value)}
                          className="px-3 py-2 bg-bg border border-border rounded-lg focus:border-green focus:outline-none text-center text-lg font-semibold w-20"
                        >
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowTimePicker(false)}
                        className="w-full py-2 bg-green/20 border border-green/30 rounded-lg text-green-light font-semibold hover:bg-green/30 transition"
                      >
                        Done
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Icon */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">
                  Icon (Emoji)
                </label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="⚡"
                  className="w-20 px-4 py-3 bg-bg border border-border rounded-xl focus:border-green focus:outline-none transition text-center text-2xl"
                  maxLength="2"
                />
              </div>

            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-8 pt-6 border-t border-border">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 bg-bg border border-border rounded-xl hover:border-gray-600 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green to-green-light text-white rounded-xl hover:shadow-lg hover:shadow-green/20 transition font-semibold"
            >
              {habit ? 'Update Habit' : 'Create Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HabitForm;
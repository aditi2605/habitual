import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Loader2, Edit2, Trash2, X, Bell, TrendingUp, Target, Clock, Flame, ChevronRight, Calendar, BarChart3 } from 'lucide-react';
import HabitForm from '../components/habits/HabitForm';
import { habits, logs, analytics, auth } from '../services/api';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [allHabits, setAllHabits] = useState([]);
  const [todayStatus, setTodayStatus] = useState(null);
  const [weeklyData, setWeeklyData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [streaksData, setStreaksData] = useState(null);
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

useEffect(() => {
  // Fetch user info on mount
  const fetchUserInfo = async () => {
    try {
      const response = await auth.getMe();
      setUser(response.data);
      console.log('User info loaded:', response.data);
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      // If unauthorized, redirect to login
      if (error.response?.status === 401) {
        window.location.href = '/login';
      }
    }
  };

  fetchUserInfo();
}, []);

  const getBarColor = (percentage) => {
    const pct = Math.max(0, Math.min(100, percentage));
    
    if (pct === 0) {
      return {
        gradient: 'bg-gradient-to-t from-gray-700 to-gray-600',
        text: 'text-gray-500',
        dot: 'bg-gray-600'
      };
    } else if (pct < 25) {
      return {
        gradient: 'bg-gradient-to-t from-red-600 to-red-400',
        text: 'text-red-400',
        dot: 'bg-red-400'
      };
    } else if (pct < 50) {
      return {
        gradient: 'bg-gradient-to-t from-orange-500 to-orange-300',
        text: 'text-orange-400',
        dot: 'bg-orange-400'
      };
    } else if (pct < 75) {
      return {
        gradient: 'bg-gradient-to-t from-yellow-500 to-yellow-300',
        text: 'text-yellow-400',
        dot: 'bg-yellow-400'
      };
    } else if (pct < 100) {
      return {
        gradient: 'bg-gradient-to-t from-green-500 to-green-300',
        text: 'text-green-400',
        dot: 'bg-green-400'
      };
    } else {
      // 100%: Bright Green
      return {
        gradient: 'bg-gradient-to-t from-green-600 to-green-400',
        text: 'text-green-400',
        dot: 'bg-green-400'
      };
    }
  };
  useEffect(() => {
    loadDashboardData();
  }, [refreshTrigger]);

  // Check for habit reminders
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      allHabits.forEach(habit => {
        if (habit.reminder_time === currentTime) {
          const todayHabit = todayStatus?.habits?.find(h => h.id === habit.id);
          if (todayHabit && !todayHabit.completed_today) {
            addNotification({
              id: Date.now(),
              habitId: habit.id,
              habitName: habit.name,
              icon: habit.icon,
              time: currentTime,
              timestamp: Date.now()
            });
          }
        }
      });
    };

    const interval = setInterval(checkReminders, 60000);
    checkReminders();
    return () => clearInterval(interval);
  }, [allHabits, todayStatus]);

  // Auto-remove notifications after 24 hours
  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications(prev => {
        const now = Date.now();
        return prev.filter(notif => (now - notif.timestamp) < 24 * 60 * 60 * 1000);
      });
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const incompleteHabits = todayStatus?.habits?.filter(h => !h.completed_today) || [];
    
    const checkOverdue = () => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      incompleteHabits.forEach(habit => {
        if (habit.reminder_time && habit.reminder_time < currentTime) {
          // Check if notification already exists
          const notificationExists = notifications.some(n => n.id === `overdue-${habit.id}`);
          
          if (!notificationExists) {
            addNotification({
              id: `overdue-${habit.id}`,
              habitId: habit.id,
              habitName: habit.name,
              icon: '⚠️',
              time: habit.reminder_time,
              timestamp: Date.now(),
              isOverdue: true
            });
          }
        }
      });
    };

    const interval = setInterval(checkOverdue, 60000); 
    checkOverdue(); 

    return () => clearInterval(interval);
  }, [todayStatus, notifications]); 


  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      const [userRes, habitsRes, statusRes, weeklyRes, monthlyRes, streaksRes] = await Promise.all([
        auth.getMe(),
        habits.getAll(),
        logs.getTodayStatus(),
        analytics.getWeekly(),
        analytics.getMonthly(),
        analytics.getStreaks(),
      ]);

      setUser(userRes.data);
      setAllHabits(habitsRes.data || []);
      setTodayStatus(statusRes.data);
      setWeeklyData(weeklyRes.data);
      setMonthlyData(monthlyRes.data);
      setStreaksData(streaksRes.data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addNotification = (notification) => {
    setNotifications(prev => {
      if (prev.some(n => n.habitId === notification.habitId)) return prev;
      return [...prev, notification];
    });
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleToggleHabit = async (habitId) => {
    try {
      const response = await logs.logHabit(habitId);
      
      if (response.data.celebration) {
        showCelebration(response.data.celebration);
      }
      
      setNotifications(prev => prev.filter(n => n.habitId !== habitId));
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error logging habit:', error);
    }
  };

  const showCelebration = (message) => {
    const celebration = document.createElement('div');
    celebration.className = 'fixed top-4 right-4 z-50 animate-slideInRight';
    celebration.innerHTML = `
      <div class="bg-green border border-green-light rounded-xl px-6 py-4 shadow-2xl flex items-center gap-3">
        <span class="text-3xl">🎉</span>
        <div>
          <div class="font-semibold text-white">${message}</div>
          <div class="text-xs text-green-light">Keep up the great work!</div>
        </div>
      </div>
    `;
    document.body.appendChild(celebration);
    
    setTimeout(() => {
      celebration.classList.add('animate-slideOutRight');
      setTimeout(() => celebration.remove(), 300);
    }, 3000);
  };

  const handleCreateHabit = async (data) => {
    try {
      await habits.create(data);
      setShowHabitForm(false);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Failed to create habit:', error);
      alert('Failed to create habit');
    }
  };

  const handleUpdateHabit = async (data) => {
    try {
      await habits.update(editingHabit.id, data);
      setEditingHabit(null);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Failed to update habit:', error);
      alert('Failed to update habit');
    }
  };

  const handleDeleteHabit = async (habitId) => {
    if (!window.confirm('Delete this habit? This action cannot be undone.')) return;
    
    try {
      await habits.delete(habitId);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Failed to delete habit:', error);
    }
  };

  if (isLoading) {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <Loader2 size={40} className="animate-spin text-green" />
    </div>
  );
}

const todayHabitsArray = todayStatus?.habits || [];
const incompleteHabits = todayHabitsArray.filter(h => !h.completed_today);
const completedHabits = todayHabitsArray.filter(h => h.completed_today);
const actualTotalHabits = todayHabitsArray.length;
const completionPercentage = actualTotalHabits > 0 
  ? Math.min(Math.round((completedHabits.length / actualTotalHabits) * 100), 100)
  : 0;
  
let recalculatedWeeklyAverage = 0;
if (weeklyData?.days && weeklyData.days.length > 0) {
  // For each day, recalculate percentage based on actual habits
  const dailyPercentages = weeklyData.days.map(day => {
    // If backend provides correct per-day data, use it
    // Otherwise, we can only accurately calculate today
    return day.completion_percentage;
  });
  recalculatedWeeklyAverage = Math.round(
    dailyPercentages.reduce((sum, pct) => sum + pct, 0) / dailyPercentages.length
  );
}
const weeklyAverage = recalculatedWeeklyAverage;

// const bestDay = weeklyData?.best_day;
const improvementTip = getImprovementTip(weeklyAverage, completionPercentage);

console.log('Debug:', {
  totalHabitsFromBackend: todayStatus?.total_habits,
  actualTotalHabits,
  completedCount: completedHabits.length,
  incompleteCount: incompleteHabits.length,
  backendPercentage: todayStatus?.completion_percentage,
  recalculatedPercentage: completionPercentage
});
  return (
    <div className="min-h-screen bg-bg">
      {/* <Navbar user={user} /> */}
      <div className="max-w-[1800px] mx-auto p-6">
      
        {/* Header with Date */}
        <div className="mb-6">
          {/* Back Button */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-400 hover:text-green transition group mb-6"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            Back to Home
          </button>
    
            {/* Date */}
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-gray-500 mb-2">
              <Calendar size={12} />
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
      
          {/* Greeting */}
          <h1 className="text-3xl md:text-4xl font-serif leading-tight">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, 
            <span className="text-green-light"> {user?.first_name}!</span>
          </h1>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-12 gap-6">
          
          {/* LEFT COLUMN - Habits & Actions */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            
            {/* Daily Progress Card */}
            <div className="bg-gradient-to-br from-green/10 via-surface to-surface border border-green/20 rounded-2xl p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-serif mb-2">Today's Progress</h2>
                  <p className="text-sm text-gray-400">
                    {incompleteHabits.length > 0 
                      ? `${incompleteHabits.length} habit${incompleteHabits.length > 1 ? 's' : ''} remaining`
                      : 'All habits completed! 🎉'}
                  </p>
                </div>
                <button
                  onClick={() => setShowHabitForm(true)}
                  className="px-4 py-2 bg-green/20 border border-green/40 rounded-xl hover:bg-green/30 transition flex items-center gap-2 text-sm font-semibold text-green-light"
                >
                  <Plus size={16} />
                  New Habit
                </button>
              </div>

              {/* Progress Bar */}
              <div className="relative h-4 bg-bg rounded-full overflow-hidden mb-4">
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-green to-green-light rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min(completionPercentage, 100)}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">
                  {completedHabits.length} of {todayStatus?.total_habits || 0} completed
                </span>
                <span className="text-green-light font-bold text-lg">
                  {Math.min(completionPercentage, 100)}%
                </span>
              </div>
            </div>

            {/* Incomplete Habits */}
            {incompleteHabits.length > 0 && (
              <div className="bg-surface border border-border rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Target size={18} className="text-amber" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                    To Do ({incompleteHabits.length})
                  </h3>
                </div>

                <div className="space-y-3">
                  {incompleteHabits.map((habit) => {
                    const now = new Date();
                    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                    
                    // Check if habit is overdue
                    const isOverdue = habit.reminder_time && habit.reminder_time < currentTime;
                    
                    return (
                      <div
                        key={habit.id}
                        className={`group bg-bg rounded-xl p-4 transition-all ${
                          isOverdue 
                            ? 'border-2 border-coral/50 shadow-lg shadow-coral/20' 
                            : 'border border-border hover:border-green/40 hover:shadow-lg hover:shadow-green/10'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          {/* Checkbox */}
                          <button
                            onClick={() => !isOverdue && handleToggleHabit(habit.id)}
                            disabled={isOverdue}
                            className={`flex-shrink-0 w-8 h-8 rounded-lg border-2 transition-all flex items-center justify-center ${
                              isOverdue
                                ? 'border-coral bg-coral/10 cursor-not-allowed opacity-50'
                                : 'border-green/50 hover:border-green hover:bg-green/10'
                            }`}
                            title={isOverdue ? 'Time expired - cannot complete' : 'Mark as complete'}
                          >
                            {isOverdue ? (
                              <X size={16} className="text-coral" />
                            ) : (
                              <div className="w-3 h-3 rounded bg-transparent group-hover:bg-green/30 transition-colors" />
                            )}
                          </button>

                          {/* Icon & Name */}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="text-2xl">{habit.icon || '⚡'}</span>
                              <h4 className={`font-medium text-lg ${isOverdue ? 'text-coral' : ''}`}>
                                {habit.name}
                              </h4>
                              {isOverdue && (
                                <span className="px-2 py-0.5 bg-coral/20 border border-coral/30 rounded text-xs font-semibold text-coral">
                                  OVERDUE
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              {habit.reminder_time ? (
                                <span className={`flex items-center gap-1 font-semibold ${
                                  isOverdue ? 'text-coral' : 'text-amber'
                                }`}>
                                  <Clock size={12} />
                                  {habit.reminder_time}
                                  {isOverdue && ' (Missed)'}
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-gray-600">
                                  <Clock size={12} />
                                  Anytime
                                </span>
                              )}
                              {habit.current_streak > 0 && (
                                <span className="flex items-center gap-1">
                                  <Flame size={12} className="text-orange-400" />
                                  {habit.current_streak} day streak
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setEditingHabit(habit)}
                              className="p-2 rounded-lg hover:bg-surface border border-transparent hover:border-green/30 transition"
                            >
                              <Edit2 size={14} className="text-gray-500" />
                            </button>
                            <button
                              onClick={() => handleDeleteHabit(habit.id)}
                              className="p-2 rounded-lg hover:bg-coral/10 border border-transparent hover:border-coral/30 transition"
                            >
                              <Trash2 size={14} className="text-coral" />
                            </button>
                          </div>
                        </div>

                        {/* Overdue Message */}
                        {isOverdue && (
                          <div className="mt-3 p-2 bg-coral/10 border border-coral/20 rounded-lg">
                            <p className="text-xs text-coral">
                              ⚠️ This habit's scheduled time has passed. It will be available again tomorrow.
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Completed Habits */}
            {completedHabits.length > 0 && (
              <details className="group/details bg-surface border border-border rounded-2xl overflow-hidden">
                <summary className="cursor-pointer list-none p-6 hover:bg-bg/50 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green/20 rounded-lg flex items-center justify-center">
                        <span className="text-green text-lg">✓</span>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold">Completed Today</h3>
                        <p className="text-xs text-gray-500">{completedHabits.length} habit{completedHabits.length > 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-gray-500 group-open/details:rotate-90 transition-transform" />
                  </div>
                </summary>
                
                <div className="px-6 pb-6 space-y-2">
                  {completedHabits.map((habit) => (
                    <div key={habit.id} className="flex items-center gap-3 p-3 bg-bg rounded-lg opacity-60">
                      <span className="text-lg">{habit.icon || '⚡'}</span>
                      <span className="text-sm line-through text-gray-600">{habit.name}</span>
                      <span className="ml-auto text-green text-xs font-semibold">✓ Done</span>
                    </div>
                  ))}
                </div>
              </details>
            )}

            {/* Weekly Analytics */}
            <div className="bg-surface border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <BarChart3 size={18} className="text-green-light" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                    Weekly Analytics
                  </h3>
                </div>
                <div className="text-sm text-gray-500">
                  Avg: <span className="text-green-light font-bold">{weeklyAverage}%</span>
                </div>
              </div>

             

              {/* Weekly Insight */}
              <div className="bg-surface border border-border rounded-2xl p-6">
                {/* Bar Chart */}
                {weeklyData?.days && weeklyData.days.length > 0 ? (
                  <div className="space-y-6">
                    <div className="h-64 flex items-end justify-between gap-4">
                      {weeklyData.days.map((day, index) => {
                        const isToday = index === weeklyData.days.length - 1;
                        const percentage = Math.min(day.completion_percentage || 0, 100);
                        
                        const maxHeight = 130;
                        const barHeight = (percentage / 100) * maxHeight;
                        
                        // Calculate for tooltip
                        const totalForDay = actualTotalHabits;
                        const completedForDay = Math.round((percentage / 100) * totalForDay);
                        
                        // ✅ Get dynamic colors based on percentage
                        const colors = getBarColor(percentage);
                        
                        return (
                          <div key={day.date} className="flex-1 flex flex-col items-center gap-3 group/bar">
                            <div className="w-full flex flex-col items-center justify-end" style={{ height: `${maxHeight}px` }}>
                              {/* Top Label with dynamic color */}
                              <div className={`text-xs font-bold mb-1 ${colors.text}`}>
                                {percentage}%
                              </div>
                              
                              {/* The Bar with DYNAMIC COLOR */}
                              <div
                                className={`w-full rounded-t-xl relative transition-all duration-700 ${colors.gradient} ${
                                  isToday ? 'ring-2 ring-green-400 shadow-lg shadow-green-400/30' : ''
                                }`}
                                style={{ 
                                  height: `${barHeight}px`,
                                  minHeight: percentage >= 50 ? '35px' : percentage > 0 ? '15px' : '4px'
                                }}
                              >
                                {/* Hover Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 opacity-0 group-hover/bar:opacity-100 transition-opacity duration-200 pointer-events-none z-30 w-max">
                                  <div className="bg-gray-900/95 backdrop-blur border border-green-500/50 rounded-lg px-3 py-2 shadow-2xl">
                                    <div className="text-[10px] text-gray-400">
                                      {isToday ? 'Today' : `${day.day_short}, ${day.date.split('-')[2]}`}
                                    </div>
                                    <div className="text-xl font-bold text-green-400 my-1">{percentage}%</div>
                                    <div className="text-[10px] text-gray-500">
                                      {completedForDay} / {totalForDay} completed
                                    </div>
                                  </div>
                                  <div className="absolute top-full left-1/2 -translate-x-1/2">
                                    <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-green-500/50" />
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Bottom Labels */}
                            <div className="text-center space-y-1">
                              <div className={`text-xs font-bold ${isToday ? 'text-green-400' : 'text-gray-400'}`}>
                                {isToday ? 'TODAY' : day.day_short.toUpperCase()}
                              </div>
                              <div className="text-[10px] text-gray-600">{day.date.split('-')[2]}</div>
                              {/* Status dot with DYNAMIC COLOR */}
                              <div className={`w-2 h-2 rounded-full mx-auto ${colors.dot}`} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500 text-sm">
                    Complete habits to see weekly analytics
                  </div>
                )}
                {weeklyData?.insight && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-green/5 to-transparent border border-green/20 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="text-xl">💡</div>
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-green-light mb-1">Weekly Insight</div>
                        <p className="text-sm text-gray-300 leading-relaxed">{weeklyData.insight}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Monthly Trend */}
            {monthlyData?.weeks && monthlyData.weeks.length > 0 && (
              <div className="bg-surface border border-border rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={18} className="text-green-light" />
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                      Monthly Trend
                    </h3>
                  </div>
                  <div className="text-sm text-gray-500">
                    Avg: <span className="text-green-light font-bold">
                      {Math.round(monthlyData.weeks.reduce((acc, w) => acc + w.completion_percentage, 0) / monthlyData.weeks.length)}%
                    </span>
                  </div>
                </div>
                <div className="relative" style={{ height: '180px' }}>
                  <svg 
                    className="w-full h-full" 
                    viewBox="0 0 500 140" 
                    preserveAspectRatio="xMidYMid meet"
                    style={{ overflow: 'visible' }}
                  >
                    <defs>
                      <linearGradient id="monthlyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="rgb(109, 184, 92)" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="rgb(109, 184, 92)" stopOpacity="0.05" />
                      </linearGradient>
                    </defs>
                    
                    {/* Y-axis grid lines and labels */}
                    {[0, 25, 50, 75, 100].map((value) => {
                      const y = 120 - (value * 1.0); // Adjusted for better spacing
                      return (
                        <g key={value}>
                          <line
                            x1="45"
                            y1={y}
                            x2="480"
                            y2={y}
                            stroke="rgb(55, 65, 81)"
                            strokeWidth="1"
                            opacity="0.15"
                            strokeDasharray="3 3"
                          />
                          <text
                            x="35"
                            y={y + 4}
                            fill="rgb(156, 163, 175)"
                            fontSize="11"
                            textAnchor="end"
                            fontFamily="monospace"
                          >
                            {value}%
                          </text>
                        </g>
                      );
                    })}
                    
                    {/* Area fill */}
                    <path
                      d={`M 45 120 ${monthlyData.weeks.map((week, i) => {
                        const x = 45 + (i / Math.max(monthlyData.weeks.length - 1, 1)) * 435;
                        const y = 120 - (week.completion_percentage * 1.0);
                        return `L ${x} ${y}`;
                      }).join(' ')} L ${45 + 435} 120 Z`}
                      fill="url(#monthlyGradient)"
                    />
                    
                    <polyline
                      fill="none"
                      stroke="rgb(109, 184, 92)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={monthlyData.weeks.map((week, i) => {
                        const x = 45 + (i / Math.max(monthlyData.weeks.length - 1, 1)) * 435;
                        const y = 120 - (week.completion_percentage * 1.0);
                        return `${x},${y}`;
                      }).join(' ')}
                    />
                    
                    {/* Data points */}
                    {monthlyData.weeks.map((week, i) => {
                      const x = 45 + (i / Math.max(monthlyData.weeks.length - 1, 1)) * 435;
                      const y = 120 - (week.completion_percentage * 1.0);
                      
                      return (
                        <g key={i} className="group/point">
                          {/* Larger invisible hover area */}
                          <circle
                            cx={x}
                            cy={y}
                            r="12"
                            fill="transparent"
                            className="cursor-pointer"
                          />
                          
                          {/* Visible dot */}
                          <circle
                            cx={x}
                            cy={y}
                            r="4"
                            fill="rgb(109, 184, 92)"
                            stroke="rgb(10, 12, 11)"
                            strokeWidth="2"
                            className="transition-all"
                          />
                          
                          {/* Hover ring */}
                          <circle
                            cx={x}
                            cy={y}
                            r="7"
                            fill="transparent"
                            stroke="rgb(109, 184, 92)"
                            strokeWidth="0"
                            className="group-hover/point:stroke-width-2 transition-all"
                            opacity="0.5"
                          />
                          
                          {/* Tooltip */}
                          <g className="opacity-0 group-hover/point:opacity-100 transition-opacity pointer-events-none">
                            <rect
                              x={x - 35}
                              y={y - 45}
                              width="70"
                              height="38"
                              fill="rgb(17, 24, 39)"
                              stroke="rgb(109, 184, 92)"
                              strokeWidth="1.5"
                              rx="6"
                              opacity="0.98"
                            />
                            <text
                              x={x}
                              y={y - 30}
                              fill="rgb(156, 163, 175)"
                              fontSize="10"
                              textAnchor="middle"
                              fontFamily="monospace"
                            >
                              Week {i + 1}
                            </text>
                            <text
                              x={x}
                              y={y - 16}
                              fill="rgb(109, 184, 92)"
                              fontSize="16"
                              fontWeight="bold"
                              textAnchor="middle"
                              fontFamily="monospace"
                            >
                              {week.completion_percentage}%
                            </text>
                            {/* Arrow */}
                            <path
                              d={`M ${x - 4} ${y - 7} L ${x} ${y - 3} L ${x + 4} ${y - 7}`}
                              fill="rgb(109, 184, 92)"
                            />
                          </g>
                        </g>
                      );
                    })}
                    
                    {/* X-axis week labels  */}
                    {monthlyData.weeks.map((_, i) => {
                      const x = 45 + (i / Math.max(monthlyData.weeks.length - 1, 1)) * 435;
                      return (
                        <text
                          key={i}
                          x={x}
                          y="140"
                          fill="rgb(156, 163, 175)"
                          fontSize="11"
                          textAnchor="middle"
                          fontFamily="monospace"
                          fontWeight="600"
                        >
                          W{i + 1}
                        </text>
                      );
                    })}
                  </svg>
                </div>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN - Stats & Notifications */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            
            {/* Notifications Panel */}
            {notifications.length > 0 && (
              <div className="bg-gradient-to-br from-amber/10 to-surface border border-amber/30 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Bell size={18} className="text-amber" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-amber">
                    Reminders ({notifications.length})
                  </h3>
                </div>
                
                <div className="space-y-3">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="bg-amber/5 border border-amber/20 rounded-xl p-4 flex items-start justify-between group hover:bg-amber/10 transition"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{notif.icon || '⏰'}</span>
                        <div>
                          <div className="text-sm font-medium">{notif.habitName}</div>
                          <div className="text-xs text-gray-500 mt-1">Time: {notif.time}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeNotification(notif.id)}
                        className="text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="bg-surface border border-border rounded-2xl p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
                Quick Stats
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-bg rounded-xl text-center">
                  <div className="text-3xl font-bold text-green-light">{completedHabits.length}</div>
                  <div className="text-[10px] uppercase tracking-wider text-gray-500 mt-1">Done Today</div>
                </div>
                <div className="p-4 bg-bg rounded-xl text-center">
                  <div className="text-3xl font-bold text-amber">{streaksData?.longest_current_streak?.days || 0}</div>
                  <div className="text-[10px] uppercase tracking-wider text-gray-500 mt-1">Best Streak</div>
                </div>
                <div className="p-4 bg-bg rounded-xl text-center">
                  <div className="text-3xl font-bold text-purple-400">{weeklyAverage}%</div>
                  <div className="text-[10px] uppercase tracking-wider text-gray-500 mt-1">Week Avg</div>
                </div>
                <div className="p-4 bg-bg rounded-xl text-center">
                  <div className="text-3xl font-bold text-coral">{allHabits.length}</div>
                  <div className="text-[10px] uppercase tracking-wider text-gray-500 mt-1">Total Habits</div>
                </div>
              </div>
            </div>

            {/* Improvement Tip */}
            <div className="bg-gradient-to-br from-green/10 to-surface border border-green/30 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="text-2xl">💪</div>
                <h3 className="text-sm font-semibold text-green-light">Improvement Tip</h3>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">{improvementTip}</p>
            </div>

            {/* Active Streaks */}
            {streaksData?.streaks && streaksData.streaks.length > 0 && (
              <div className="bg-surface border border-border rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Flame size={18} className="text-orange-400" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                    Active Streaks
                  </h3>
                </div>
                
                <div className="space-y-3">
                  {streaksData.streaks.slice(0, 5).map((streak) => (
                    <div key={streak.habit} className="flex items-center justify-between p-3 bg-bg rounded-lg hover:bg-surface transition">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{streak.icon}</span>
                        <span className="text-sm">{streak.habit}</span>
                      </div>
                      <div className="flex items-center gap-1 text-orange-400 font-semibold text-sm">
                        <Flame size={14} />
                        {streak.current_streak}
                      </div>
                    </div>
                  ))}
                </div>

                {streaksData.longest_current_streak && (
                  <div className="mt-4 pt-4 border-t border-border text-center">
                    <div className="text-xs text-gray-500 mb-1">Longest Active Streak</div>
                    <div className="text-2xl font-bold text-orange-400">
                      🔥 {streaksData.longest_current_streak.days} days
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {streaksData.longest_current_streak.habit}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Leaderboard CTA */}
            <a 
              href="/leaderboard"
              className="block bg-gradient-to-br from-purple-500/10 to-surface border border-purple-500/30 rounded-2xl p-6 hover:border-purple-500/50 transition group"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-3xl mb-2">🏆</div>
                  <h3 className="text-lg font-serif mb-1 group-hover:text-green-light transition">
                    Global Leaderboard
                  </h3>
                  <p className="text-sm text-gray-400">
                    Compete with others & earn badges
                  </p>
                </div>
                <ChevronRight size={20} className="text-gray-600 group-hover:text-green-light group-hover:translate-x-1 transition" />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-bg rounded-lg">
                <span className="text-xs text-gray-500">Your Rank</span>
                <span className="text-sm font-bold text-green-light">#42</span>
              </div>
            </a>

          </div>
        </div>
      </div>

      {/* Habit Form Modal */}
      {(showHabitForm || editingHabit) && (
        <HabitForm
          habit={editingHabit}
          onSubmit={editingHabit ? handleUpdateHabit : handleCreateHabit}
          onCancel={() => {
            setShowHabitForm(false);
            setEditingHabit(null);
          }}
        />
      )}
    </div>
  );
};

// Helper function for improvement tips
const getImprovementTip = (weeklyAvg, todayCompletion) => {
  if (weeklyAvg >= 90) {
    return "Excellent consistency! You're crushing your goals. Keep maintaining this momentum and consider adding a new challenging habit.";
  } else if (weeklyAvg >= 75) {
    return "Great work! You're building strong habits. Try to identify your best time of day for completion and schedule difficult habits then.";
  } else if (weeklyAvg >= 50) {
    return "You're making progress! Focus on completing one habit at a time. Start with the easiest one each day to build momentum.";
  } else {
    return "Every journey starts somewhere! Set reminders for your top 3 habits. Small consistent wins will build your confidence.";
  }
};

export default Dashboard;
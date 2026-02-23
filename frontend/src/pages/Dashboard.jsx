import { useState, useEffect } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import Navbar from '../components/layout/NavBar';
import HabitCard from '../components/habits/HabitCard';
import HabitForm from '../components/habits/HabitForm';
import WeeklyChart from '../components/analytics/WeeklyChart';
import ProgressRing from '../components/analytics/ProgressRing';
import MonthlyTrendChart from '../components/analytics/MonthlyTrendChart';
import { habits, logs, analytics, auth } from '../services/api';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [todayStatus, setTodayStatus] = useState(null);
  const [weeklyData, setWeeklyData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [streaksData, setStreaksData] = useState(null);
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, [refreshTrigger]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load all data in parallel
      const [userRes, statusRes, weeklyRes, mothlyRes, streaksRes] = await Promise.all([
        auth.getMe(),
        logs.getTodayStatus(),
        analytics.getWeekly(),
        analytics.getMonthly(),
        analytics.getStreaks(),
      ]);

      setUser(userRes.data);
      setTodayStatus(statusRes.data);
      setWeeklyData(weeklyRes.data);
      setMonthlyData(mothlyRes.data);
      setStreaksData(streaksRes.data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

 const handleToggleHabit = async (habitId) => {
  console.log('Toggling habit ID:', habitId); // ← Add this
  
  try {
    const response = await logs.logHabit(habitId);
    console.log('Log response:', response.data); // ← Add this
    
    
    if (response.data.celebration) {
      alert(response.data.celebration);
    }
    
    setRefreshTrigger(prev => prev + 1);
  } catch (error) {
    console.error('Error details:', error.response); // ← Add this
    alert(error.response?.data?.detail || 'Failed to log habit');
  }
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

  const handleDeleteHabit = async (habitId) => {
    if (!window.confirm('Delete this habit?')) return;
    
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

  return (
    <div className="min-h-screen bg-bg">
      <Navbar user={user} />

      <div className="max-w-7xl mx-auto p-6">
        {/* Grid Layout */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Greeting */}
            <div className="mb-6">
              <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">
                Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.first_name}
              </div>
              <h1 className="text-3xl md:text-4xl font-serif leading-tight">
                {todayStatus?.completed > 0 ? (
                  <>You're on a <span className="text-green-light italic">{streaksData?.longest_current_streak?.days || 0}-day</span><br/>streak. Keep it up! 🔥</>
                ) : (
                  <>Time to build<br/>your <span className="text-green-light italic">momentum.</span></>
                )}
              </h1>
            </div>

            {/* Week Streak Pills */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {weeklyData?.days?.map((day, index) => {
                const isToday = index === weeklyData.days.length - 1;
                const isDone = day.completion_percentage === 100;
                const isMissed = day.completion_percentage === 0 && !isToday;
                
                return (
                  <div
                    key={day.date}
                    className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl border transition ${
                      isToday
                        ? 'bg-green/10 border-green shadow-lg shadow-green/10'
                        : isDone
                        ? 'bg-green/5 border-green/30'
                        : isMissed
                        ? 'bg-coral/5 border-coral/30'
                        : 'bg-surface border-border'
                    }`}
                  >
                    <div className="text-xs uppercase tracking-wider text-gray-500">
                      {isToday ? 'Today' : day.day_short}
                    </div>
                    <div className={`text-sm font-semibold ${isToday ? 'text-green-light' : ''}`}>
                      {day.date.split('-')[2]}
                    </div>
                    <div 
                      className={`w-1.5 h-1.5 rounded-full ${
                        isDone ? 'bg-green' : isMissed ? 'bg-coral' : 'bg-border'
                      }`}
                    />
                  </div>
                );
              })}
            </div>

            {/* Section Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xs uppercase tracking-wider text-gray-500">
                Today's Habits
              </h2>
              <button
                onClick={() => setShowHabitForm(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface border border-border hover:border-green transition text-sm"
              >
                <Plus size={16} />
                Add habit
              </button>
            </div>

            {/* Habits List */}
            <div className="space-y-3">
              {todayStatus?.habits?.length === 0 ? (
                <div className="bg-surface border border-dashed border-border rounded-2xl p-12 text-center">
                  <div className="text-4xl mb-4">🌱</div>
                  <p className="text-gray-400 mb-4">No habits yet! Let's create your first one.</p>
                  <button
                    onClick={() => setShowHabitForm(true)}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-green to-green-light text-white font-semibold hover:shadow-lg hover:shadow-green/20 transition"
                  >
                    Create your first habit
                  </button>
                </div>
              ) : (
                todayStatus?.habits?.map((habit) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    onToggle={handleToggleHabit}
                    onDelete={handleDeleteHabit}
                  />
                ))
              )}
            </div>

            {/* Weekly Chart */}
            {weeklyData?.days && (
              <div className="mt-6">
                <WeeklyChart data={weeklyData.days} />
                
                {/* Insight */}
                {weeklyData.insight && (
                  <div className="mt-4 bg-gradient-to-r from-green/10 to-bg border border-green/20 rounded-xl p-4">
                    <div className="text-sm text-green-light font-medium mb-1">
                      💡 Weekly Insight
                    </div>
                    <p className="text-sm text-gray-300">
                      {weeklyData.insight}
                    </p>
                  </div>
                )}

                
              </div>

              
            )}

            {/*  monthlydata */}
            {monthlyData?.weeks && (
              <MonthlyTrendChart data={monthlyData.weeks} />
            )}

          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            
            {/* Progress Ring */}
            <ProgressRing
              percentage={todayStatus?.completion_percentage || 0}
              completed={todayStatus?.completed || 0}
              total={todayStatus?.total_habits || 0}
            />

            {/* Active Streaks */}
            {streaksData?.streaks && streaksData.streaks.length > 0 && (
              <div className="bg-surface border border-border rounded-2xl p-6">
                <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-4">
                  🔥 Active Streaks
                </h3>
                <div className="space-y-3">
                  {streaksData.streaks.slice(0, 5).map((streak) => (
                    <div key={streak.habit} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{streak.icon}</span>
                        <span className="text-sm">{streak.habit}</span>
                      </div>
                      <div className="text-amber font-semibold text-sm">
                        🔥 {streak.current_streak}
                      </div>
                    </div>
                  ))}
                </div>
                
                {streaksData.longest_current_streak && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="text-xs text-gray-500 mb-1">Longest streak</div>
                    <div className="text-lg font-serif text-green-light">
                      {streaksData.longest_current_streak.days} days
                    </div>
                    <div className="text-xs text-gray-500">
                      {streaksData.longest_current_streak.habit}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quick Stats */}
            <div className="bg-surface border border-border rounded-2xl p-6">
              <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-4">
                📊 This Week
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Average completion</span>
                  <span className="font-semibold text-green-light">
                    {weeklyData?.weekly_average || 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Best day</span>
                  <span className="font-semibold">
                    {weeklyData?.best_day?.day} ({weeklyData?.best_day?.percentage}%)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Total streaks</span>
                  <span className="font-semibold text-amber">
                    🔥 {streaksData?.total_streak_days || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="bg-gradient-to-br from-green/10 to-purple-500/10 border border-green/20 rounded-2xl p-6">
              <div className="text-2xl mb-3">🏆</div>
              <h3 className="font-serif text-lg mb-2">Join the competition!</h3>
              <p className="text-sm text-gray-400 mb-4">
                Compete with others on the leaderboard and earn badges.
              </p>
              <a 
                href="/leaderboard"
                className="inline-block px-4 py-2 rounded-lg bg-green/20 border border-green/40 text-green-light text-sm font-semibold hover:bg-green/30 transition"
              >
                View Leaderboard →
              </a>
            </div>

          </div>
        </div>
      </div>

      {/* Habit Form Modal */}
      {showHabitForm && (
        <HabitForm
          onSubmit={handleCreateHabit}
          onCancel={() => setShowHabitForm(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
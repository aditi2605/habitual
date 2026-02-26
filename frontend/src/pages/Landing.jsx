import { Link } from 'react-router-dom';
import { ArrowRight, Target, TrendingUp, Trophy, Bell, BarChart3, Flame, Users, Zap, Check, Star, Calendar, X, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import NavBar from '../components/layout/NavBar'


// Interactive Dashboard Preview Component
const InteractiveDashboardPreview = () => {
  const [habits, setHabits] = useState([
    { id: 1, emoji: '🧘', name: 'Morning Meditation', done: false, borderColor: '#6db85c' },
    { id: 2, emoji: '💧', name: 'Drink 8 Glasses', done: false, borderColor: '#3b82f6' },
    { id: 3, emoji: '📖', name: 'Read 20 Pages', done: false, borderColor: '#f59e0b' },
    { id: 4, emoji: '🏃', name: 'Morning Run 5K', done: false, borderColor: '#8b5cf6' },
  ]);

  const totalHabits = habits.length;
  const completedHabits = habits.filter(h => h.done).length;
  const progress = Math.round((completedHabits / totalHabits) * 100);

  const toggleHabit = (id) => {
    setHabits(habits.map(h => 
      h.id === id ? { ...h, done: !h.done } : h
    ));
  };

  // Weekly data - (ex. demo - updates based on today's progress)
  const weeklyData = [
    { height: 0, color: 'red' },
    { height: 0, color: 'red' },
    { height: 0, color: 'red' },
    { height: 0, color: 'red' },
    { height: 0, color: 'red' },
    { height: 44, color: 'coral' },
    { height: progress, color: progress >= 75 ? 'green' : progress >= 50 ? 'yellow' : 'coral' },
  ];

  const weeklyAvg = Math.round(weeklyData.reduce((acc, d) => acc + d.height, 0) / weeklyData.length);

  return (
    <div className="bg-[#0a0c0b] border border-[#1a1d1a] rounded-3xl overflow-hidden shadow-2xl shadow-black/60">
      {/* Browser Chrome */}
      <div className="bg-[#0f110f] border-b border-[#1a1d1a] px-6 py-3 flex items-center gap-3">
        <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
        <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
        <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        <div className="flex-1 text-center text-xs text-gray-600 font-mono">app.habitual.io/dashboard</div>
      </div>

      {/* Dashboard Content */}
      <div className="p-8 bg-[#0a0c0b]">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Habits List - CLICKABLE */}
          <div className="md:col-span-2 space-y-3">
            {habits.map((habit) => (
              <button
                key={habit.id}
                onClick={() => toggleHabit(habit.id)}
                className="w-full flex items-center gap-3 p-4 bg-[#0f110f] rounded-xl border-l-4 transition-all hover:bg-[#121412] cursor-pointer group"
                style={{ borderLeftColor: habit.borderColor }}
              >
                <div className="text-2xl">{habit.emoji}</div>
                <div className="flex-1 text-left">
                  <div className={`text-sm font-medium transition-all ${
                    habit.done ? 'text-gray-500 line-through' : 'text-gray-200'
                  }`}>
                    {habit.name}
                  </div>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                  habit.done 
                    ? 'bg-green-500 scale-100' 
                    : 'border-2 border-[#242824] group-hover:border-green-500/50 scale-95'
                }`}>
                  {habit.done && <Check size={16} className="text-white" />}
                </div>
              </button>
            ))}

            {/* Try It Hint */}
            <div className="text-center py-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green/10 border border-green/20 rounded-full text-xs text-green-light">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                👆 Try clicking habits to see progress update!
              </div>
            </div>
          </div>

          {/* Right Column - Stats (LIVE UPDATE) */}
          <div className="space-y-4">
            {/* Progress Card - LIVE */}
            <div className="bg-[#0f110f] border border-[#1a1d1a] rounded-2xl p-6 text-center transition-all">
              <div className={`text-5xl font-serif mb-2 transition-all duration-500 ${
                progress === 100 ? 'text-green-400' :
                progress >= 75 ? 'text-green-light' :
                progress >= 50 ? 'text-yellow-400' :
                progress >= 25 ? 'text-orange-400' :
                'text-red-400'
              }`}>
                {progress}%
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Today's Progress</div>
              <div className="text-xs text-gray-600 mt-2">
                {completedHabits} of {totalHabits} completed
              </div>

              {/* Progress Bar */}
              <div className="mt-4 h-2 bg-[#0a0c0b] rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ${
                    progress === 100 ? 'bg-gradient-to-r from-green-600 to-green-400' :
                    progress >= 50 ? 'bg-gradient-to-r from-green to-green-light' :
                    'bg-gradient-to-r from-red-500 to-orange-400'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Weekly Chart - LIVE UPDATE */}
            <div className="bg-[#0f110f] border border-[#1a1d1a] rounded-2xl p-4">
              <div className="flex justify-between items-end h-20 gap-1">
                {weeklyData.map((bar, i) => (
                  <div 
                    key={i} 
                    className={`flex-1 rounded-t-lg transition-all duration-700 ${
                      bar.height === 0 ? 'bg-gradient-to-t from-red-500 to-red-400' :
                      bar.height < 50 ? 'bg-gradient-to-t from-red-400 to-red-300' :
                      bar.height < 75 ? 'bg-gradient-to-t from-yellow-500 to-yellow-300' :
                      bar.height < 100 ? 'bg-gradient-to-t from-green-500 to-green-300' :
                      'bg-gradient-to-t from-green-600 to-green-400'
                    } ${i === 6 ? 'ring-1 ring-green-400' : ''}`}
                    style={{ height: `${Math.max(bar.height, 5)}%` }}
                  />
                ))}
              </div>
              <div className="text-xs text-gray-500 text-center mt-2">This Week</div>
              <div className={`text-xs text-center mt-1 transition-colors ${
                weeklyAvg >= 75 ? 'text-green-400' :
                weeklyAvg >= 50 ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {weeklyAvg}% avg
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Row - LIVE */}
        <div className="grid grid-cols-4 gap-3 mt-6">
          {[
            { value: completedHabits, label: 'Done', color: 'text-green-400' },
            { value: completedHabits > 0 ? completedHabits * 10 + 17 : 0, label: 'Streak', color: 'text-orange-400' },
            { value: `${weeklyAvg}%`, label: 'Week', color: weeklyAvg >= 50 ? 'text-yellow-400' : 'text-red-400' },
            { value: totalHabits, label: 'Total', color: 'text-gray-400' },
          ].map((stat, i) => (
            <div key={i} className="bg-[#0f110f] border border-[#1a1d1a] rounded-xl p-3 text-center transition-all">
              <div className={`text-2xl font-bold transition-all duration-500 ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-[10px] text-gray-600 uppercase tracking-wider mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Celebration when 100% */}
        {progress === 100 && (
          <div className="mt-6 p-4 bg-gradient-to-r from-green/20 to-transparent border border-green/30 rounded-xl ">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🎉</div>
              <div>
                <div className="text-sm font-semibold text-green-light">Perfect Day!</div>
                <div className="text-xs text-gray-400">You completed all your habits. Keep it up! 🔥</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Landing = () => {
  // const [scrolled, setScrolled] = useState(false);

  // useEffect(() => {
  //   const handleScroll = () => {
  //     setScrolled(window.scrollY > 50);
  //   };
  //   window.addEventListener('scroll', handleScroll);
  //   return () => window.removeEventListener('scroll', handleScroll);
  // }, []);

  useEffect(() => {
    // Scroll reveal animation
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible');
      });
    }, { threshold: 0.1 });
    reveals.forEach(r => observer.observe(r));

    // Counter animation
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting && !e.target.classList.contains('counted')) {
          const target = parseFloat(e.target.dataset.count);
          animateCounter(e.target, target);
          e.target.classList.add('counted');
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));
  }, []);

  const animateCounter = (el, target) => {
    const duration = 2000;
    const start = performance.now();
    const isDecimal = target % 1 !== 0;
    
    function update(now) {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      const val = target * ease;
      el.textContent = isDecimal ? val.toFixed(1) : Math.floor(val);
      if (t < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  };

  return (
    <div className="min-h-screen bg-bg text-white">
      {/* Navbar */}
      <NavBar />
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pt-16 md:pt-24 pb-12 text-center">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif leading-tight mb-6 reveal">
          Build your habits.<br />
          <span className="text-green-light italic">No excuses.</span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed reveal">
          The habit tracker built for <strong className="text-white">go-getters & high performers</strong>. 
          Track streaks, crush goals, and level up your daily grind with precision analytics.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 reveal">
          <Link 
            to="/signup"
            className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-green to-green-light text-white font-semibold text-lg hover:shadow-xl hover:shadow-green/30 transition transform hover:scale-105"
          >
            Start Free Trial
            <ArrowRight size={20} />
          </Link>
          <a 
            href="#demo"
            className="px-8 py-4 rounded-xl bg-surface border border-border hover:border-green transition"
          >
            Watch Demo ↓
          </a>
        </div>

        <p className="text-sm text-gray-600 reveal">
          Free forever · No credit card · 48,000+ users already building unstoppable habits
        </p>

        {/* Hero Stats */}
        <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mt-16 reveal">
          <div>
            <div className="text-4xl md:text-5xl font-serif text-green-light mb-2">
              <span data-count="48">0</span>K+
            </div>
            <div className="text-sm text-gray-500">Active Users</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-serif text-green-light mb-2">
              <span data-count="2.1">0</span>M
            </div>
            <div className="text-sm text-gray-500">Habits Tracked</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-serif text-green-light mb-2">
              <span data-count="94">0</span>%
            </div>
            <div className="text-sm text-gray-500">Success Rate</div>
          </div>
        </div>

        {/* Mini Preview */}
        <div className="mt-20 max-w-5xl mx-auto reveal">
          <InteractiveDashboardPreview />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-6 md:px-12 py-20 md:py-32">
        <div className="text-center mb-16 reveal">
          <div className="text-sm uppercase tracking-wider text-gray-500 mb-4">Core Systems</div>
          <h2 className="text-4xl md:text-6xl font-serif mb-6">
            <span className="text-green-light">Power</span> features<br />for peak performers
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Everything you need to build meaningful routines, understand your patterns, 
            and compete with others — one day at a time.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { 
              icon: <Flame className="text-orange-400" />, 
              title: 'Streak Engine', 
              description: 'Real-time streak tracking with fire alerts. Miss a day and feel the heat. Stay consistent and watch your multipliers skyrocket.',
              color: 'orange'
            },
            { 
              icon: <BarChart3 className="text-green-light" />, 
              title: 'Performance Analytics', 
              description: 'Weekly and monthly completion charts with color-coded bars. Smart insights automatically detect patterns and highlight days that need improvement.',
              color: 'green'
            },
            { 
              icon: <Trophy className="text-amber" />, 
              title: 'XP & Achievements', 
              description: 'Earn XP for every habit completed. Unlock badges, level up your profile, and flex on the leaderboard.',
              color: 'amber'
            },
            { 
              icon: <Target className="text-blue-400" />, 
              title: 'Goal Targeting', 
              description: 'Set precision targets. Weekly, monthly, seasonal. The system adapts and recalibrates based on your actual performance.',
              color: 'blue'
            },
            { 
              icon: <Users className="text-purple-400" />, 
              title: 'Squad Mode', 
              description: 'Create habit squads with your crew. Accountability is power. Race each other, share wins, and grind together.',
              color: 'purple'
            },
            { 
              icon: <Bell className="text-green" />, 
              title: 'Smart Reminders', 
              description: 'AI learns your optimal reminder times. No spam, no noise — just the right nudge exactly when you need it most.',
              color: 'green'
            },
          ].map((feature, i) => (
            <div 
              key={i} 
              className="bg-surface border border-border rounded-2xl p-8 hover:border-green/30 hover:shadow-xl hover:shadow-green/10 transition group reveal"
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <div 
                className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 bg-${feature.color}-500/10 group-hover:scale-110 transition`}
              >
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="bg-surface border-y border-border py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16 reveal">
            <div className="text-sm uppercase tracking-wider text-gray-500 mb-4">Live Preview</div>
            <h2 className="text-4xl md:text-6xl font-serif mb-6">
              See <span className="text-green-light italic">Habitual</span> in action
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Track daily habits, analyze performance, compete globally, and unlock achievements. 
              Everything you need to build unstoppable momentum.
            </p>
          </div>

          {/* Demo View 1: Daily Dashboard - ACCURATE SCREENSHOT */}
          <div className="mb-32 reveal">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-green/10 border border-green/30 rounded-xl flex items-center justify-center text-green-light font-bold text-lg">
                    01
                  </div>
                  <span className="text-sm uppercase tracking-wider text-gray-500 font-semibold">Daily Tracking</span>
                </div>
                <h3 className="text-3xl md:text-5xl font-serif mb-6 leading-tight">
                  Your daily<br /><span className="text-green-light italic">command center</span>
                </h3>
                <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                  Check off habits with a single tap. See your progress update in real-time. 
                  Smart overdue detection keeps you accountable without being annoying.
                </p>
                <ul className="space-y-4">
                  {[
                    'One-tap habit completion',
                    'Auto-lock overdue habits',
                    'Real-time streak tracking',
                    'Smart reminder system'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-base">
                      <div className="w-6 h-6 bg-green/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check size={14} className="text-green" />
                      </div>
                      <span className="text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/*  Dashboard Preview */}
              <div className="bg-[#0a0c0b] border border-[#1a1d1a] rounded-3xl overflow-hidden shadow-2xl shadow-black/60">
                {/* Header */}
                <div className="bg-[#0a0c0b] border-b border-[#1a1d1a] px-6 py-4">
                  <div className="text-xs text-gray-600 flex items-center gap-2 mb-3">
                    <Calendar size={12} />
                    TUESDAY, FEBRUARY 24, 2026
                  </div>
                  <h1 className="text-3xl font-serif">
                    Good evening, <span className="text-green-light">Alex</span>
                  </h1>
                </div>

                {/* Dashboard Content */}
                <div className="p-6 space-y-4">
                  {/* Progress Card */}
                  <div className="bg-gradient-to-br from-green/5 to-transparent border border-green/20 rounded-2xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-xl font-serif mb-1">Today's Progress</h2>
                        <p className="text-sm text-gray-500">4 habits remaining</p>
                      </div>
                      <button className="px-4 py-2 bg-green/20 border border-green/40 rounded-xl text-sm font-semibold text-green-light">
                        + New Habit
                      </button>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-3 bg-[#0f110f] rounded-full overflow-hidden mb-3">
                      <div className="h-full bg-gradient-to-r from-green to-green-light rounded-full" style={{ width: '67%' }} />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">8 of 12 completed</span>
                      <span className="text-green-light font-bold text-lg">67%</span>
                    </div>
                  </div>

                  {/* TO DO Section */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Target size={16} className="text-amber" />
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                        TO DO (4)
                      </h3>
                    </div>

                    <div className="space-y-3">
                      {/* Overdue Habit */}
                      <div className="bg-[#0f110f] border-2 border-coral/50 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 rounded-lg border-2 border-coral bg-coral/10 flex items-center justify-center">
                            <X size={16} className="text-coral" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">🏋️</span>
                              <span className="font-medium text-coral">Gym Workout</span>
                              <span className="px-2 py-0.5 bg-coral/20 border border-coral/30 rounded text-xs font-semibold text-coral">
                                OVERDUE
                              </span>
                            </div>
                            <div className="text-xs text-coral mt-1 flex items-center gap-1">
                              <Clock size={10} />
                              07:00 (Missed)
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 p-2 bg-coral/10 border border-coral/20 rounded-lg">
                          <p className="text-xs text-coral flex items-center gap-1">
                            ⚠️ This habit's scheduled time has passed. It will be available again tomorrow.
                          </p>
                        </div>
                      </div>

                      {/* Regular Habits */}
                      {[
                        { emoji: '📖', name: 'Read 20 Pages', time: '20:00' },
                        { emoji: '🧠', name: 'Learn Something New', time: '21:00' },
                      ].map((habit, i) => (
                        <div key={i} className="bg-[#0f110f] border border-[#242824] rounded-xl p-4 hover:border-green/40 transition">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg border-2 border-green/50 hover:border-green hover:bg-green/10 transition" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{habit.emoji}</span>
                                <span className="font-medium">{habit.name}</span>
                              </div>
                              <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                <Clock size={10} />
                                {habit.time}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Demo View 2: Analytics */}
          <div className="mb-32 reveal">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1 bg-[#0a0c0b] border border-[#1a1d1a] rounded-3xl overflow-hidden shadow-2xl shadow-black/60">
                <div className="p-6 bg-[#0a0c0b] space-y-6">
                  {/* Weekly Analytics */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <BarChart3 size={16} className="text-green-light" />
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                          Weekly Analytics
                        </h3>
                      </div>
                      <div className="text-sm text-gray-500">
                        Avg: <span className="text-green-light font-bold">21%</span>
                      </div>
                    </div>

                    {/* Bar Chart */}
                    <div className="h-48 flex items-end justify-between gap-2 mb-4">
                      {[
                        { height: 0, label: 'WED', date: '18', color: 'red' },
                        { height: 0, label: 'THU', date: '19', color: 'red' },
                        { height: 0, label: 'FRI', date: '20', color: 'red' },
                        { height: 0, label: 'SAT', date: '21', color: 'red' },
                        { height: 0, label: 'SUN', date: '22', color: 'red' },
                        { height: 44, label: 'MON', date: '23', color: 'coral' },
                        { height: 89, label: 'TODAY', date: '24', color: 'yellow' },
                      ].map((day, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                          <div className="w-full h-48 flex flex-col items-center justify-end">
                            <div className="text-xs font-bold text-gray-400 mb-1">
                              {day.height}%
                            </div>
                            <div 
                              className={`w-full rounded-t-xl ${
                                day.height === 0 ? 'bg-gradient-to-t from-red-500 to-red-400' :
                                day.height < 50 ? 'bg-gradient-to-t from-red-400 to-red-300' :
                                day.height < 90 ? 'bg-gradient-to-t from-yellow-500 to-yellow-300' :
                                'bg-gradient-to-t from-yellow-600 to-yellow-400'
                              } ${i === 6 ? 'ring-2 ring-yellow-400' : ''}`}
                              style={{ height: `${Math.max(day.height, 5)}%` }}
                            />
                          </div>
                          <div className="text-center">
                            <div className={`text-xs font-bold ${i === 6 ? 'text-yellow-400' : 'text-gray-400'}`}>
                              {day.label}
                            </div>
                            <div className="text-[10px] text-gray-600">{day.date}</div>
                            <div className={`w-2 h-2 rounded-full mx-auto mt-1 ${
                              day.height === 0 ? 'bg-gray-600' :
                              day.height < 50 ? 'bg-red-400' : 'bg-yellow-400'
                            }`} />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Legend */}
                    <div className="flex items-center justify-center gap-6 text-xs text-gray-500 pb-4 border-b border-border/50">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-green-500" />
                        <span>100%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-yellow-500"/>
                        <span>50-99%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-red-400" />
                        <span>&lt;50%</span>
                      </div>
                    </div>

                    {/* Weekly Insight */}
                    <div className="p-4 bg-gradient-to-r from-amber/5 to-transparent border border-amber/20 rounded-xl">
                      <div className="flex items-start gap-3">
                        <div className="text-xl">💡</div>
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-amber mb-1">Weekly Insight</div>
                          <p className="text-sm text-gray-300 leading-relaxed">
                            ⚠️ Wednesday needs work – you didn't complete any habits.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Monthly Trend */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp size={16} className="text-green-light" />
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                          Monthly Trend
                        </h3>
                      </div>
                      <div className="text-sm text-gray-500">
                        Avg: <span className="text-green-light font-bold">6%</span>
                      </div>
                    </div>

                    {/* SVG Line Chart */}
                    <div className="h-32 relative">
                      <svg className="w-full h-full" viewBox="0 0 400 120" preserveAspectRatio="xMidYMid meet">
                        {/* Grid lines */}
                        {[0, 25, 50, 75, 100].map((value) => {
                          const y = 100 - (value * 0.8);
                          return (
                            <g key={value}>
                              <line
                                x1="30"
                                y1={y}
                                x2="380"
                                y2={y}
                                stroke="rgb(55, 65, 81)"
                                strokeWidth="1"
                                opacity="0.1"
                                strokeDasharray="3 3"
                              />
                              <text
                                x="10"
                                y={y + 4}
                                fill="rgb(107, 114, 128)"
                                fontSize="10"
                                textAnchor="start"
                              >
                                {value}%
                              </text>
                            </g>
                          );
                        })}

                        {/* Line */}
                        <polyline
                          fill="none"
                          stroke="rgb(109, 184, 92)"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points="40,100 140,100 240,100 340,85"
                        />

                        {/* Points */}
                        {[
                          { x: 40, y: 100, week: 'W1', value: 0 },
                          { x: 140, y: 100, week: 'W2', value: 0 },
                          { x: 240, y: 100, week: 'W3', value: 0 },
                          { x: 340, y: 85, week: 'W4', value: 21 },
                        ].map((point, i) => (
                          <g key={i}>
                            <circle
                              cx={point.x}
                              cy={point.y}
                              r="4"
                              fill="rgb(109, 184, 92)"
                              stroke="rgb(10, 12, 11)"
                              strokeWidth="2"
                            />
                          </g>
                        ))}

                        {/* Week labels */}
                        {[40, 140, 240, 340].map((x, i) => (
                          <text
                            key={i}
                            x={x}
                            y="118"
                            fill="rgb(156, 163, 175)"
                            fontSize="10"
                            textAnchor="middle"
                            fontFamily="monospace"
                          >
                            W{i + 1}
                          </text>
                        ))}
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="order-1 lg:order-2">
                <div className="inline-flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-green/10 border border-green/30 rounded-xl flex items-center justify-center text-green-light font-bold text-lg">
                    02
                  </div>
                  <span className="text-sm uppercase tracking-wider text-gray-500 font-semibold">Analytics Engine</span>
                </div>
                <h3 className="text-3xl md:text-5xl font-serif mb-6 leading-tight">
                  Understand your<br /><span className="text-green-light italic">patterns</span>
                </h3>
                <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                  Weekly and monthly charts reveal completion trends. Smart insights highlight 
                  weak days and suggest improvements. See exactly where you're winning and losing.
                </p>
                <ul className="space-y-4">
                  {[
                    'Color-coded completion bars',
                    'Weekly performance insights',
                    'Monthly trend analysis',
                    'Automatic pattern detection'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-base">
                      <div className="w-6 h-6 bg-green/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check size={14} className="text-green" />
                      </div>
                      <span className="text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Demo View 3 */}
          <div className="reveal">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-green/10 border border-green/30 rounded-xl flex items-center justify-center text-green-light font-bold text-lg">
                    03
                  </div>
                  <span className="text-sm uppercase tracking-wider text-gray-500 font-semibold">Competition</span>
                </div>
                <h3 className="text-3xl md:text-5xl font-serif mb-6 leading-tight">
                  Climb the<br /><span className="text-green-light italic">leaderboard</span>
                </h3>
                <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                  Compete globally on longest streaks, monthly completions, and challenges. 
                  Earn badges, level up, and prove you're the best.
                </p>
                <ul className="space-y-4">
                  {[
                    'Global leaderboards',
                    'Squad competitions',
                    'Achievement badges',
                    'Real-time rankings'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-base">
                      <div className="w-6 h-6 bg-green/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check size={14} className="text-green" />
                      </div>
                      <span className="text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Leaderboard Preview */}
              <div className="bg-[#0a0c0b] border border-[#1a1d1a] rounded-3xl overflow-hidden shadow-2xl shadow-black/60">
                <div className="bg-[#0f110f] border-b border-[#1a1d1a] px-4 py-3 flex items-center gap-2">
                  <Trophy size={16} className="text-amber" />
                  <span className="text-sm font-mono text-gray-400">Global Leaderboard</span>
                </div>
                <div className="p-6 space-y-3">
                  {[
                    { rank: '👑', name: 'ALEX_BEAST', streak: 247, color: 'border-amber/50' },
                    { rank: '🥈', name: 'MARIA_FIT', streak: 198, color: 'border-gray-400/50' },
                    { rank: '🥉', name: 'JOHN_GRIND', streak: 165, color: 'border-orange-400/50' },
                    { rank: '4', name: 'EMMA_STRONG', streak: 142, color: 'border-gray-700' },
                    { rank: '5', name: 'YOU', streak: 47, color: 'border-green', highlight: true },
                  ].map((entry, i) => (
                    <div 
                      key={i}
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 hover:scale-102 ${
                        entry.highlight 
                          ? 'bg-green/10 border-green shadow-lg shadow-green/20' 
                          : `bg-[#0f110f] ${entry.color}`
                      }`}
                    >
                      <div className="w-10 text-center text-2xl">{entry.rank}</div>
                      <div className="flex-1 font-mono text-sm font-bold tracking-wider">{entry.name}</div>
                      <div className="flex items-center gap-2 text-orange-400 font-bold">
                        <Flame size={16} />
                        <span>{entry.streak}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-24 text-center reveal">
            <h3 className="text-3xl md:text-4xl font-serif mb-6">Ready to track like a <span className="text-green-light italic">pro</span>?</h3>
            <p className="text-gray-400 text-lg mb-8">
              Join 48,000+ users building unstoppable habits with Habitual.
            </p>
            <Link 
              to="/signup" 
              className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-gradient-to-r from-green to-green-light text-white font-semibold text-lg hover:shadow-xl hover:shadow-green/30 transition transform hover:scale-105"
            >
              Start Free Trial
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-20 md:py-32">
        <div className="text-center mb-16 reveal">
          <div className="text-sm uppercase tracking-wider text-gray-500 mb-4">Trusted Worldwide</div>
          <h2 className="text-4xl md:text-6xl font-serif mb-6">
            Built for <span className="text-green-light italic">champions</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {[
            { icon: <Star className="text-amber" />, value: '4.9/5', label: 'App Store Rating' },
            { icon: <Trophy className="text-green" />, value: '#1', label: 'Habit Tracker 2026' },
            { icon: <Zap className="text-blue-400" />, value: '100%', label: 'Private & Secure' },
            { icon: <Target className="text-purple-400" />, value: 'Free', label: 'Forever Plan' },
          ].map((stat, i) => (
            <div key={i} className="text-center reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
              <div className="w-16 h-16 mx-auto mb-4 bg-surface border border-border rounded-2xl flex items-center justify-center">
                {stat.icon}
              </div>
              <div className="text-3xl font-serif text-green-light mb-2">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-4 reveal">
          {[
            '✓ No credit card required',
            '✓ Cancel anytime',
            '✓ GDPR compliant',
            '✓ 2-minute setup'
          ].map((badge, i) => (
            <div key={i} className="px-4 py-2 bg-surface border border-border rounded-lg text-sm text-gray-400">
              {badge}
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-surface border-y border-border py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16 reveal">
            <div className="text-sm uppercase tracking-wider text-gray-500 mb-4">Choose Your Plan</div>
            <h2 className="text-4xl md:text-6xl font-serif">Level Select</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { 
                name: 'Rookie', 
                price: '£0', 
                period: 'forever free', 
                features: ['Up to 3 habits', '7-day streak tracking', 'Basic analytics', 'Mobile app access'],
                featured: false 
              },
              { 
                name: 'Pro', 
                price: '£9', 
                period: 'per month', 
                features: ['Unlimited habits', 'Full streak history', 'AI-powered analytics', 'Squad mode (5 members)', 'Custom reminders', 'XP & achievements'],
                featured: true 
              },
              { 
                name: 'Elite', 
                price: '£19', 
                period: 'per month', 
                features: ['Everything in Pro', 'Unlimited squad members', '1-on-1 coaching integrations', 'API access', 'Priority support', 'Early feature access'],
                featured: false 
              },
            ].map((plan, i) => (
              <div 
                key={i}
                className={`bg-bg border rounded-3xl p-8 relative reveal ${
                  plan.featured ? 'border-green shadow-2xl shadow-green/20 scale-105' : 'border-border'
                }`}
                style={{ transitionDelay: `${i * 0.1}s` }}
              >
                {plan.featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-green to-green-light rounded-full text-xs font-semibold text-white">
                    MOST POPULAR
                  </div>
                )}
                <div className="text-2xl font-serif mb-2">{plan.name}</div>
                <div className="flex items-baseline gap-2 mb-1">
                  <div className="text-5xl font-serif text-green-light">{plan.price}</div>
                  <div className="text-gray-500 text-sm">/{plan.period}</div>
                </div>
                <ul className="space-y-3 mb-8 mt-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm">
                      <Check size={16} className="text-green mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/signup"
                  className={`block text-center py-3 rounded-xl font-semibold transition ${
                    plan.featured
                      ? 'bg-gradient-to-r from-green to-green-light text-white hover:shadow-lg hover:shadow-green/20'
                      : 'bg-surface border border-border hover:border-green'
                  }`}
                >
                  {plan.featured ? 'Go Pro' : `Choose ${plan.name}`}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="reviews" className="max-w-7xl mx-auto px-6 md:px-12 py-20 md:py-32">
        <div className="text-center mb-16 reveal">
          <div className="text-sm uppercase tracking-wider text-gray-500 mb-4">What They Say</div>
          <h2 className="text-4xl md:text-6xl font-serif mb-6">
            The <span className="text-green-light italic">community</span> speaks
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { 
              quote: 'Habitual completely rewired how I approach training. The streak system is genuinely addictive. 67 days straight and not stopping.', 
              name: 'Marcus F.', 
              role: 'Powerlifter // 67 day streak', 
              emoji: '🏋️' 
            },
            { 
              quote: 'The Squad Mode is everything. Me and my training partners hold each other accountable every single day. Built different fr.', 
              name: 'Zara R.', 
              role: 'Marathon Runner // 134 day streak', 
              emoji: '🏃' 
            },
            { 
              quote: 'The analytics are actually insightful. Not just charts — it tells me exactly what\'s working. My sleep + workout correlation blew my mind.', 
              name: 'Kai W.', 
              role: 'CrossFit Athlete // 89 day streak', 
              emoji: '🧘' 
            },
          ].map((testi, i) => (
            <div 
              key={i}
              className="bg-surface border border-border rounded-2xl p-8 reveal hover:border-green/30 transition"
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <div className="text-6xl text-green/20 mb-4">"</div>
              <p className="text-gray-300 mb-6 leading-relaxed">{testi.quote}</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green/20 rounded-full flex items-center justify-center text-2xl">
                  {testi.emoji}
                </div>
                <div>
                  <div className="font-semibold">{testi.name}</div>
                  <div className="text-sm text-gray-500">{testi.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-br from-green/10 to-surface border-y border-border py-20 md:py-32">
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
          <h2 className="text-4xl md:text-6xl font-serif mb-6 reveal">
            Your grind starts <span className="text-green-light italic">now.</span>
          </h2>
          <p className="text-xl text-gray-400 mb-10 reveal">
            Join 48,000+ people already using Habitual to build unstoppable habits.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center reveal">
            <input 
              type="email" 
              placeholder="your@email.com"
              className="px-6 py-4 rounded-xl bg-bg border border-border focus:border-green focus:outline-none w-full sm:w-auto"
            />
            <Link 
              to="/signup"
              className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-green to-green-light text-white font-semibold hover:shadow-xl hover:shadow-green/30 transition w-full sm:w-auto justify-center"
            >
              GET IN
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-2xl font-serif text-green-light flex items-center gap-2">
              habitual
            </div>
            <div className="text-sm text-gray-500">© 2026 HABITUAL - All rights reserved</div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <a href="/privacy" className="hover:text-white transition">Privacy</a>
              <a href="/terms" className="hover:text-white transition">Terms</a>
              <a href="/contact" className="hover:text-white transition">Contact</a>
            </div>
          </div>
        </div>
      </footer>

      <style>
        {`
          @keyframes slideInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          .animate-fadeIn {
            animation: fadeIn 0.5s ease-out;
          }

          .reveal {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s ease, transform 0.6s ease;
          }
          
          .reveal.visible {
            opacity: 1;
            transform: translateY(0);
          }
        `}
      </style>
    </div>
  );
};

export default Landing;
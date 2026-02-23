import { Link } from 'react-router-dom';
import { ArrowRight, Target, TrendingUp, Trophy, Bell, BarChart3, Flame } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-bg text-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-bg/80 backdrop-blur-xl border-b border-border px-6 md:px-12 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-3xl font-serif text-green-light flex items-center gap-2">
            {/* <div className="w-8 h-8 bg-gradient-to-br from-green to-green-light rounded-lg flex items-center justify-center text-sm">
              🌿
            </div> */}
            habitual
          </div>
          
          <div className="flex items-center gap-4">
            <Link 
              to="/login"
              className="text-sm px-4 py-2 rounded-lg border border-border hover:border-green transition"
            >
              Log in
            </Link>
            <Link 
              to="/signup"
              className="text-sm px-6 py-2 rounded-lg bg-gradient-to-r from-green to-green-light text-white font-semibold hover:shadow-lg hover:shadow-green/20 transition"
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-20 md:py-32 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green/10 border border-green/20 text-green-light text-sm mb-8">
          <div className="w-2 h-2 bg-green rounded-full animate-pulse" />
          Now with AI-powered insights & competitions
        </div>

        <h1 className="text-5xl md:text-7xl font-serif leading-tight mb-6">
          Small habits.<br />
          <span className="text-green-light italic">Big life.</span><br />
          <span className="text-gray-500">Track both.</span>
        </h1>

        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Habitual helps you build meaningful routines, understand your patterns, and compete with others — one day at a time. No fluff. Just progress.
        </p>

        <div className="flex items-center justify-center gap-4 mb-6">
          <Link 
            to="/signup"
            className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-green to-green-light text-white font-semibold text-lg hover:shadow-xl hover:shadow-green/30 transition"
          >
            🌱 Start for free
            <ArrowRight size={20} />
          </Link>
          <a 
            href="#features"
            className="px-8 py-4 rounded-xl bg-surface border border-border hover:border-green transition"
          >
            See how it works ↓
          </a>
        </div>

        <p className="text-sm text-gray-600">
          Free forever · No credit card · Takes 2 minutes to set up
        </p>

        {/* Mini Preview */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-2xl shadow-black/40">
            <div className="bg-surface border-b border-border px-4 py-3 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-coral" />
              <div className="w-3 h-3 rounded-full bg-amber" />
              <div className="w-3 h-3 rounded-full bg-green" />
              <div className="flex-1 text-center text-xs text-gray-500">app.habitual.io/dashboard</div>
            </div>
            <div className="p-8 grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-3">
                <div className="h-12 bg-green/10 border-l-4 border-green rounded-xl flex items-center px-4 gap-3">
                  <div className="text-2xl">🧘</div>
                  <div className="flex-1 text-left text-sm">Morning Meditation</div>
                  <div className="w-6 h-6 rounded-full bg-green flex items-center justify-center text-xs">✓</div>
                </div>
                <div className="h-12 bg-blue-500/10 border-l-4 border-blue-500 rounded-xl flex items-center px-4 gap-3">
                  <div className="text-2xl">💧</div>
                  <div className="flex-1 text-left text-sm">Drink 8 Glasses</div>
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs">✓</div>
                </div>
                <div className="h-12 bg-amber/10 border-l-4 border-amber rounded-xl flex items-center px-4 gap-3">
                  <div className="text-2xl">📖</div>
                  <div className="flex-1 text-left text-sm">Read 20 Pages</div>
                  <div className="w-6 h-6 rounded-full border-2 border-border" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="bg-bg rounded-xl p-4 text-center">
                  <div className="text-3xl font-serif text-green-light mb-1">60%</div>
                  <div className="text-xs text-gray-500">Today</div>
                </div>
                <div className="bg-bg rounded-xl p-3">
                  <div className="flex justify-between items-end h-12">
                    <div className="w-2 h-8 bg-green rounded-t" />
                    <div className="w-2 h-10 bg-green rounded-t" />
                    <div className="w-2 h-6 bg-green rounded-t" />
                    <div className="w-2 h-3 bg-coral rounded-t" />
                    <div className="w-2 h-9 bg-green rounded-t" />
                    <div className="w-2 h-12 bg-green rounded-t" />
                    <div className="w-2 h-5 bg-amber/50 rounded-t" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Band */}
      <section className="border-y border-border bg-surface py-12">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-serif text-green-light mb-2">48k+</div>
            <div className="text-sm text-gray-500 uppercase tracking-wider">Active users</div>
          </div>
          <div>
            <div className="text-4xl font-serif text-green-light mb-2">2.4M</div>
            <div className="text-sm text-gray-500 uppercase tracking-wider">Habits tracked</div>
          </div>
          <div>
            <div className="text-4xl font-serif text-green-light mb-2">91%</div>
            <div className="text-sm text-gray-500 uppercase tracking-wider">Complete more goals</div>
          </div>
          <div>
            <div className="text-4xl font-serif text-green-light mb-2">34</div>
            <div className="text-sm text-gray-500 uppercase tracking-wider">Avg. streak days</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-6 md:px-12 py-20 md:py-32">
        <div className="text-center mb-16">
          <div className="text-sm uppercase tracking-wider text-gray-500 mb-4">What you get</div>
          <h2 className="text-4xl md:text-5xl font-serif mb-4">
            Everything you need to <span className="text-green-light italic">actually</span> build habits
          </h2>
          <p className="text-gray-400 max-w-lg mx-auto">
            No bloat. No gamification gimmicks. Just the tools that actually work.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Target className="text-green" />}
            title="Daily Habit Tracking"
            description="Check off your habits each day with a satisfying tap. Set custom times, frequencies, and reminders for every habit."
            color="#6db85c"
          />
          <FeatureCard
            icon={<Flame className="text-amber" />}
            title="Streak Protection"
            description="See your streaks grow day by day. Get gentle nudges before you break one. One miss won't ruin you — the app helps you recover."
            color="#e8c46a"
          />
          <FeatureCard
            icon={<Bell className="text-blue-400" />}
            title="Smart Notifications"
            description="Context-aware reminders that adapt to your schedule. Celebrate completions. Alert for missed habits. Never spam."
            color="#60a5fa"
          />
          <FeatureCard
            icon={<BarChart3 className="text-green-light" />}
            title="Weekly & Monthly Analytics"
            description="Beautiful charts show your completion rates, best days, weakest habits, and long-term trends at a glance."
            color="#9dd48e"
          />
          <FeatureCard
            icon={<TrendingUp className="text-purple-400" />}
            title="AI-Powered Insights"
            description="Machine learning surfaces patterns in your data — your best times, risk habits, and personalised suggestions to improve."
            color="#c084fc"
          />
          <FeatureCard
            icon={<Trophy className="text-amber" />}
            title="Competitions & Leaderboard"
            description="Compete with others on longest streaks, monthly completions, and challenges. Social motivation = 10x engagement!"
            color="#e8c46a"
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-6 md:px-12 py-20 text-center">
        <h2 className="text-4xl md:text-5xl font-serif mb-4">
          Your best year starts<br />
          <span className="text-green-light italic">today.</span>
        </h2>
        <p className="text-gray-400 mb-8">Join 48,000 people already building better habits.</p>
        <Link 
          to="/signup"
          className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-gradient-to-r from-green to-green-light text-white font-semibold text-lg hover:shadow-xl hover:shadow-green/30 transition"
        >
          🌿 Start building habits — it's free
        </Link>
        <p className="text-sm text-gray-600 mt-4">
          No credit card needed · Cancel anytime · 2 minutes to set up
        </p>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <div className="text-lg font-serif text-green-light">🌿 habitual</div>
          <div className="text-sm text-gray-500">© 2026 Habitual. Helping humans build better lives.</div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, color }) => (
  <div className="bg-surface border border-border rounded-2xl p-6 hover:border-border/60 transition group">
    <div 
      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
      style={{ backgroundColor: color + '20' }}
    >
      {icon}
    </div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
  </div>
);

export default Landing;
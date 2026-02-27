import { useState, useEffect } from 'react';
import { Medal, Crown, Loader2, TrendingUp, Trophy, Award, Flame, Target, Zap, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { competitions, auth } from '../services/api';

const Leaderboard = () => {
  const [user, setUser] = useState(null);
  const [activeCompetitions, setActiveCompetitions] = useState([]);
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [leaderboard, setLeaderboard] = useState(null);
  const [achievements, setAchievements] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [useDummyData, setUseDummyData] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    
    const loadData = async () => {
      if (!mounted) return;
      
      setIsLoading(true);
      try {
        const [userRes, competitionsRes, achievementsRes] = await Promise.all([
          auth.getMe(),
          competitions.getActive(),
          competitions.getAchievements(),
        ]);

        if (!mounted) return;

        setUser(userRes.data);

        // Check if we have real data or need dummy data
        if (competitionsRes.data.active_competitions && competitionsRes.data.active_competitions.length > 0) {
          setActiveCompetitions(competitionsRes.data.active_competitions);
          setAchievements(achievementsRes.data);
          setUseDummyData(false);

          // Load first competition
          const firstComp = competitionsRes.data.active_competitions[0];
          setSelectedCompetition(firstComp.id);
          await loadLeaderboard(firstComp.id);
        } else {
          // Use dummy data if no real competitions
          setUseDummyData(true);
          setActiveCompetitions(DUMMY_COMPETITIONS);
          setAchievements(DUMMY_ACHIEVEMENTS);
          setSelectedCompetition('longest_streak');
          setLeaderboard(DUMMY_LEADERBOARD);
        }
      } catch (error) {
        console.error('Failed to load leaderboard:', error);
        // Fallback to dummy data on error
        if (mounted) {
          setUseDummyData(true);
          setActiveCompetitions(DUMMY_COMPETITIONS);
          setAchievements(DUMMY_ACHIEVEMENTS);
          setSelectedCompetition('longest_streak');
          setLeaderboard(DUMMY_LEADERBOARD);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadData();
    
    return () => {
      mounted = false;
    };
  }, []); 

  const loadLeaderboard = async (competitionId) => {
    try {
      setLeaderboard(null); 
      const response = await competitions.getLeaderboard(competitionId);
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
      // Use dummy data for this competition
      setLeaderboard(DUMMY_LEADERBOARDS[competitionId] || DUMMY_LEADERBOARD);
    }
  };

  const handleSelectCompetition = async (competitionId) => {
    setSelectedCompetition(competitionId);
    setLeaderboard(null);
    
    if (useDummyData) {
      // Simulate loading delay for demo
      setTimeout(() => {
        setLeaderboard(DUMMY_LEADERBOARDS[competitionId] || DUMMY_LEADERBOARD);
      }, 500);
    } else {
      await loadLeaderboard(competitionId);
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
    
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-400 hover:text-green transition group mb-6"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          Back to Dashboard
        </button>
        
        {/* Greeting */}
        <h1 className="text-3xl md:text-4xl font-serif leading-tight mb-2">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, 
          <span className="text-green-light"> {user?.first_name}!</span>
        </h1>
        
        {/* Date */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Calendar size={12} />
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      {/* Leaderboard Title */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green/10 border border-green/20 text-green-light text-sm mb-4">
            <Trophy className="w-4 h-4" />
            {useDummyData ? 'Preview Mode' : 'Live Competition'}
          </div>
          <h2 className="text-4xl md:text-5xl font-serif mb-3">
            🏆 Global <span className="text-green-light italic">Leaderboard</span>
          </h2>
          <p className="text-gray-400 text-lg">
            Compete with others, earn badges, and climb the rankings!
          </p>
        </div>
            <div className="max-w-7xl mx-auto px-6 py-8">
              
              {/* Header */}
              <div className="mb-8 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green/10 border border-green/20 text-green-light text-sm mb-4">
                  <Trophy className="w-4 h-4" />
                  {useDummyData ? 'Preview Mode' : 'Live Competition'}
                </div>
                <h1 className="text-4xl md:text-5xl font-serif mb-3">
                  🏆 Global <span className="text-green-light italic">Leaderboard</span>
                </h1>
                <p className="text-gray-400 text-lg">
                  Compete with others, earn badges, and climb the rankings!
                </p>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                
                {/* Left - Competition Selector */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Competitions */}
                  <div className="bg-surface border border-border rounded-2xl p-6 sticky top-24">
                    <div className="flex items-center gap-2 mb-4">
                      <Target size={16} className="text-green-light" />
                      <h2 className="text-sm uppercase tracking-wider text-gray-400 font-semibold">
                        Active Competitions
                      </h2>
                    </div>
                    
                    <div className="space-y-3">
                      {activeCompetitions.map((comp) => (
                        <button
                          key={comp.id}
                          onClick={() => handleSelectCompetition(comp.id)}
                          className={`w-full text-left p-4 rounded-xl border transition-all ${
                            selectedCompetition === comp.id
                              ? 'bg-green/10 border-green shadow-lg shadow-green/10 scale-102'
                              : 'bg-bg border-border hover:border-green/50 hover:bg-green/5'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="text-3xl">{getCompetitionIcon(comp.id)}</div>
                            <div className="flex-1">
                              <h3 className="font-semibold mb-1">{comp.title}</h3>
                              <p className="text-xs text-gray-400 leading-relaxed">
                                {comp.description}
                              </p>
                              {comp.prize && (
                                <div className="mt-2 flex items-center gap-1 text-xs text-amber">
                                  <Award size={12} />
                                  {comp.prize}
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Quick Stats */}
                    <div className="mt-6 pt-6 border-t border-border">
                      <h3 className="text-sm uppercase tracking-wider text-gray-400 font-semibold mb-3">
                        Your Stats
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-bg border border-border rounded-xl p-3 text-center">
                          <div className="text-2xl font-bold text-green-light">
                            {achievements?.total_badges || 3}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">Badges</div>
                        </div>
                        <div className="bg-bg border border-border rounded-xl p-3 text-center">
                          <div className="text-2xl font-bold text-amber">
                            #{leaderboard?.your_position?.rank || 42}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">Rank</div>
                        </div>
                      </div>
                    </div>

                    {/* Achievements Section */}
                    {achievements && achievements.badges && achievements.badges.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-border">
                        <div className="flex items-center gap-2 mb-4">
                          <Medal size={16} className="text-amber" />
                          <h2 className="text-sm uppercase tracking-wider text-gray-400 font-semibold">
                            Your Badges ({achievements.total_badges})
                          </h2>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {achievements.badges.map((badge) => (
                            <div
                              key={badge.id}
                              className="group flex flex-col items-center gap-2 p-3 bg-bg rounded-xl border border-border hover:border-green/30 hover:bg-green/5 transition cursor-pointer"
                              title={badge.description}
                            >
                              <div className="text-2xl group-hover:scale-110 transition-transform">{badge.icon}</div>
                              <div className="text-[10px] text-center text-gray-400 leading-tight">
                                {badge.name}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right - Leaderboard */}
                <div className="lg:col-span-2">
                  {leaderboard ? (
                    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
                      {/* Header */}
                      <div className="p-6 border-b border-border bg-gradient-to-r from-green/10 via-green/5 to-bg">
                        <div className="flex items-start justify-between">
                          <div>
                            <h2 className="text-2xl font-serif mb-2">
                              {leaderboard.competition.title}
                            </h2>
                            <p className="text-sm text-gray-400">
                              {leaderboard.competition.description}
                            </p>
                          </div>
                          <div className="text-4xl">{getCompetitionIcon(selectedCompetition)}</div>
                        </div>

                        {/* Top 3 Podium */}
                        <div className="grid grid-cols-3 gap-4 mt-6">
                          {leaderboard.leaderboard.slice(0, 3).map((entry, idx) => (
                            <div 
                              key={idx}
                              className={`text-center p-4 rounded-xl border transition ${
                                idx === 0 ? 'bg-amber/10 border-amber/30 scale-105' :
                                idx === 1 ? 'bg-gray-400/10 border-gray-400/30' :
                                'bg-orange-400/10 border-orange-400/30'
                              }`}
                            >
                              <div className="text-3xl mb-2">
                                {idx === 0 ? '👑' : idx === 1 ? '🥈' : '🥉'}
                              </div>
                              <div className="font-bold text-sm mb-1 truncate">
                                {entry.user}
                              </div>
                              <div className="text-xl font-serif text-green-light">
                                {entry.score}
                              </div>
                              <div className="text-xs text-gray-500">{entry.metric}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Leaderboard Table */}
                      <div className="divide-y divide-border">
                        {leaderboard.leaderboard.map((entry, idx) => (
                          <div
                            key={idx}
                            className={`p-4 flex items-center gap-4 transition-all ${
                              entry.is_you 
                                ? 'bg-green/10 border-l-4 border-green hover:bg-green/15' 
                                : 'hover:bg-bg/50'
                            }`}
                          >
                            {/* Rank */}
                            <div className="w-16 flex-shrink-0 text-center">
                              {entry.rank === 1 ? (
                                <Crown size={28} className="text-amber inline" />
                              ) : entry.rank === 2 ? (
                                <Medal size={28} className="text-gray-400 inline" />
                              ) : entry.rank === 3 ? (
                                <Medal size={28} className="text-orange-400 inline" />
                              ) : (
                                <div className={`text-lg font-bold ${entry.is_you ? 'text-green-light' : 'text-gray-500'}`}>
                                  #{entry.rank}
                                </div>
                              )}
                            </div>

                            {/* User */}
                            <div className="flex-1">
                              <div className={`font-semibold flex items-center gap-2 ${entry.is_you ? 'text-green-light' : ''}`}>
                                {entry.user}
                                {entry.is_you && (
                                  <span className="px-2 py-0.5 bg-green/20 border border-green/30 rounded text-xs font-semibold text-green-light">
                                    YOU
                                  </span>
                                )}
                              </div>
                              {entry.habit && (
                                <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                  <Flame size={12} className="text-orange-400" />
                                  {entry.habit}
                                </div>
                              )}
                            </div>

                            {/* Score */}
                            <div className="text-right">
                              <div className={`text-2xl font-serif ${entry.is_you ? 'text-green-light' : 'text-green'}`}>
                                {entry.score}
                              </div>
                              <div className="text-xs text-gray-500 uppercase tracking-wider">
                                {entry.metric}
                              </div>
                            </div>

                            {/* Badge */}
                            {entry.badge && (
                              <div className="text-2xl">{entry.badge}</div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Your Position (if not in top 10) */}
                      {leaderboard.your_position && (
                        <div className="p-4 bg-green/5 border-t-2 border-green">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-green-light flex items-center gap-2">
                                <TrendingUp size={16} />
                                Your Position
                              </div>
                              <div className="text-sm text-gray-400 mt-1">
                                {leaderboard.your_position.message}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-serif text-green-light">
                                #{leaderboard.your_position.rank}
                              </div>
                              <div className="text-xs text-gray-500">
                                {leaderboard.your_position.score} {leaderboard.your_position.metric}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Motivation */}
                      <div className="p-4 bg-gradient-to-r from-green/5 to-transparent border-t border-border">
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-300">
                          <Zap size={16} className="text-green-light" />
                          {leaderboard.motivation}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-surface border border-border rounded-2xl p-12 text-center">
                      <Loader2 size={40} className="animate-spin text-green mx-auto mb-4" />
                      <p className="text-gray-400">Loading leaderboard...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            </div>
          </div>
        );
      };

    // Helper
    const getCompetitionIcon = (id) => {
      const icons = {
        longest_streak: '🔥',
        monthly_champion: '📅',
        perfect_week: '💯',
        hundred_club: '💎',
      };
      return icons[id] || '🏆';
    };

    // Dummy Data for Preview/Demo
    const DUMMY_COMPETITIONS = [
      {
        id: 'longest_streak',
        title: 'Longest Streak',
        description: 'Compete for the longest active habit streak',
        prize: 'Premium Badge + 500 XP'
      },
      {
        id: 'monthly_champion',
        title: 'Monthly Champion',
        description: 'Most habits completed this month',
        prize: 'Champion Crown + 1000 XP'
      },
      {
        id: 'perfect_week',
        title: 'Perfect Week',
        description: 'Complete 100% of habits for 7 days',
        prize: 'Perfect Week Badge'
      },
      {
        id: 'hundred_club',
        title: '100 Club',
        description: 'Reach 100 day streak on any habit',
        prize: 'Century Badge + 2000 XP'
      },
    ];

  const DUMMY_ACHIEVEMENTS = {
    total_badges: 5,
    badges: [
      { id: 1, name: 'Starter', icon: '🌱', description: 'Created your first habit' },
      { id: 2, name: '7 Day', icon: '📅', description: '7 day streak' },
      { id: 3, name: '30 Day', icon: '🏆', description: '30 day streak' },
      { id: 4, name: 'Perfect', icon: '💯', description: 'Perfect week' },
      { id: 5, name: 'Champion', icon: '👑', description: 'Monthly winner' },
    ]
  };

  const DUMMY_LEADERBOARD = {
    competition: {
      title: 'Longest Streak Competition',
      description: 'Who can maintain the longest habit streak?'
    },
    leaderboard: [
      { rank: 1, user: 'ALEX_BEAST', score: 247, metric: 'days', habit: 'Morning Workout', badge: '👑' },
      { rank: 2, user: 'MARIA_FIT', score: 198, metric: 'days', habit: 'Meditation', badge: '🥈' },
      { rank: 3, user: 'JOHN_GRIND', score: 165, metric: 'days', habit: 'Reading', badge: '🥉' },
      { rank: 4, user: 'EMMA_STRONG', score: 142, metric: 'days', habit: 'Gym Session' },
      { rank: 5, user: 'YOU', score: 47, metric: 'days', habit: 'Morning Run', is_you: true },
      { rank: 6, user: 'SARAH_PEAK', score: 89, metric: 'days', habit: 'Journaling' },
      { rank: 7, user: 'MIKE_DAILY', score: 76, metric: 'days', habit: 'Cold Shower' },
      { rank: 8, user: 'LISA_HABIT', score: 62, metric: 'days', habit: 'Water Intake' },
      { rank: 9, user: 'TOM_TRACKER', score: 54, metric: 'days', habit: 'Early Wake' },
      { rank: 10, user: 'KAI_WELLNESS', score: 48, metric: 'days', habit: 'Stretching' },
    ],
    your_position: {
      rank: 5,
      score: 47,
      metric: 'days',
      message: "You're in the top 5! Keep going!"
    },
    motivation: "Keep grinding! You're 95 days from top 3! 🔥"
  };

  const DUMMY_LEADERBOARDS = {
    monthly_champion: {
      competition: {
        title: 'Monthly Champion',
        description: 'Most habits completed in February 2026'
      },
      leaderboard: [
        { rank: 1, user: 'PRODUCTIVITY_KING', score: 324, metric: 'habits', badge: '👑' },
        { rank: 2, user: 'HABIT_QUEEN', score: 298, metric: 'habits', badge: '🥈' },
        { rank: 3, user: 'CONSISTENCY_PRO', score: 276, metric: 'habits', badge: '🥉' },
        { rank: 4, user: 'DAILY_GRINDER', score: 245, metric: 'habits' },
        { rank: 5, user: 'YOU', score: 189, metric: 'habits', is_you: true },
        { rank: 6, user: 'TRACKER_MASTER', score: 178, metric: 'habits' },
        { rank: 7, user: 'ROUTINE_BOSS', score: 167, metric: 'habits' },
        { rank: 8, user: 'GOAL_CRUSHER', score: 156, metric: 'habits' },
        { rank: 9, user: 'HABIT_HERO', score: 145, metric: 'habits' },
        { rank: 10, user: 'STREAK_LEGEND', score: 134, metric: 'habits' },
      ],
      your_position: { rank: 5, score: 189, metric: 'habits', message: "Great month! Keep it up!" },
      motivation: "You're doing amazing! 87 more habits to reach top 3! 💪"
    },
    perfect_week: {
      competition: {
        title: 'Perfect Week Challenge',
        description: '100% completion for 7 consecutive days'
      },
      leaderboard: [
        { rank: 1, user: 'PERFECT_PETE', score: 12, metric: 'weeks', badge: '👑' },
        { rank: 2, user: 'FLAWLESS_FINN', score: 9, metric: 'weeks', badge: '🥈' },
        { rank: 3, user: 'COMPLETE_CHRIS', score: 7, metric: 'weeks', badge: '🥉' },
        { rank: 4, user: 'WEEK_WARRIOR', score: 5, metric: 'weeks' },
        { rank: 5, user: 'HUNDRED_HANNAH', score: 4, metric: 'weeks' },
        { rank: 6, user: 'YOU', score: 3, metric: 'weeks', is_you: true },
        { rank: 7, user: 'FULL_FRED', score: 2, metric: 'weeks' },
        { rank: 8, user: 'ALL_IN_ALICE', score: 2, metric: 'weeks' },
        { rank: 9, user: 'TOTAL_TOM', score: 1, metric: 'weeks' },
        { rank: 10, user: 'COMPLETE_CAROL', score: 1, metric: 'weeks' },
      ],
      your_position: { rank: 6, score: 3, metric: 'weeks', message: "3 perfect weeks! Incredible!" },
      motivation: "One more perfect week and you'll crack top 5! 💯"
    },
    hundred_club: {
      competition: {
        title: '100 Club',
        description: 'Exclusive club for 100+ day streaks'
      },
      leaderboard: [
        { rank: 1, user: 'CENTURY_CHAMPION', score: 365, metric: 'days', badge: '👑' },
        { rank: 2, user: 'YEAR_LONG_YUKI', score: 287, metric: 'days', badge: '🥈' },
        { rank: 3, user: 'TRIPLE_DIGIT_DAN', score: 234, metric: 'days', badge: '🥉' },
        { rank: 4, user: 'HUNDRED_HANK', score: 198, metric: 'days' },
        { rank: 5, user: 'LONG_STREAK_LOU', score: 167, metric: 'days' },
        { rank: 6, user: 'PERSISTENT_PAT', score: 145, metric: 'days' },
        { rank: 7, user: 'ENDURANCE_EVE', score: 123, metric: 'days' },
        { rank: 8, user: 'MARATHON_MAX', score: 112, metric: 'days' },
        { rank: 9, user: 'STEADY_SAM', score: 105, metric: 'days' },
        { rank: 10, user: 'DEDICATED_DEE', score: 101, metric: 'days' },
      ],
      your_position: { rank: 42, score: 47, metric: 'days', message: "53 more days to join the club!" },
      motivation: "You're halfway there! Keep that streak alive! 🔥"
    }
};

export default Leaderboard;
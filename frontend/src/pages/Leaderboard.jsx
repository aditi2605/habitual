import { useState, useEffect } from 'react';
import { Medal, Crown, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/NavBar';
import { competitions, auth } from '../services/api';

const Leaderboard = () => {
  const [user, setUser] = useState(null);
  const [activeCompetitions, setActiveCompetitions] = useState([]);
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [leaderboard, setLeaderboard] = useState(null);
  const [achievements, setAchievements] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
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
      setActiveCompetitions(competitionsRes.data.active_competitions);
      setAchievements(achievementsRes.data);

      // Load first competition
      if (competitionsRes.data.active_competitions.length > 0) {
        const firstComp = competitionsRes.data.active_competitions[0];
        setSelectedCompetition(firstComp.id);
        await loadLeaderboard(firstComp.id);
      }
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
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
    // Set empty leaderboard instead of staying in loading state
    setLeaderboard({
      competition: { title: 'Competition', description: 'Loading failed' },
      leaderboard: [],
      your_position: null,
      motivation: 'Try again later'
    });
  }
};

  const handleSelectCompetition = async (competitionId) => {
    setSelectedCompetition(competitionId);
    setLeaderboard(null);
    await loadLeaderboard(competitionId);
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

      {/* navigate to the dashboard */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-400 hover:text-green transition"
        >
          ← Back to Dashboard
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-serif mb-2">
            🏆 Competitions & <span className="text-green-light italic">Leaderboard</span>
          </h1>
          <p className="text-gray-400">
            Compete with others, earn badges, and climb the rankings!
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Left - Competition Selector */}
          <div className="lg:col-span-1">
            <div className="bg-surface border border-border rounded-2xl p-6 sticky top-24">
              <h2 className="text-sm uppercase tracking-wider text-gray-500 mb-4">
                Active Competitions
              </h2>
              
              <div className="space-y-3">
                {activeCompetitions.map((comp) => (
                  <button
                    key={comp.id}
                    onClick={() => handleSelectCompetition(comp.id)}
                    className={`w-full text-left p-4 rounded-xl border transition ${
                      selectedCompetition === comp.id
                        ? 'bg-green/10 border-green shadow-lg shadow-green/10'
                        : 'bg-bg border-border hover:border-green/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{getCompetitionIcon(comp.id)}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm mb-1">{comp.title}</h3>
                        <p className="text-xs text-gray-400 leading-relaxed">
                          {comp.description}
                        </p>
                        {comp.prize && (
                          <div className="mt-2 text-xs text-amber">
                            🏆 {comp.prize}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Achievements Section */}
              {achievements && achievements.badges && achievements.badges.length > 0 && (
                <div className="mt-6 pt-6 border-t border-border">
                  <h2 className="text-sm uppercase tracking-wider text-gray-500 mb-4">
                    Your Badges ({achievements.total_badges})
                  </h2>
                  <div className="grid grid-cols-3 gap-3">
                    {achievements.badges.map((badge) => (
                      <div
                        key={badge.id}
                        className="flex flex-col items-center gap-2 p-3 bg-bg rounded-xl border border-border"
                        title={badge.description}
                      >
                        <div className="text-3xl">{badge.icon}</div>
                        <div className="text-xs text-center text-gray-400 leading-tight">
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
                <div className="p-6 border-b border-border bg-gradient-to-r from-green/10 to-bg">
                  <h2 className="text-2xl font-serif mb-1">
                    {leaderboard.competition.title}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {leaderboard.competition.description}
                  </p>
                </div>

                {/* Leaderboard Table */}
                <div className="divide-y divide-border">
                  {leaderboard.leaderboard.map((entry, idx) => (
                    <div
                      key={idx}
                      className={`p-4 flex items-center gap-4 hover:bg-bg transition ${
                        entry.is_you ? 'bg-green/5 border-l-4 border-green' : ''
                      }`}
                    >
                      {/* Rank */}
                      <div className="w-12 flex-shrink-0 text-center">
                        {entry.rank === 1 ? (
                          <Crown size={24} className="text-amber inline" />
                        ) : entry.rank === 2 ? (
                          <Medal size={24} className="text-gray-400 inline" />
                        ) : entry.rank === 3 ? (
                          <Medal size={24} className="text-amber/60 inline" />
                        ) : (
                          <span className="text-gray-500 font-semibold">#{entry.rank}</span>
                        )}
                      </div>

                      {/* User */}
                      <div className="flex-1">
                        <div className={`font-semibold ${entry.is_you ? 'text-green-light' : ''}`}>
                          {entry.user} {entry.is_you && '(You)'}
                        </div>
                        {entry.habit && (
                          <div className="text-xs text-gray-500 mt-0.5">{entry.habit}</div>
                        )}
                      </div>

                      {/* Score */}
                      <div className="text-right">
                        <div className="text-2xl font-serif text-green-light">
                          {entry.score}
                        </div>
                        <div className="text-xs text-gray-500 uppercase">
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
                {leaderboard.your_position && !leaderboard.your_position.is_you && (
                  <div className="p-4 bg-green/5 border-t-2 border-green">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-green-light">Your Position</div>
                        <div className="text-sm text-gray-400 mt-1">
                          {leaderboard.your_position.message}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-serif text-green-light">
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
                <div className="p-4 bg-bg/50 text-center text-sm text-gray-400">
                  💪 {leaderboard.motivation}
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

export default Leaderboard;
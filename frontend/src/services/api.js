import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Add token to every request if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if(token){
        console.log('Adding token to request:', config.url);
        config.headers.Authorization = `Bearer ${token}`;
    }else {
        console.warn('No token found for request:', config.url);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

//helper function

// Transform backend habit to frontend format
const transformHabitFromBackend = (habit) => {
  if (!habit) return habit;
  
  return {
    ...habit,
    // Map backend field names to frontend field names
    reminder_time: habit.target_time || habit.reminder_time || null,
    current_streak: habit.streak_count !== undefined ? habit.streak_count : (habit.current_streak || 0),
  };
};

// Transform frontend habit to backend format
const transformHabitToBackend = (habit) => {
  if (!habit) return habit;
  
  return {
    name: habit.name,
    icon: habit.icon || '🌱',
    color: habit.color || '#6db85c',
    target_time: habit.reminder_time || habit.target_time || null, // Map reminder_time → target_time
    frequency: habit.frequency || 'daily',
    description: habit.description || null,
  };
};

// Auth endpoints
export const auth = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Habit endpoints 
export const habits = {
  getAll: async () => {
    const response = await api.get('/habits/');
    return {
      ...response,
      data: Array.isArray(response.data) 
        ? response.data.map(transformHabitFromBackend)
        : response.data,
    };
  },

  getById: async (id) => {
    const response = await api.get(`/habits/${id}`);
    return {
      ...response,
      data: transformHabitFromBackend(response.data),
    };
  },

  create: async (data) => {
    const backendData = transformHabitToBackend(data);
    const response = await api.post('/habits/', backendData);
    return {
      ...response,
      data: transformHabitFromBackend(response.data),
    };
  },

  update: async (id, data) => {
    const backendData = transformHabitToBackend(data);
    const response = await api.put(`/habits/${id}`, backendData);
    return {
      ...response,
      data: transformHabitFromBackend(response.data),
    };
  },

  delete: (id) => api.delete(`/habits/${id}`),
};

// Logging endpoints
export const logs = {
  logHabit: (habitId, data = {}) => api.post(`/habits/${habitId}/log`, data),
  
  getHabitLogs: (habitId) => api.get(`/habits/${habitId}/logs`),
  
  getTodayStatus: async () => {
    const response = await api.get('/habits/today/status');
    return {
      ...response,
      data: {
        ...response.data,
        // Transform habits array if it exists
        habits: Array.isArray(response.data.habits)
          ? response.data.habits.map(transformHabitFromBackend)
          : [],
        // Cap percentage at 100%
        completion_percentage: Math.min(response.data.completion_percentage || 0, 100),
      },
    };
  },
};

// Analytics endpoints 
export const analytics = {
  getWeekly: async () => {
    const response = await api.get('/analytics/weekly');
    return {
      ...response,
      data: {
        ...response.data,
        // Cap all daily percentages at 100%
        days: Array.isArray(response.data.days)
          ? response.data.days.map(day => ({
              ...day,
              completion_percentage: Math.min(day.completion_percentage || 0, 100),
            }))
          : [],
        // Cap weekly average at 100%
        weekly_average: Math.min(response.data.weekly_average || 0, 100),
      },
    };
  },

  getMonthly: async () => {
    const response = await api.get('/analytics/monthly');
    return {
      ...response,
      data: {
        ...response.data,
        // Cap all weekly percentages at 100%
        weeks: Array.isArray(response.data.weeks)
          ? response.data.weeks.map(week => ({
              ...week,
              completion_percentage: Math.min(week.completion_percentage || 0, 100),
            }))
          : [],
      },
    };
  },

  getPerformance: () => api.get('/analytics/habits/performance'),

  getStreaks: async () => {
    const response = await api.get('/analytics/streaks');
    return {
      ...response,
      data: {
        ...response.data,
        // Transform streaks array
        streaks: Array.isArray(response.data.streaks)
          ? response.data.streaks.map(streak => ({
              ...streak,
              current_streak: streak.streak_count !== undefined 
                ? streak.streak_count 
                : (streak.current_streak || 0),
            }))
          : [],
        // Transform longest streak
        longest_current_streak: response.data.longest_current_streak
          ? {
              ...response.data.longest_current_streak,
              days: response.data.longest_current_streak.streak_count !== undefined
                ? response.data.longest_current_streak.streak_count
                : (response.data.longest_current_streak.days || 0),
            }
          : null,
      },
    };
  },
};

// Competition endpoints
export const competitions = {
  getActive: () => api.get('/competitions/active'),
  getLeaderboard: (competitionId) => api.get(`/competitions/leaderboard/${competitionId}`),
  getAchievements: () => api.get('/competitions/my-achievements'),
};

export default api;
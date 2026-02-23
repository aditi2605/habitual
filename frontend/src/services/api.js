import axios from 'axios';

const API_URL = "http://127.0.0.1:8000";

// create axious instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// ass token to every request if it exists
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if(token){
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
},
(error) => Promise.reject(error)
);

// Auth endpoints
export const auth = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Habit endpoints
export const habits = {
  getAll: () => api.get('/habits/'),
  getById: (id) => api.get(`/habits/${id}`),
  create: (data) => api.post('/habits/', data),
  update: (id, data) => api.put(`/habits/${id}`, data),
  delete: (id) => api.delete(`/habits/${id}`),
};

// Logging endpoints
export const logs = {
  logHabit: (habitId, data = {}) => api.post(`/habits/${habitId}/log`, data), 
  getHabitLogs: (habitId) => api.get(`/habits/${habitId}/logs`),
  getTodayStatus: () => api.get('/habits/today/status'),
};

// Analytics endpoints
export const analytics = {
  getWeekly: () => api.get('/analytics/weekly'),
  getMonthly: () => api.get('/analytics/monthly'),
  getPerformance: () => api.get('/analytics/habits/performance'),
  getStreaks: () => api.get('/analytics/streaks'),
};

// Competition endpoints
export const competitions = {
  getActive: () => api.get('/competitions/active'),
  getLeaderboard: (competitionId) => api.get(`/competitions/leaderboard/${competitionId}`),
  getAchievements: () => api.get('/competitions/my-achievements'),
};

export default api;
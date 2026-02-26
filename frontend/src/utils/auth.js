// Store token with optional remember me
export const setToken = (token, rememberMe = false) => {
  console.log('Saving token:', token ? 'Token exists' : 'No token');
  
  if (rememberMe) {
    // Store for 30 days
    localStorage.setItem('token', token);
    console.log('Token saved to localStorage');
  } else {
    // Store for session only
    sessionStorage.setItem('token', token);
    console.log('Token saved to sessionStorage');
  }
};

// Get token from either storage
export const getToken = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  console.log('🔍 Getting token:', token ? 'Found' : 'Not found');
  return token;
};

// Remove token from both storages
export const removeToken = () => {
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
  console.log('Token removed');
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = getToken();
  return !!token; 
};
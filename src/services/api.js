// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to handle API responses
async function handleResponse(response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || 'API request failed');
  }
  return response.json();
}

// Helper function to make API requests
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Include cookies for authentication
  };

  const response = await fetch(url, config);
  return handleResponse(response);
}

// API service with all endpoints
export const api = {
  // Auth endpoints
  auth: {
    login: (credentials) => apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
    
    register: (userData) => apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
    
    logout: () => apiRequest('/auth/logout', {
      method: 'POST',
    }),
    
    me: () => apiRequest('/auth/me'),
    
    updateProfile: (data) => apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  },

  // Accounts endpoints
  accounts: {
    list: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return apiRequest(`/accounts${query ? `?${query}` : ''}`);
    },
    
    get: (id) => apiRequest(`/accounts/${id}`),
    
    create: (data) => apiRequest('/accounts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
    update: (id, data) => apiRequest(`/accounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    
    delete: (id) => apiRequest(`/accounts/${id}`, {
      method: 'DELETE',
    }),
  },

  // Contacts endpoints
  contacts: {
    list: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return apiRequest(`/contacts${query ? `?${query}` : ''}`);
    },
    
    get: (id) => apiRequest(`/contacts/${id}`),
    
    create: (data) => apiRequest('/contacts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
    update: (id, data) => apiRequest(`/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    
    delete: (id) => apiRequest(`/contacts/${id}`, {
      method: 'DELETE',
    }),
  },

  // Invoices endpoints
  invoices: {
    list: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return apiRequest(`/invoices${query ? `?${query}` : ''}`);
    },
    
    get: (id) => apiRequest(`/invoices/${id}`),
    
    create: (data) => apiRequest('/invoices', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
    update: (id, data) => apiRequest(`/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    
    delete: (id) => apiRequest(`/invoices/${id}`, {
      method: 'DELETE',
    }),
  },

  // Bills endpoints
  bills: {
    list: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return apiRequest(`/bills${query ? `?${query}` : ''}`);
    },
    
    get: (id) => apiRequest(`/bills/${id}`),
    
    create: (data) => apiRequest('/bills', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
    update: (id, data) => apiRequest(`/bills/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    
    delete: (id) => apiRequest(`/bills/${id}`, {
      method: 'DELETE',
    }),
  },

  // Items endpoints
  items: {
    list: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return apiRequest(`/items${query ? `?${query}` : ''}`);
    },
    
    get: (id) => apiRequest(`/items/${id}`),
    
    create: (data) => apiRequest('/items', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
    update: (id, data) => apiRequest(`/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    
    delete: (id) => apiRequest(`/items/${id}`, {
      method: 'DELETE',
    }),
  },

  // Tax rates endpoints
  taxes: {
    list: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return apiRequest(`/taxes${query ? `?${query}` : ''}`);
    },
    
    create: (data) => apiRequest('/taxes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  },

  // Transactions endpoints
  transactions: {
    list: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return apiRequest(`/transactions${query ? `?${query}` : ''}`);
    },
    
    createJournalEntry: (data) => apiRequest('/transactions/journal-entries', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  },

  // Reports endpoints
  reports: {
    profitLoss: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return apiRequest(`/reports/profit-loss${query ? `?${query}` : ''}`);
    },
    
    balanceSheet: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return apiRequest(`/reports/balance-sheet${query ? `?${query}` : ''}`);
    },
  },
};

export default api;
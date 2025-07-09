// API service for backend communication
class ApiService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
    this.token = localStorage.getItem('auth_token');
  }

  // Helper method to get auth headers
  getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` })
    };
  }

  // Helper method to handle API responses
  async handleResponse(response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      
      // If unauthorized, don't attempt auto-login, just throw
      if (response.status === 401) {
        throw new Error('Unauthorized - please login');
      }
      
      throw new Error(error.error || 'API request failed');
    }
    return response.json();
  }

  // Generic API request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options
    };

    try {
      const response = await fetch(url, config);
      return await this.handleResponse(response);
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Auth methods
  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    
    if (response.token) {
      this.token = response.token;
      localStorage.setItem('auth_token', response.token);
    }
    
    return response;
  }

  async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    
    if (response.token) {
      this.token = response.token;
      localStorage.setItem('auth_token', response.token);
    }
    
    return response;
  }

  async getCurrentUser() {
    return await this.request('/auth/me');
  }

  logout() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // Generic CRUD methods
  async getAll(resource, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/${resource}${queryString ? `?${queryString}` : ''}`;
    return await this.request(endpoint);
  }

  async getById(resource, id) {
    return await this.request(`/${resource}/${id}`);
  }

  async create(resource, data) {
    return await this.request(`/${resource}`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async update(resource, id, data) {
    return await this.request(`/${resource}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async delete(resource, id) {
    return await this.request(`/${resource}/${id}`, {
      method: 'DELETE'
    });
  }

  // Specific resource methods
  async getAccounts(filters = {}) {
    return await this.getAll('accounts', filters);
  }

  async getContacts(filters = {}) {
    return await this.getAll('contacts', filters);
  }

  async getInvoices(filters = {}) {
    return await this.getAll('invoices', filters);
  }

  async getBills(filters = {}) {
    return await this.getAll('bills', filters);
  }

  async getTransactions(filters = {}) {
    return await this.getAll('transactions', filters);
  }

  async getItems(filters = {}) {
    return await this.getAll('items', filters);
  }

  async getTaxRates(filters = {}) {
    return await this.getAll('taxes', filters);
  }

  async getCheques(filters = {}) {
    return await this.getAll('cheques', filters);
  }

  async getChequeBooks() {
    return await this.getAll('cheques/books/list');
  }

  async updateChequeStatus(id, statusData) {
    return await this.request(`/cheques/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(statusData)
    });
  }

  async getChequeTransactions(id) {
    return await this.getAll(`cheques/${id}/transactions`);
  }

  // Quote methods
  async getQuotes(params = {}) {
    return await this.getAll('quotes', params);
  }
}

export default new ApiService();
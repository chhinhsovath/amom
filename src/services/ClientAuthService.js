import Cookies from 'js-cookie';
import api from './api';

const TOKEN_COOKIE_NAME = 'authToken';

// Client-side auth service that connects to the backend API
export class ClientAuthService {
  // Login user
  static async login(email, password) {
    try {
      const response = await api.auth.login({ email, password });
      const { user, token } = response;
      
      // Save user info to localStorage
      localStorage.setItem('user', JSON.stringify(user));
      
      return {
        user,
        token
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Register new user
  static async register(userData) {
    try {
      const response = await api.auth.register({
        email: userData.email,
        password: userData.password,
        name: `${userData.first_name} ${userData.last_name}`,
        organizationName: userData.organization_name
      });
      
      const { user, token } = response;
      
      // Save user info to localStorage
      localStorage.setItem('user', JSON.stringify(user));
      
      return {
        user,
        organization: { 
          id: user.organizationId, 
          name: userData.organization_name 
        }
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Logout user
  static async logout() {
    try {
      await api.auth.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    Cookies.remove(TOKEN_COOKIE_NAME);
    localStorage.removeItem('user');
  }

  // Get current user from localStorage
  static getCurrentUser() {
    try {
      const token = Cookies.get(TOKEN_COOKIE_NAME);
      if (!token) return null;

      const userStr = localStorage.getItem('user');
      if (!userStr) return null;

      const user = JSON.parse(userStr);
      return {
        userId: user.id,
        email: user.email,
        organizationId: user.organizationId,
        role: user.role
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  // Check if user is authenticated
  static isAuthenticated() {
    return this.getCurrentUser() !== null;
  }

  // Get user profile data
  static async getUserProfile(userId) {
    try {
      const user = await api.auth.me();
      return user;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  // Update user profile
  static async updateProfile(userId, profileData) {
    try {
      const updatedUser = await api.auth.updateProfile(profileData);
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return updatedUser;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  // Change password
  static async changePassword(userId, currentPassword, newPassword) {
    try {
      // This would need a new API endpoint for password change
      // For now, return true to maintain compatibility
      console.log('Password change not implemented yet');
      return true;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }
}

export default ClientAuthService;
import Cookies from 'js-cookie';

const TOKEN_COOKIE_NAME = 'auth_token';

// Simple client-side auth service (for demo purposes)
// In production, this should be handled by a proper backend API
export class ClientAuthService {
  // Simulate user database check
  static async validateCredentials(email, password) {
    // This is a demo implementation - in production use proper backend authentication
    const validUsers = [
      { 
        id: '550e8400-e29b-41d4-a716-446655440001',
        email: 'admin@demo.com', 
        password: 'demo123',
        first_name: 'Admin',
        last_name: 'User',
        organization_id: '550e8400-e29b-41d4-a716-446655440000',
        organization_name: 'Demo Company',
        role: 'admin'
      }
    ];

    const user = validUsers.find(u => u.email === email && u.password === password);
    return user;
  }

  // Login user
  static async login(email, password) {
    try {
      const user = await this.validateCredentials(email, password);
      
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Create a simple token (in production, use proper JWT from backend)
      const token = btoa(JSON.stringify({
        userId: user.id,
        email: user.email,
        organizationId: user.organization_id,
        role: user.role,
        exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      }));

      // Set cookie
      Cookies.set(TOKEN_COOKIE_NAME, token, { expires: 1 });

      // Return user data (without password)
      const { password: _, ...userWithoutPassword } = user;
      return {
        user: userWithoutPassword,
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
      // In a real app, this would create the user in the database
      // For now, we'll just simulate successful registration
      const newUser = {
        id: 'new-user-' + Date.now(),
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        organization_id: 'new-org-' + Date.now(),
        organization_name: userData.organization_name,
        role: 'admin'
      };

      // Auto-login after registration
      const token = btoa(JSON.stringify({
        userId: newUser.id,
        email: newUser.email,
        organizationId: newUser.organization_id,
        role: newUser.role,
        exp: Date.now() + (24 * 60 * 60 * 1000)
      }));

      Cookies.set(TOKEN_COOKIE_NAME, token, { expires: 1 });

      return {
        user: newUser,
        organization: { 
          id: newUser.organization_id, 
          name: newUser.organization_name 
        }
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Logout user
  static logout() {
    Cookies.remove(TOKEN_COOKIE_NAME);
  }

  // Get current user from token
  static getCurrentUser() {
    try {
      const token = Cookies.get(TOKEN_COOKIE_NAME);
      if (!token) return null;

      const decoded = JSON.parse(atob(token));
      
      // Check if token is expired
      if (decoded.exp && decoded.exp < Date.now()) {
        this.logout();
        return null;
      }

      return decoded;
    } catch (error) {
      console.error('Token verification error:', error);
      Cookies.remove(TOKEN_COOKIE_NAME);
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
      // Simulate fetching user profile
      const currentUser = this.getCurrentUser();
      if (!currentUser) return null;

      return {
        id: currentUser.userId,
        first_name: 'Admin',
        last_name: 'User',
        email: currentUser.email,
        role: currentUser.role,
        organization_id: currentUser.organizationId,
        organization_name: 'Demo Company',
        currency_code: 'USD'
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  // Update user profile
  static async updateProfile(userId, profileData) {
    try {
      // Simulate profile update
      console.log('Profile updated:', profileData);
      return profileData;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  // Change password
  static async changePassword(userId, currentPassword, newPassword) {
    try {
      // Simulate password change
      console.log('Password changed for user:', userId);
      return true;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }
}

export default ClientAuthService;
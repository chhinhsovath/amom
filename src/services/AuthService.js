// Note: This file is deprecated and replaced by ClientAuthService.js
// Keeping for reference but not used in browser code

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const TOKEN_COOKIE_NAME = 'auth_token';

export class AuthService {
  // Register a new user
  static async register(userData) {
    try {
      const { first_name, last_name, email, password, organization_name } = userData;
      
      // Check if user already exists
      const existingUser = await db.findOne('users', { email });
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      return await db.transaction(async (client) => {
        // Create organization first
        const organization = await client.query(
          `INSERT INTO organizations (name, legal_name, currency_code, timezone)
           VALUES ($1, $2, 'USD', 'America/New_York') RETURNING *`,
          [organization_name || `${first_name} ${last_name}'s Company`, organization_name || `${first_name} ${last_name}'s Company`]
        );

        // Hash password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Create user
        const user = await client.query(
          `INSERT INTO users (organization_id, first_name, last_name, email, password_hash, role)
           VALUES ($1, $2, $3, $4, $5, 'admin') RETURNING id, first_name, last_name, email, role, organization_id`,
          [organization.rows[0].id, first_name, last_name, email, passwordHash]
        );

        return {
          user: user.rows[0],
          organization: organization.rows[0]
        };
      });
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Login user
  static async login(email, password) {
    try {
      // Find user with organization data
      const result = await db.query(
        `SELECT u.*, o.name as organization_name 
         FROM users u 
         JOIN organizations o ON u.organization_id = o.id 
         WHERE u.email = $1 AND u.is_active = true`,
        [email]
      );

      const user = result.rows[0];
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Update last login
      await db.update('users', user.id, { last_login: new Date() });

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email, 
          organizationId: user.organization_id,
          role: user.role 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Set cookie
      Cookies.set(TOKEN_COOKIE_NAME, token, { expires: 1 }); // 1 day

      // Return user data (without password hash)
      const { password_hash, ...userWithoutPassword } = user;
      return {
        user: userWithoutPassword,
        token
      };
    } catch (error) {
      console.error('Login error:', error);
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

      const decoded = jwt.verify(token, JWT_SECRET);
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
      const result = await db.query(
        `SELECT u.id, u.first_name, u.last_name, u.email, u.role, u.last_login,
                o.id as organization_id, o.name as organization_name, o.currency_code
         FROM users u 
         JOIN organizations o ON u.organization_id = o.id 
         WHERE u.id = $1`,
        [userId]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  // Update user profile
  static async updateProfile(userId, profileData) {
    try {
      const { first_name, last_name, email } = profileData;
      
      const user = await db.update('users', userId, {
        first_name,
        last_name,
        email
      });

      return user;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  // Change password
  static async changePassword(userId, currentPassword, newPassword) {
    try {
      // Get current user
      const user = await db.findOne('users', { id: userId });
      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const saltRounds = 10;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await db.update('users', userId, { password_hash: newPasswordHash });

      return true;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }

  // Middleware to protect routes
  static requireAuth() {
    return (req, res, next) => {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
      } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
      }
    };
  }
}

export default AuthService;
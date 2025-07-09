const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { first_name, last_name, email, password, organization_name } = req.body;

    // Check if user already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Begin transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Create organization
      const orgResult = await client.query(
        `INSERT INTO organizations (name, legal_name, currency_code, timezone, created_at, updated_at)
         VALUES ($1, $2, 'USD', 'America/New_York', NOW(), NOW()) RETURNING *`,
        [organization_name || `${first_name} ${last_name}'s Company`, organization_name || `${first_name} ${last_name}'s Company`]
      );

      // Create user
      const userResult = await client.query(
        `INSERT INTO users (organization_id, first_name, last_name, email, password_hash, role, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, 'admin', true, NOW(), NOW()) RETURNING id, first_name, last_name, email, role, organization_id`,
        [orgResult.rows[0].id, first_name, last_name, email, passwordHash]
      );

      await client.query('COMMIT');

      const user = userResult.rows[0];
      const token = jwt.sign(
        { userId: user.id, email: user.email, organizationId: user.organization_id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.status(201).json({
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          role: user.role,
          organization_id: user.organization_id
        },
        token,
        organization: orgResult.rows[0]
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Get user with organization data
    const result = await pool.query(
      `SELECT u.*, o.name as organization_name 
       FROM users u 
       JOIN organizations o ON u.organization_id = o.id 
       WHERE u.email = $1 AND u.is_active = true`,
      [email]
    );

    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update last login
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, organizationId: user.organization_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = user;

    res.json({
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.role, u.last_login,
              o.id as organization_id, o.name as organization_name, o.currency_code
       FROM users u 
       JOIN organizations o ON u.organization_id = o.id 
       WHERE u.id = $1`,
      [req.user.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

module.exports = router;
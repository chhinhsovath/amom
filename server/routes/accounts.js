const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all accounts
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { orderBy = 'code', limit = 100, type, is_active } = req.query;
    
    let whereClause = 'WHERE a.organization_id = $1';
    const params = [req.user.organization_id];
    let paramIndex = 2;

    if (type) {
      whereClause += ` AND a.type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    if (is_active !== undefined) {
      whereClause += ` AND a.is_active = $${paramIndex}`;
      params.push(is_active === 'true');
      paramIndex++;
    }

    const query = `
      SELECT a.*, pa.name as parent_account_name
      FROM accounts a
      LEFT JOIN accounts pa ON a.parent_account_id = pa.id
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT $${paramIndex}
    `;
    
    params.push(limit);
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

// Get account by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM accounts WHERE id = $1 AND organization_id = $2',
      [req.params.id, req.user.organization_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching account:', error);
    res.status(500).json({ error: 'Failed to fetch account' });
  }
});

// Create new account
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { code, name, type, parent_account_id, description } = req.body;
    
    const result = await pool.query(
      `INSERT INTO accounts (organization_id, code, name, type, parent_account_id, description, balance, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, 0, true, NOW(), NOW()) RETURNING *`,
      [req.user.organization_id, code, name, type, parent_account_id, description]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating account:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// Update account
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { code, name, type, parent_account_id, description, is_active } = req.body;
    
    const result = await pool.query(
      `UPDATE accounts 
       SET code = $1, name = $2, type = $3, parent_account_id = $4, description = $5, is_active = $6, updated_at = NOW()
       WHERE id = $7 AND organization_id = $8 RETURNING *`,
      [code, name, type, parent_account_id, description, is_active, req.params.id, req.user.organization_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating account:', error);
    res.status(500).json({ error: 'Failed to update account' });
  }
});

// Delete account
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Check if account has transactions
    const hasTransactions = await pool.query(
      'SELECT COUNT(*) FROM journal_entry_lines WHERE account_id = $1',
      [req.params.id]
    );
    
    if (hasTransactions.rows[0].count > 0) {
      return res.status(400).json({ error: 'Cannot delete account with transactions' });
    }
    
    const result = await pool.query(
      'DELETE FROM accounts WHERE id = $1 AND organization_id = $2 RETURNING *',
      [req.params.id, req.user.organization_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }
    
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

module.exports = router;
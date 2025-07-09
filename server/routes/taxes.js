const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all tax rates
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { orderBy = 'name', limit = 100, is_active } = req.query;
    
    let whereClause = 'WHERE organization_id = $1';
    const params = [req.user.organization_id];
    let paramIndex = 2;

    if (is_active !== undefined) {
      whereClause += ` AND is_active = $${paramIndex}`;
      params.push(is_active === 'true');
      paramIndex++;
    }

    const query = `
      SELECT * FROM tax_rates
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT $${paramIndex}
    `;
    
    params.push(limit);
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tax rates:', error);
    res.status(500).json({ error: 'Failed to fetch tax rates' });
  }
});

// Create new tax rate
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, rate, type } = req.body;
    
    const result = await pool.query(
      `INSERT INTO tax_rates (organization_id, name, rate, type, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, true, NOW(), NOW()) RETURNING *`,
      [req.user.organization_id, name, rate, type]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating tax rate:', error);
    res.status(500).json({ error: 'Failed to create tax rate' });
  }
});

module.exports = router;
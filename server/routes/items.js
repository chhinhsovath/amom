const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all items
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { orderBy = 'item_code', limit = 100, is_active } = req.query;
    
    let whereClause = 'WHERE organization_id = $1';
    const params = [req.user.organization_id];
    let paramIndex = 2;

    if (is_active !== undefined) {
      whereClause += ` AND is_active = $${paramIndex}`;
      params.push(is_active === 'true');
      paramIndex++;
    }

    const query = `
      SELECT * FROM items
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT $${paramIndex}
    `;
    
    params.push(limit);
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// Create new item
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { 
      item_code, name, description, type, unit_price, purchase_price, quantity_on_hand,
      revenue_account_id, expense_account_id
    } = req.body;
    
    const result = await pool.query(
      `INSERT INTO items (
        organization_id, item_code, name, description, type, unit_price, purchase_price, 
        quantity_on_hand, revenue_account_id, expense_account_id, is_active, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true, NOW(), NOW()) RETURNING *`,
      [
        req.user.organization_id, item_code, name, description, type, unit_price, purchase_price,
        quantity_on_hand, revenue_account_id, expense_account_id
      ]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

module.exports = router;
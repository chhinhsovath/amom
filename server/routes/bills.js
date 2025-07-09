const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all bills
router.get('/', authenticateToken, async (req, res) => {
  try {
    let { orderBy = 'created_at', limit = 100, status } = req.query;
    
    // Handle frontend sending different column names
    if (orderBy === '-created_date' || orderBy === 'created_date') {
      orderBy = orderBy.replace('created_date', 'created_at');
    }
    
    let whereClause = 'WHERE organization_id = $1';
    const params = [req.user.organization_id];
    let paramIndex = 2;

    if (status) {
      whereClause += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    const query = `
      SELECT * FROM bills
      ${whereClause}
      ORDER BY ${orderBy} DESC
      LIMIT $${paramIndex}
    `;
    
    params.push(limit);
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching bills:', error);
    res.status(500).json({ error: 'Failed to fetch bills' });
  }
});

// Create new bill
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { 
      bill_number, contact_id, contact_name, issue_date, due_date, status,
      subtotal, tax_amount, total, notes, line_items
    } = req.body;
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Create bill
      const billResult = await client.query(
        `INSERT INTO bills (
          organization_id, bill_number, contact_id, contact_name, issue_date, due_date, 
          status, subtotal, tax_amount, total, notes, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW()) RETURNING *`,
        [
          req.user.organization_id, bill_number, contact_id, contact_name, issue_date, due_date,
          status, subtotal, tax_amount, total, notes
        ]
      );
      
      const bill = billResult.rows[0];
      
      // Create line items
      if (line_items && line_items.length > 0) {
        for (const item of line_items) {
          await client.query(
            `INSERT INTO bill_line_items (
              bill_id, account_id, description, quantity, unit_price, line_total, tax_rate_id, tax_amount
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
              bill.id, item.account_id, item.description, item.quantity, item.unit_price,
              item.line_total, item.tax_rate_id, item.tax_amount
            ]
          );
        }
      }
      
      await client.query('COMMIT');
      res.status(201).json(bill);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating bill:', error);
    res.status(500).json({ error: 'Failed to create bill' });
  }
});

module.exports = router;
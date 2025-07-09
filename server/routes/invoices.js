const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all invoices
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
      SELECT * FROM invoices
      ${whereClause}
      ORDER BY ${orderBy} DESC
      LIMIT $${paramIndex}
    `;
    
    params.push(limit);
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// Get invoice by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM invoices WHERE id = $1 AND organization_id = $2',
      [req.params.id, req.user.organization_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
});

// Create new invoice
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { 
      invoice_number, contact_id, contact_name, issue_date, due_date, status,
      subtotal, tax_amount, total, notes, terms, line_items
    } = req.body;
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Create invoice
      const invoiceResult = await client.query(
        `INSERT INTO invoices (
          organization_id, invoice_number, contact_id, contact_name, issue_date, due_date, 
          status, subtotal, tax_amount, total, notes, terms, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW()) RETURNING *`,
        [
          req.user.organization_id, invoice_number, contact_id, contact_name, issue_date, due_date,
          status, subtotal, tax_amount, total, notes, terms
        ]
      );
      
      const invoice = invoiceResult.rows[0];
      
      // Create line items
      if (line_items && line_items.length > 0) {
        for (const item of line_items) {
          await client.query(
            `INSERT INTO invoice_line_items (
              invoice_id, account_id, description, quantity, unit_price, line_total, tax_rate_id, tax_amount
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
              invoice.id, item.account_id, item.description, item.quantity, item.unit_price,
              item.line_total, item.tax_rate_id, item.tax_amount
            ]
          );
        }
      }
      
      await client.query('COMMIT');
      res.status(201).json(invoice);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

// Update invoice
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { 
      invoice_number, contact_id, contact_name, issue_date, due_date, status,
      subtotal, tax_amount, total, notes, terms
    } = req.body;
    
    const result = await pool.query(
      `UPDATE invoices 
       SET invoice_number = $1, contact_id = $2, contact_name = $3, issue_date = $4, due_date = $5,
           status = $6, subtotal = $7, tax_amount = $8, total = $9, notes = $10, terms = $11, updated_at = NOW()
       WHERE id = $12 AND organization_id = $13 RETURNING *`,
      [
        invoice_number, contact_id, contact_name, issue_date, due_date, status,
        subtotal, tax_amount, total, notes, terms, req.params.id, req.user.organization_id
      ]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(500).json({ error: 'Failed to update invoice' });
  }
});

// Delete invoice
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM invoices WHERE id = $1 AND organization_id = $2 RETURNING *',
      [req.params.id, req.user.organization_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({ error: 'Failed to delete invoice' });
  }
});

module.exports = router;
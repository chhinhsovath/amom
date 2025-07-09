const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all contacts
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { orderBy = 'name', limit = 100, type, is_active } = req.query;
    
    let whereClause = 'WHERE organization_id = $1';
    const params = [req.user.organization_id];
    let paramIndex = 2;

    if (type) {
      whereClause += ` AND type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    if (is_active !== undefined) {
      whereClause += ` AND is_active = $${paramIndex}`;
      params.push(is_active === 'true');
      paramIndex++;
    }

    const query = `
      SELECT * FROM contacts
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT $${paramIndex}
    `;
    
    params.push(limit);
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// Get contact by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM contacts WHERE id = $1 AND organization_id = $2',
      [req.params.id, req.user.organization_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({ error: 'Failed to fetch contact' });
  }
});

// Create new contact
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { 
      name, type, email, phone, address, city, state, postal_code, country, 
      tax_number, credit_limit, payment_terms, notes 
    } = req.body;
    
    const result = await pool.query(
      `INSERT INTO contacts (
        organization_id, name, type, email, phone, address, city, state, postal_code, country,
        tax_number, credit_limit, payment_terms, notes, is_active, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, true, NOW(), NOW()) RETURNING *`,
      [
        req.user.organization_id, name, type, email, phone, address, city, state, postal_code, country,
        tax_number, credit_limit, payment_terms, notes
      ]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({ error: 'Failed to create contact' });
  }
});

// Update contact
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { 
      name, type, email, phone, address, city, state, postal_code, country, 
      tax_number, credit_limit, payment_terms, notes, is_active 
    } = req.body;
    
    const result = await pool.query(
      `UPDATE contacts 
       SET name = $1, type = $2, email = $3, phone = $4, address = $5, city = $6, state = $7, 
           postal_code = $8, country = $9, tax_number = $10, credit_limit = $11, payment_terms = $12, 
           notes = $13, is_active = $14, updated_at = NOW()
       WHERE id = $15 AND organization_id = $16 RETURNING *`,
      [
        name, type, email, phone, address, city, state, postal_code, country,
        tax_number, credit_limit, payment_terms, notes, is_active, req.params.id, req.user.organization_id
      ]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({ error: 'Failed to update contact' });
  }
});

// Delete contact
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM contacts WHERE id = $1 AND organization_id = $2 RETURNING *',
      [req.params.id, req.user.organization_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ error: 'Failed to delete contact' });
  }
});

module.exports = router;
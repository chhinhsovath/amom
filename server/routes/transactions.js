const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all transactions/journal entries
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { orderBy = 'date', limit = 100, type } = req.query;
    
    let whereClause = 'WHERE je.organization_id = $1';
    const params = [req.user.organization_id];
    
    const query = `
      SELECT je.*, 
             json_agg(
               json_build_object(
                 'id', jel.id,
                 'account_id', jel.account_id,
                 'debit_amount', jel.debit_amount,
                 'credit_amount', jel.credit_amount,
                 'description', jel.description,
                 'reference', jel.reference,
                 'contact_id', jel.contact_id
               )
             ) as lines
      FROM journal_entries je
      LEFT JOIN journal_entry_lines jel ON je.id = jel.journal_entry_id
      ${whereClause}
      GROUP BY je.id
      ORDER BY je.${orderBy} DESC
      LIMIT $2
    `;
    
    params.push(limit);
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Create new journal entry
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { entry_number, date, description, reference, lines } = req.body;
    
    // Validate that debits equal credits
    const totalDebits = lines.reduce((sum, line) => sum + (line.debit_amount || 0), 0);
    const totalCredits = lines.reduce((sum, line) => sum + (line.credit_amount || 0), 0);
    
    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      return res.status(400).json({ error: 'Debits must equal credits' });
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Create journal entry
      const entryResult = await client.query(
        `INSERT INTO journal_entries (
          organization_id, entry_number, date, description, reference, total_amount, 
          status, created_by, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, 'posted', $7, NOW(), NOW()) RETURNING *`,
        [req.user.organization_id, entry_number, date, description, reference, totalDebits, req.user.id]
      );
      
      const entry = entryResult.rows[0];
      
      // Create journal entry lines
      for (const line of lines) {
        await client.query(
          `INSERT INTO journal_entry_lines (
            journal_entry_id, account_id, debit_amount, credit_amount, description, reference, contact_id
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            entry.id, line.account_id, line.debit_amount || 0, line.credit_amount || 0,
            line.description, line.reference, line.contact_id
          ]
        );
      }
      
      await client.query('COMMIT');
      res.status(201).json(entry);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating journal entry:', error);
    res.status(500).json({ error: 'Failed to create journal entry' });
  }
});

module.exports = router;
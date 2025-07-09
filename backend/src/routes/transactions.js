import express from 'express';
import db from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all transactions
router.get('/', async (req, res) => {
  try {
    const { 
      orderBy = 'date DESC', 
      limit = 100,
      account_id,
      start_date,
      end_date
    } = req.query;
    
    let query = `
      SELECT je.*, jel.* 
      FROM journal_entries je
      JOIN journal_entry_lines jel ON je.id = jel.journal_entry_id
      WHERE je.organization_id = $1
    `;
    const params = [req.user.organizationId];
    let paramIndex = 2;

    if (account_id) {
      query += ` AND jel.account_id = $${paramIndex}`;
      params.push(account_id);
      paramIndex++;
    }

    if (start_date) {
      query += ` AND je.date >= $${paramIndex}`;
      params.push(start_date);
      paramIndex++;
    }

    if (end_date) {
      query += ` AND je.date <= $${paramIndex}`;
      params.push(end_date);
      paramIndex++;
    }

    query += ` ORDER BY ${orderBy} LIMIT ${limit}`;

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create journal entry
router.post('/journal-entries', async (req, res) => {
  try {
    const { date, description, lines } = req.body;

    // Validate that debits equal credits
    const totalDebits = lines.reduce((sum, line) => sum + (line.debit_amount || 0), 0);
    const totalCredits = lines.reduce((sum, line) => sum + (line.credit_amount || 0), 0);

    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      return res.status(400).json({ error: 'Debits must equal credits' });
    }

    const result = await db.transaction(async (client) => {
      // Create journal entry
      const entryResult = await client.query(
        `INSERT INTO journal_entries (organization_id, date, description, created_by)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [req.user.organizationId, date, description, req.user.id]
      );

      const entry = entryResult.rows[0];

      // Create journal entry lines
      for (const line of lines) {
        await client.query(
          `INSERT INTO journal_entry_lines 
           (journal_entry_id, account_id, description, debit_amount, credit_amount)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            entry.id,
            line.account_id,
            line.description || '',
            line.debit_amount || 0,
            line.credit_amount || 0
          ]
        );

        // Update account balance
        const balanceChange = (line.debit_amount || 0) - (line.credit_amount || 0);
        await client.query(
          'UPDATE accounts SET balance = balance + $1 WHERE id = $2',
          [balanceChange, line.account_id]
        );
      }

      return entry;
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Create journal entry error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
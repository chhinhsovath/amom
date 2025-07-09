const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all cheques
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { orderBy = 'issue_date', limit = 100, status, cheque_book_id } = req.query;
    
    let whereClause = 'WHERE c.organization_id = $1';
    const params = [req.user.organization_id];
    let paramIndex = 2;

    if (status) {
      whereClause += ` AND c.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (cheque_book_id) {
      whereClause += ` AND c.cheque_book_id = $${paramIndex}`;
      params.push(cheque_book_id);
      paramIndex++;
    }

    const query = `
      SELECT 
        c.*,
        cb.book_number,
        cb.bank_name,
        cb.account_number,
        cont.name as payee_contact_name,
        acc.name as expense_account_name,
        u.first_name || ' ' || u.last_name as created_by_name
      FROM cheques c
      LEFT JOIN cheque_books cb ON c.cheque_book_id = cb.id
      LEFT JOIN contacts cont ON c.payee_contact_id = cont.id
      LEFT JOIN accounts acc ON c.expense_account_id = acc.id
      LEFT JOIN users u ON c.created_by = u.id
      ${whereClause}
      ORDER BY c.${orderBy} DESC
      LIMIT $${paramIndex}
    `;
    
    params.push(limit);
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching cheques:', error);
    res.status(500).json({ error: 'Failed to fetch cheques' });
  }
});

// Get single cheque
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        c.*,
        cb.book_number,
        cb.bank_name,
        cb.branch_name,
        cb.routing_number,
        cb.account_number,
        cont.name as payee_contact_name,
        cont.email as payee_email,
        cont.phone as payee_phone,
        acc.name as expense_account_name,
        u.first_name || ' ' || u.last_name as created_by_name
      FROM cheques c
      LEFT JOIN cheque_books cb ON c.cheque_book_id = cb.id
      LEFT JOIN contacts cont ON c.payee_contact_id = cont.id
      LEFT JOIN accounts acc ON c.expense_account_id = acc.id
      LEFT JOIN users u ON c.created_by = u.id
      WHERE c.id = $1 AND c.organization_id = $2
    `;
    
    const result = await pool.query(query, [id, req.user.organization_id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cheque not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching cheque:', error);
    res.status(500).json({ error: 'Failed to fetch cheque' });
  }
});

// Create new cheque
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { 
      cheque_book_id, payee_name, payee_contact_id, amount, memo, 
      reference_type, reference_number, expense_account_id 
    } = req.body;
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Get next cheque number from cheque book
      const bookResult = await client.query(
        'SELECT current_cheque_number, ending_cheque_number, bank_name, branch_name, routing_number, account_number FROM cheque_books WHERE id = $1 AND organization_id = $2',
        [cheque_book_id, req.user.organization_id]
      );
      
      if (bookResult.rows.length === 0) {
        throw new Error('Cheque book not found');
      }
      
      const book = bookResult.rows[0];
      const chequeNumber = book.current_cheque_number;
      
      if (chequeNumber > book.ending_cheque_number) {
        throw new Error('No more cheques available in this book');
      }
      
      // Convert amount to words (simple implementation)
      const amountInWords = convertAmountToWords(amount);
      
      // Create cheque
      const chequeResult = await client.query(
        `INSERT INTO cheques (
          organization_id, cheque_book_id, cheque_number, payee_name, payee_contact_id,
          amount, amount_in_words, issue_date, memo, status, reference_type, reference_number,
          expense_account_id, bank_name, branch_name, routing_number, account_number, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_DATE, $8, 'issued', $9, $10, $11, $12, $13, $14, $15, $16) 
        RETURNING *`,
        [
          req.user.organization_id, cheque_book_id, chequeNumber, payee_name, payee_contact_id,
          amount, amountInWords, memo, reference_type, reference_number, expense_account_id,
          book.bank_name, book.branch_name, book.routing_number, book.account_number, req.user.id
        ]
      );
      
      const cheque = chequeResult.rows[0];
      
      // Update cheque book current number
      await client.query(
        'UPDATE cheque_books SET current_cheque_number = current_cheque_number + 1 WHERE id = $1',
        [cheque_book_id]
      );
      
      // Create transaction record
      await client.query(
        `INSERT INTO cheque_transactions (cheque_id, transaction_type, transaction_date, amount, notes, processed_by)
         VALUES ($1, 'issued', CURRENT_DATE, $2, $3, $4)`,
        [cheque.id, amount, `Cheque issued to ${payee_name}`, req.user.id]
      );
      
      await client.query('COMMIT');
      res.status(201).json(cheque);
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Error creating cheque:', error);
    res.status(500).json({ error: error.message || 'Failed to create cheque' });
  }
});

// Update cheque status
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, cleared_date, bank_reference } = req.body;
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Update cheque status
      const updateFields = ['status = $1', 'updated_at = CURRENT_TIMESTAMP'];
      const params = [status, id, req.user.organization_id];
      let paramIndex = 2;
      
      if (cleared_date && status === 'cleared') {
        updateFields.push(`cleared_date = $${paramIndex + 2}`);
        params.splice(paramIndex, 0, cleared_date);
        paramIndex++;
      }
      
      const updateQuery = `
        UPDATE cheques 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex + 1} AND organization_id = $${paramIndex + 2}
        RETURNING *
      `;
      
      const result = await client.query(updateQuery, params);
      
      if (result.rows.length === 0) {
        throw new Error('Cheque not found');
      }
      
      const cheque = result.rows[0];
      
      // Create transaction record
      await client.query(
        `INSERT INTO cheque_transactions (cheque_id, transaction_type, transaction_date, amount, bank_reference, notes, processed_by)
         VALUES ($1, $2, CURRENT_DATE, $3, $4, $5, $6)`,
        [id, status, cheque.amount, bank_reference, notes, req.user.id]
      );
      
      await client.query('COMMIT');
      res.json(cheque);
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Error updating cheque status:', error);
    res.status(500).json({ error: error.message || 'Failed to update cheque status' });
  }
});

// Get cheque books
router.get('/books/list', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT 
        cb.*,
        a.name as account_name,
        (cb.ending_cheque_number - cb.current_cheque_number + 1) as remaining_cheques
      FROM cheque_books cb
      LEFT JOIN accounts a ON cb.bank_account_id = a.id
      WHERE cb.organization_id = $1 AND cb.is_active = true
      ORDER BY cb.created_at DESC
    `;
    
    const result = await pool.query(query, [req.user.organization_id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching cheque books:', error);
    res.status(500).json({ error: 'Failed to fetch cheque books' });
  }
});

// Create new cheque book
router.post('/books', authenticateToken, async (req, res) => {
  try {
    const { 
      bank_account_id, book_number, starting_cheque_number, ending_cheque_number,
      bank_name, branch_name, routing_number, account_number 
    } = req.body;
    
    const result = await pool.query(
      `INSERT INTO cheque_books (
        organization_id, bank_account_id, book_number, starting_cheque_number, 
        ending_cheque_number, current_cheque_number, issue_date, bank_name, 
        branch_name, routing_number, account_number
      ) VALUES ($1, $2, $3, $4, $5, $4, CURRENT_DATE, $6, $7, $8, $9) 
      RETURNING *`,
      [
        req.user.organization_id, bank_account_id, book_number, starting_cheque_number,
        ending_cheque_number, bank_name, branch_name, routing_number, account_number
      ]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating cheque book:', error);
    res.status(500).json({ error: 'Failed to create cheque book' });
  }
});

// Get cheque transactions (history)
router.get('/:id/transactions', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        ct.*,
        u.first_name || ' ' || u.last_name as processed_by_name
      FROM cheque_transactions ct
      LEFT JOIN users u ON ct.processed_by = u.id
      WHERE ct.cheque_id = $1
      ORDER BY ct.transaction_date DESC, ct.created_at DESC
    `;
    
    const result = await pool.query(query, [id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching cheque transactions:', error);
    res.status(500).json({ error: 'Failed to fetch cheque transactions' });
  }
});

// Utility function to convert amount to words
function convertAmountToWords(amount) {
  const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
  const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  
  function convertHundreds(num) {
    let result = '';
    
    if (num >= 100) {
      result += ones[Math.floor(num / 100)] + ' hundred ';
      num %= 100;
    }
    
    if (num >= 20) {
      result += tens[Math.floor(num / 10)] + ' ';
      num %= 10;
    } else if (num >= 10) {
      result += teens[num - 10] + ' ';
      num = 0;
    }
    
    if (num > 0) {
      result += ones[num] + ' ';
    }
    
    return result.trim();
  }
  
  const dollars = Math.floor(amount);
  const cents = Math.round((amount - dollars) * 100);
  
  let result = '';
  
  if (dollars === 0) {
    result = 'zero';
  } else if (dollars < 1000) {
    result = convertHundreds(dollars);
  } else if (dollars < 1000000) {
    const thousands = Math.floor(dollars / 1000);
    result = convertHundreds(thousands) + ' thousand ' + convertHundreds(dollars % 1000);
  } else {
    const millions = Math.floor(dollars / 1000000);
    result = convertHundreds(millions) + ' million ' + convertHundreds(Math.floor((dollars % 1000000) / 1000)) + ' thousand ' + convertHundreds(dollars % 1000);
  }
  
  result = result.trim();
  result = result.charAt(0).toUpperCase() + result.slice(1);
  
  return `${result} dollars and ${cents.toString().padStart(2, '0')}/100`;
}

module.exports = router;
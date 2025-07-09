import express from 'express';
import db from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get profit and loss report
router.get('/profit-loss', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    const query = `
      SELECT 
        a.account_type,
        a.name,
        a.code,
        SUM(jel.credit_amount - jel.debit_amount) as balance
      FROM accounts a
      LEFT JOIN journal_entry_lines jel ON a.id = jel.account_id
      LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id
      WHERE a.organization_id = $1
        AND a.account_type IN ('Revenue', 'Expense')
        AND je.date >= $2
        AND je.date <= $3
      GROUP BY a.id, a.account_type, a.name, a.code
      ORDER BY a.account_type, a.code
    `;

    const result = await db.query(query, [
      req.user.organizationId,
      start_date || '2000-01-01',
      end_date || '2099-12-31'
    ]);

    const report = {
      revenue: result.rows.filter(row => row.account_type === 'Revenue'),
      expenses: result.rows.filter(row => row.account_type === 'Expense'),
      total_revenue: result.rows
        .filter(row => row.account_type === 'Revenue')
        .reduce((sum, row) => sum + parseFloat(row.balance || 0), 0),
      total_expenses: result.rows
        .filter(row => row.account_type === 'Expense')
        .reduce((sum, row) => sum + Math.abs(parseFloat(row.balance || 0)), 0),
    };

    report.net_profit = report.total_revenue - report.total_expenses;

    res.json(report);
  } catch (error) {
    console.error('Get profit/loss report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get balance sheet report
router.get('/balance-sheet', async (req, res) => {
  try {
    const { as_of_date } = req.query;

    const query = `
      SELECT 
        a.account_type,
        a.name,
        a.code,
        a.balance
      FROM accounts a
      WHERE a.organization_id = $1
        AND a.account_type IN ('Asset', 'Liability', 'Equity')
      ORDER BY a.account_type, a.code
    `;

    const result = await db.query(query, [req.user.organizationId]);

    const report = {
      assets: result.rows.filter(row => row.account_type === 'Asset'),
      liabilities: result.rows.filter(row => row.account_type === 'Liability'),
      equity: result.rows.filter(row => row.account_type === 'Equity'),
      total_assets: result.rows
        .filter(row => row.account_type === 'Asset')
        .reduce((sum, row) => sum + parseFloat(row.balance || 0), 0),
      total_liabilities: result.rows
        .filter(row => row.account_type === 'Liability')
        .reduce((sum, row) => sum + parseFloat(row.balance || 0), 0),
      total_equity: result.rows
        .filter(row => row.account_type === 'Equity')
        .reduce((sum, row) => sum + parseFloat(row.balance || 0), 0),
    };

    res.json(report);
  } catch (error) {
    console.error('Get balance sheet report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
import express from 'express';
import { body, validationResult } from 'express-validator';
import db from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all accounts
router.get('/', async (req, res) => {
  try {
    const { orderBy = 'code', limit = 100, active = true } = req.query;
    
    const conditions = { organization_id: req.user.organizationId };
    if (active !== undefined) {
      conditions.is_active = active === 'true';
    }

    const accounts = await db.findMany('accounts', conditions, {
      orderBy,
      limit: parseInt(limit)
    });

    res.json(accounts);
  } catch (error) {
    console.error('Get accounts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get account by ID
router.get('/:id', async (req, res) => {
  try {
    const account = await db.findOne('accounts', {
      id: req.params.id,
      organization_id: req.user.organizationId
    });

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.json(account);
  } catch (error) {
    console.error('Get account error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create account
router.post('/', [
  body('code').notEmpty().trim(),
  body('name').notEmpty().trim(),
  body('account_type').isIn(['Asset', 'Liability', 'Equity', 'Revenue', 'Expense']),
  body('currency').optional().isLength({ min: 3, max: 3 }),
  body('parent_account_id').optional().isUUID()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const accountData = {
      ...req.body,
      organization_id: req.user.organizationId,
      balance: 0,
      is_active: true
    };

    const newAccount = await db.insert('accounts', accountData);
    res.status(201).json(newAccount);
  } catch (error) {
    console.error('Create account error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update account
router.put('/:id', [
  body('name').optional().notEmpty().trim(),
  body('description').optional(),
  body('is_active').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Verify account belongs to organization
    const existingAccount = await db.findOne('accounts', {
      id: req.params.id,
      organization_id: req.user.organizationId
    });

    if (!existingAccount) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const updatedAccount = await db.update('accounts', req.params.id, req.body);
    res.json(updatedAccount);
  } catch (error) {
    console.error('Update account error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete account
router.delete('/:id', async (req, res) => {
  try {
    // Verify account belongs to organization
    const account = await db.findOne('accounts', {
      id: req.params.id,
      organization_id: req.user.organizationId
    });

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Check if account has transactions
    const transactions = await db.findOne('journal_entry_lines', {
      account_id: req.params.id
    });

    if (transactions) {
      return res.status(400).json({ error: 'Cannot delete account with transactions' });
    }

    await db.delete('accounts', req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
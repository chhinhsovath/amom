import express from 'express';
import { body, validationResult } from 'express-validator';
import db from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all tax rates
router.get('/', async (req, res) => {
  try {
    const { orderBy = 'name', limit = 100, active = true } = req.query;
    
    const conditions = { organization_id: req.user.organizationId };
    if (active !== undefined) {
      conditions.is_active = active === 'true';
    }

    const taxRates = await db.findMany('tax_rates', conditions, {
      orderBy,
      limit: parseInt(limit)
    });

    res.json(taxRates);
  } catch (error) {
    console.error('Get tax rates error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create tax rate
router.post('/', [
  body('name').notEmpty().trim(),
  body('rate').isFloat({ min: 0, max: 100 }),
  body('tax_type').optional().isIn(['Sales', 'Purchase', 'Both'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const taxData = {
      ...req.body,
      organization_id: req.user.organizationId,
      is_active: true
    };

    const newTaxRate = await db.insert('tax_rates', taxData);
    res.status(201).json(newTaxRate);
  } catch (error) {
    console.error('Create tax rate error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
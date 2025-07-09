import express from 'express';
import { body, validationResult } from 'express-validator';
import db from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all bills
router.get('/', async (req, res) => {
  try {
    const { 
      orderBy = 'created_at DESC', 
      limit = 100,
      status,
      contact_id
    } = req.query;
    
    const conditions = { organization_id: req.user.organizationId };
    
    if (status) {
      conditions.status = status;
    }
    
    if (contact_id) {
      conditions.contact_id = contact_id;
    }

    const bills = await db.findMany('bills', conditions, {
      orderBy,
      limit: parseInt(limit)
    });

    res.json(bills);
  } catch (error) {
    console.error('Get bills error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get bill by ID
router.get('/:id', async (req, res) => {
  try {
    const bill = await db.findOne('bills', {
      id: req.params.id,
      organization_id: req.user.organizationId
    });

    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    res.json(bill);
  } catch (error) {
    console.error('Get bill error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create bill
router.post('/', [
  body('contact_id').isUUID(),
  body('bill_date').isISO8601(),
  body('due_date').isISO8601(),
  body('total').isFloat({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const billData = {
      ...req.body,
      organization_id: req.user.organizationId,
      status: 'Draft',
      created_by: req.user.id
    };

    const newBill = await db.insert('bills', billData);
    res.status(201).json(newBill);
  } catch (error) {
    console.error('Create bill error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update bill
router.put('/:id', async (req, res) => {
  try {
    const existingBill = await db.findOne('bills', {
      id: req.params.id,
      organization_id: req.user.organizationId
    });

    if (!existingBill) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    const updatedBill = await db.update('bills', req.params.id, req.body);
    res.json(updatedBill);
  } catch (error) {
    console.error('Update bill error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete bill
router.delete('/:id', async (req, res) => {
  try {
    const bill = await db.findOne('bills', {
      id: req.params.id,
      organization_id: req.user.organizationId
    });

    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    await db.delete('bills', req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Delete bill error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
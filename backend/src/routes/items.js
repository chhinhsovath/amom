import express from 'express';
import { body, validationResult } from 'express-validator';
import db from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all items
router.get('/', async (req, res) => {
  try {
    const { orderBy = 'item_code', limit = 100, active = true } = req.query;
    
    const conditions = { organization_id: req.user.organizationId };
    if (active !== undefined) {
      conditions.is_active = active === 'true';
    }

    const items = await db.findMany('items', conditions, {
      orderBy,
      limit: parseInt(limit)
    });

    res.json(items);
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get item by ID
router.get('/:id', async (req, res) => {
  try {
    const item = await db.findOne('items', {
      id: req.params.id,
      organization_id: req.user.organizationId
    });

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json(item);
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create item
router.post('/', [
  body('item_code').notEmpty().trim(),
  body('name').notEmpty().trim(),
  body('item_type').isIn(['Product', 'Service']),
  body('unit_price').optional().isFloat({ min: 0 }),
  body('purchase_price').optional().isFloat({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const itemData = {
      ...req.body,
      organization_id: req.user.organizationId,
      is_active: true
    };

    const newItem = await db.insert('items', itemData);
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update item
router.put('/:id', async (req, res) => {
  try {
    const existingItem = await db.findOne('items', {
      id: req.params.id,
      organization_id: req.user.organizationId
    });

    if (!existingItem) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const updatedItem = await db.update('items', req.params.id, req.body);
    res.json(updatedItem);
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete item
router.delete('/:id', async (req, res) => {
  try {
    const item = await db.findOne('items', {
      id: req.params.id,
      organization_id: req.user.organizationId
    });

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    await db.delete('items', req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
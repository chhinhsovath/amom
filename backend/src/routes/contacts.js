import express from 'express';
import { body, validationResult, query } from 'express-validator';
import db from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all contacts
router.get('/', async (req, res) => {
  try {
    const { 
      orderBy = 'name', 
      limit = 100, 
      type,
      active = true 
    } = req.query;
    
    const conditions = { organization_id: req.user.organizationId };
    
    if (type) {
      conditions.contact_type = type;
    }
    
    if (active !== undefined) {
      conditions.is_active = active === 'true';
    }

    const contacts = await db.findMany('contacts', conditions, {
      orderBy,
      limit: parseInt(limit)
    });

    res.json(contacts);
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get contact by ID
router.get('/:id', async (req, res) => {
  try {
    const contact = await db.findOne('contacts', {
      id: req.params.id,
      organization_id: req.user.organizationId
    });

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json(contact);
  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create contact
router.post('/', [
  body('name').notEmpty().trim(),
  body('contact_type').isIn(['Customer', 'Supplier', 'Both']),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().trim(),
  body('address').optional().trim(),
  body('tax_number').optional().trim(),
  body('currency').optional().isLength({ min: 3, max: 3 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check for duplicate name
    const existingContact = await db.findOne('contacts', {
      name: req.body.name,
      organization_id: req.user.organizationId
    });

    if (existingContact) {
      return res.status(400).json({ error: 'Contact with this name already exists' });
    }

    const contactData = {
      ...req.body,
      organization_id: req.user.organizationId,
      is_active: true
    };

    const newContact = await db.insert('contacts', contactData);
    res.status(201).json(newContact);
  } catch (error) {
    console.error('Create contact error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update contact
router.put('/:id', [
  body('name').optional().notEmpty().trim(),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().trim(),
  body('address').optional().trim(),
  body('tax_number').optional().trim(),
  body('is_active').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Verify contact belongs to organization
    const existingContact = await db.findOne('contacts', {
      id: req.params.id,
      organization_id: req.user.organizationId
    });

    if (!existingContact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    const updatedContact = await db.update('contacts', req.params.id, req.body);
    res.json(updatedContact);
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete contact
router.delete('/:id', async (req, res) => {
  try {
    // Verify contact belongs to organization
    const contact = await db.findOne('contacts', {
      id: req.params.id,
      organization_id: req.user.organizationId
    });

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    // Check if contact has invoices or bills
    const invoice = await db.findOne('invoices', { contact_id: req.params.id });
    const bill = await db.findOne('bills', { contact_id: req.params.id });

    if (invoice || bill) {
      return res.status(400).json({ 
        error: 'Cannot delete contact with associated invoices or bills' 
      });
    }

    await db.delete('contacts', req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
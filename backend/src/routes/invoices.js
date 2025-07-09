import express from 'express';
import { body, validationResult } from 'express-validator';
import db from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all invoices
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

    const invoices = await db.findMany('invoices', conditions, {
      orderBy,
      limit: parseInt(limit)
    });

    // Calculate totals for each invoice
    for (const invoice of invoices) {
      const lineItems = await db.findMany('invoice_line_items', { 
        invoice_id: invoice.id 
      });
      
      invoice.line_items = lineItems;
      invoice.total = lineItems.reduce((sum, item) => 
        sum + (parseFloat(item.quantity) * parseFloat(item.unit_price)), 0
      );
    }

    res.json(invoices);
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get invoice by ID
router.get('/:id', async (req, res) => {
  try {
    const invoice = await db.findOne('invoices', {
      id: req.params.id,
      organization_id: req.user.organizationId
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Get line items
    const lineItems = await db.findMany('invoice_line_items', { 
      invoice_id: invoice.id 
    });
    
    invoice.line_items = lineItems;
    invoice.total = lineItems.reduce((sum, item) => 
      sum + (parseFloat(item.quantity) * parseFloat(item.unit_price)), 0
    );

    res.json(invoice);
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create invoice
router.post('/', [
  body('contact_id').isUUID(),
  body('invoice_date').isISO8601(),
  body('due_date').isISO8601(),
  body('currency').optional().isLength({ min: 3, max: 3 }),
  body('line_items').isArray({ min: 1 }),
  body('line_items.*.description').notEmpty(),
  body('line_items.*.quantity').isFloat({ min: 0 }),
  body('line_items.*.unit_price').isFloat({ min: 0 }),
  body('line_items.*.account_id').isUUID()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { line_items, ...invoiceData } = req.body;

    // Verify contact belongs to organization
    const contact = await db.findOne('contacts', {
      id: invoiceData.contact_id,
      organization_id: req.user.organizationId
    });

    if (!contact) {
      return res.status(400).json({ error: 'Invalid contact' });
    }

    // Create invoice with transaction
    const result = await db.transaction(async (client) => {
      // Generate invoice number
      const countResult = await client.query(
        'SELECT COUNT(*) as count FROM invoices WHERE organization_id = $1',
        [req.user.organizationId]
      );
      const invoiceNumber = `INV-${(parseInt(countResult.rows[0].count) + 1).toString().padStart(5, '0')}`;

      // Create invoice
      const invoiceResult = await client.query(
        `INSERT INTO invoices (
          organization_id, contact_id, invoice_number, invoice_date, 
          due_date, status, currency, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [
          req.user.organizationId,
          invoiceData.contact_id,
          invoiceNumber,
          invoiceData.invoice_date,
          invoiceData.due_date,
          'Draft',
          invoiceData.currency || 'USD',
          req.user.id
        ]
      );

      const invoice = invoiceResult.rows[0];

      // Create line items
      const lineItemsData = [];
      let subtotal = 0;

      for (const item of line_items) {
        const lineResult = await client.query(
          `INSERT INTO invoice_line_items (
            invoice_id, description, quantity, unit_price, 
            account_id, tax_rate_id, amount
          ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
          [
            invoice.id,
            item.description,
            item.quantity,
            item.unit_price,
            item.account_id,
            item.tax_rate_id || null,
            item.quantity * item.unit_price
          ]
        );
        lineItemsData.push(lineResult.rows[0]);
        subtotal += item.quantity * item.unit_price;
      }

      // Update invoice totals
      await client.query(
        'UPDATE invoices SET subtotal = $1, total = $2 WHERE id = $3',
        [subtotal, subtotal, invoice.id] // Add tax calculation if needed
      );

      invoice.line_items = lineItemsData;
      invoice.subtotal = subtotal;
      invoice.total = subtotal;

      return invoice;
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update invoice
router.put('/:id', [
  body('invoice_date').optional().isISO8601(),
  body('due_date').optional().isISO8601(),
  body('status').optional().isIn(['Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Verify invoice belongs to organization
    const existingInvoice = await db.findOne('invoices', {
      id: req.params.id,
      organization_id: req.user.organizationId
    });

    if (!existingInvoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const updatedInvoice = await db.update('invoices', req.params.id, req.body);
    res.json(updatedInvoice);
  } catch (error) {
    console.error('Update invoice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete invoice
router.delete('/:id', async (req, res) => {
  try {
    // Verify invoice belongs to organization
    const invoice = await db.findOne('invoices', {
      id: req.params.id,
      organization_id: req.user.organizationId
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Only allow deletion of draft invoices
    if (invoice.status !== 'Draft') {
      return res.status(400).json({ 
        error: 'Only draft invoices can be deleted' 
      });
    }

    // Delete line items first
    await db.query(
      'DELETE FROM invoice_line_items WHERE invoice_id = $1',
      [req.params.id]
    );

    // Delete invoice
    await db.delete('invoices', req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Delete invoice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
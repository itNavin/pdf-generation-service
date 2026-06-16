const express = require('express');
const router = express.Router();
const { renderHtml } = require('../services/templateService');
const { htmlToPdfStream } = require('../services/pdfService');

router.post('/generate-pdf', async (req, res, next) => {
  try {
    const template = req.query.template || 'receipt'; // default to "receipt" if not specified
    if(template !== 'receipt' && template !== 'receipt_simple' && template !== 'invoice') {
      return res.status(400).json({
        error: 'Invalid template',
        message: 'Supported templates: receipt, receipt_simple, invoice'
      });
    }

    const now = new Date();
    const dateTime = now.toLocaleString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    let dataForTemplate;

    // ----- RECEIPT TEMPLATE -----
    if (template === 'receipt' || template === 'receipt_simple') {
      const { customerName, items, total } = req.body;

      if (!customerName || !Array.isArray(items) || typeof total !== 'number') {
        return res.status(400).json({
          error: 'Invalid request body for receipt',
          expectedFormat: {
            customerName: 'string',
            items: 'array of { name, price, quantity, subtotal }',
            total: 'number'
          }
        });
      }

      dataForTemplate = {
        customerName,
        items,
        total,
        date: dateTime
      };
    }

    // ----- INVOICE TEMPLATE -----
    else if (template === 'invoice') {
      const {
        company,
        customer,
        invoiceNumber,
        date,
        dueDate,
        items,
        summary,
        paymentTerms,
        notes
      } = req.body;

      if (
        !company ||
        !customer ||
        !invoiceNumber ||
        !Array.isArray(items) ||
        !summary ||
        typeof summary.total !== 'number'
      ) {
        return res.status(400).json({
          error: 'Invalid request body for invoice',
          expectedFormat: {
            company: '{ name, address, phone, email }',
            customer: '{ name, address, phone, email }',
            invoiceNumber: 'string',
            date: 'string (e.g. 16/06/2026)',
            dueDate: 'string',
            items: 'array of { description, unitPrice, quantity, subtotal }',
            summary: '{ subtotal, taxRate, taxAmount, total }',
            paymentTerms: 'string',
            notes: 'string'
          }
        });
      }

      dataForTemplate = {
        company,
        customer,
        invoiceNumber,
        date: date || dateTime, // use provided or current
        dueDate,
        items,
        summary,
        paymentTerms,
        notes
      };
    }

    // ----- UNKNOWN TEMPLATE -----
    else {
      return res.status(400).json({
        error: 'Unknown template',
        message: `Supported templates: receipt, receipt_simple, invoice`
      });
    }

    // Render HTML using selected template
    const html = await renderHtml(template, dataForTemplate);

    // Convert HTML to PDF
    const pdfStream = htmlToPdfStream(html);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${template}.pdf"`
    );

    pdfStream.on('error', (err) => next(err));
    pdfStream.pipe(res);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

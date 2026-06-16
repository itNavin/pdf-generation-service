New PDF Generation Service
==========================

A lightweight, maintainable PDF generation microservice that accepts JSON, merges it with an HTML/Handlebars template, and returns a PDF file. Designed to address:

1. Resource Heavy – Reduce CPU/RAM usage compared to a full browser-based solution.
2. Performance – Fast generation for typical receipt/invoice documents.
3. Maintainability – Easy-to-edit templates using HTML + CSS.

--------------------------------------------------
Tech Stack
--------------------------------------------------

- Runtime: Node.js
- API Framework: Express
- Template Engine: Handlebars (HTML + CSS templates)
- PDF Engine: wkhtmltopdf (HTML → PDF) via `wkhtmltopdf` npm package
- Dev Tools: VS Code (development), Postman (API testing)

--------------------------------------------------
Why This Approach?
--------------------------------------------------

wkhtmltopdf vs Headless Chrome (Puppeteer/Playwright)
-----------------------------------------------------

- Lighter and simpler than running a full modern browser.
- Sufficient HTML/CSS support for receipts/invoices.
- Lower CPU/RAM usage and good performance for server-side PDF generation.

This directly addresses:
- Resource heavy behavior of a browser-based PDF pipeline.
- Slow performance when generating many PDFs.

HTML Templates + Handlebars vs Low-Level PDF Libraries
------------------------------------------------------

- Templates are HTML + CSS, easy to understand and edit.
- Handlebars provides:
  - Simple variables: {{customerName}}
  - Loops: {{#each items}} ... {{/each}}
- Easier to maintain and change layout than low-level PDF libraries (iText, pdfkit, etc.), where layout is code.

This stack gives a good balance between:
- Performance & resource usage (lighter than browser-based).
- Maintainability (clean, editable templates).

--------------------------------------------------
Project Structure
--------------------------------------------------

pdf-generation-service/
  package.json
  src/
    server.js
    routes/
      pdfRoutes.js
    services/
      pdfService.js
      templateService.js
    templates/
      layouts/
        main.hbs
      receipt.hbs
      receipt_simple.hbs
      invoice.hbs
  README.md

--------------------------------------------------
Installation
--------------------------------------------------

Prerequisites
-------------

- Node.js (LTS recommended)
- npm
- wkhtmltopdf

1. Install wkhtmltopdf (Windows example)
----------------------------------------

1) Download from: https://wkhtmltopdf.org/downloads.html
2) Install to default location, e.g.:
   C:\Program Files\wkhtmltopdf
3) Add to PATH:
   - Path to add: C:\Program Files\wkhtmltopdf\bin
   - Open “Environment Variables” → Edit Path (system or user) → add the folder above.
   - Restart terminal/VS Code.
4) Verify:

   wkhtmltopdf -V

You should see a version number.

If not on PATH, the service can also be configured with an explicit path in pdfService.js via the `wkhtmltopdf` option.

2. Install Node dependencies
----------------------------

git clone <your-repo-url>.git
cd pdf-generation-service
npm install

--------------------------------------------------
Running the Service
--------------------------------------------------

Development mode (auto-restart with nodemon)
--------------------------------------------

npm run dev

Production mode
---------------

npm start

The service listens on: http://localhost:3000

Health check:

GET http://localhost:3000/health

--------------------------------------------------
API
--------------------------------------------------

Endpoint
--------

POST /generate-pdf

Template selection by query parameter:

- template=receipt (default if omitted)
- template=receipt_simple
- template=invoice

Example URLs:

- POST http://localhost:3000/generate-pdf
- POST http://localhost:3000/generate-pdf?template=receipt
- POST http://localhost:3000/generate-pdf?template=receipt_simple
- POST http://localhost:3000/generate-pdf?template=invoice

Response
--------

200 OK
- Content-Type: application/pdf
- Content-Disposition: attachment; filename="<template>.pdf"
- Body: PDF binary stream

400 Bad Request
- Invalid or missing fields for the chosen template.

500 Internal Server Error
- Unexpected error during rendering or PDF generation.

--------------------------------------------------
Templates and JSON Examples
--------------------------------------------------

The service currently supports three templates:

1) receipt (default)
2) receipt_simple
3) invoice

--------------------------------------------------
1. Template: receipt (default)
--------------------------------------------------

Detailed receipt with line items and totals.

Call:

POST http://localhost:3000/generate-pdf

or

POST http://localhost:3000/generate-pdf?template=receipt

Expected JSON body:

{
  "customerName": "John Doe",
  "items": [
    { "name": "Product A", "price": 10.5, "quantity": 2, "subtotal": 21.0 },
    { "name": "Product B", "price": 5.0, "quantity": 1, "subtotal": 5.0 }
  ],
  "total": 26.0
}

Fields used:

- customerName
- items[]:
  - name
  - price
  - quantity
  - subtotal
- total
- date (server adds current date-time automatically).

--------------------------------------------------
2. Template: receipt_simple
--------------------------------------------------

Simplified receipt layout (e.g., minimal or different styling).

Call:

POST http://localhost:3000/generate-pdf?template=receipt_simple

Example JSON body:

{
  "customerName": "Jane Smith",
  "items": [
    { "name": "Item X", "price": 15.0, "quantity": 1, "subtotal": 15.0 }
  ],
  "total": 15.0
}

Typical fields used (depending on your receipt_simple.hbs):

- customerName
- items (if shown)
- total
- date (server adds current date-time).

--------------------------------------------------
3. Template: invoice
--------------------------------------------------

Formal invoice with company/customer addresses, tax, and totals.

Call:

POST http://localhost:3000/generate-pdf?template=invoice

Expected JSON body:

{
  "company": {
    "name": "My Company",
    "address": "123 Business Street, City",
    "phone": "012-345-6789",
    "email": "billing@mycompany.com"
  },
  "customer": {
    "name": "Client Co.",
    "address": "999 Client Road, City",
    "phone": "099-999-9999",
    "email": "client@example.com"
  },
  "invoiceNumber": "INV-2026-001",
  "date": "16/06/2026 10:00:00",
  "dueDate": "30/06/2026",
  "items": [
    { "description": "Service A", "unitPrice": 100, "quantity": 2, "subtotal": 200 },
    { "description": "Service B", "unitPrice": 50, "quantity": 1, "subtotal": 50 }
  ],
  "summary": {
    "subtotal": 250,
    "taxRate": 7,
    "taxAmount": 17.5,
    "total": 267.5
  },
  "paymentTerms": "Payment due within 14 days.",
  "notes": "Please include the invoice number on your payment."
}

Fields used in invoice.hbs:

- company.{name,address,phone,email}
- customer.{name,address,phone,email}
- invoiceNumber
- date (if omitted, server may fallback to current datetime)
- dueDate
- items[]:
  - description
  - unitPrice
  - quantity
  - subtotal
- summary.{subtotal,taxRate,taxAmount,total}
- paymentTerms
- notes

--------------------------------------------------
Testing with Postman
--------------------------------------------------

1) Start the server:

   npm run dev

2) In Postman or others, create a POST request:
   - URL: choose one:
     - http://localhost:3000/generate-pdf
     - http://localhost:3000/generate-pdf?template=receipt_simple
     - http://localhost:3000/generate-pdf?template=invoice
   - Headers:
     - Content-Type: application/json
   - Body:
     - Select raw, then paste one of the JSON examples above.

3) Send the request.

4) Save the response:
   - In Postman, click Save Response → save as .pdf.
   - Open the PDF in any viewer to confirm layout and data.

--------------------------------------------------
Template Maintenance
--------------------------------------------------

Templates are stored under src/templates:

- Layout:
  - src/templates/layouts/main.hbs
- Templates:
  - src/templates/receipt.hbs
  - src/templates/receipt_simple.hbs
  - src/templates/invoice.hbs

To update layouts:

- Edit HTML and CSS directly in these .hbs files.
- Use Handlebars placeholders for dynamic values:
  - {{variable}}
  - {{#each items}} ... {{/each}}
- No need to change core PDF or routing logic unless you change the data shape.

--------------------------------------------------
Future Improvement
--------------------------------------------------
-Send to the customer email.
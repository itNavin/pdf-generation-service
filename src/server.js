const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const pdfRoutes = require('./routes/pdfRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON body
app.use(express.json());

// Configure Handlebars as the view engine
app.engine(
  'hbs',
  exphbs.engine({
    extname: '.hbs',
    layoutsDir: path.join(__dirname, 'templates', 'layouts'),
    defaultLayout: 'main'
  })
);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'templates'));

// Routes
app.use('/', pdfRoutes);

// Basic health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Global error handler (simple)
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);

  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'Unexpected error'
  });
});

app.listen(PORT, () => {
  console.log(`PDF Generation Service is running on port ${PORT}`);
});

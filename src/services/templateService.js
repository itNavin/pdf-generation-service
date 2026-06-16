const path = require('path');
const exphbs = require('express-handlebars');
const fs = require('fs');

const hbs = exphbs.create({
  extname: '.hbs',
  layoutsDir: path.join(__dirname, '..', 'templates', 'layouts'),
  defaultLayout: 'main'
});

// Generic renderer for any template (e.g. "receipt", "receipt_simple")
async function renderHtml(templateName, data) {
  const templatePath = path.join(__dirname, '..', 'templates', `${templateName}.hbs`);
  const templateSource = fs.readFileSync(templatePath, 'utf-8');
  const template = hbs.handlebars.compile(templateSource);

  const bodyHtml = template(data);

  const layoutPath = path.join(__dirname, '..', 'templates', 'layouts', 'main.hbs');
  const layoutSource = fs.readFileSync(layoutPath, 'utf-8');
  const layoutTemplate = hbs.handlebars.compile(layoutSource);

  const fullHtml = layoutTemplate({ body: bodyHtml, title: 'Receipt' });

  return fullHtml;
}

// Backwards compatibility: old name for default receipt template
async function renderReceiptHtml(data) {
  return renderHtml('receipt', data);
}

module.exports = {
  renderHtml,
  renderReceiptHtml
};

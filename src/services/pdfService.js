const wkhtmltopdf = require('wkhtmltopdf');

/**
 * Convert HTML string to a PDF stream using wkhtmltopdf.
 * Stream-based approach saves memory and handles large docs better.
 */
function htmlToPdfStream(html) {
  // You can tune options for performance/quality
  const options = {
    pageSize: 'A4',
    marginTop: '10mm',
    marginRight: '10mm',
    marginBottom: '10mm',
    marginLeft: '10mm',
    // Disable JavaScript for performance/stability if not needed
    disableJavascript: true
  };

  return wkhtmltopdf(html, options);
}

module.exports = {
  htmlToPdfStream
};

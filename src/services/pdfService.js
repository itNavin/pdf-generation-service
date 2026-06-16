const wkhtmltopdf = require('wkhtmltopdf');

// Max number of wkhtmltopdf processes in parallel
const MAX_CONCURRENT_JOBS = 3;

let activeJobs = 0;
const queue = [];

/**
 * Internal: run a job when there is capacity
 */
function runNext() {
  if (activeJobs >= MAX_CONCURRENT_JOBS) return;
  if (queue.length === 0) return;

  const { html, options, resolve, reject } = queue.shift();
  activeJobs++;

  try {
    const stream = wkhtmltopdf(html, options);

    // When the stream finishes or errors, free a slot
    stream.on('end', () => {
      activeJobs--;
      runNext();
    });

    stream.on('error', (err) => {
      activeJobs--;
      runNext();
      reject(err);
    });

    resolve(stream);
  } catch (err) {
    activeJobs--;
    runNext();
    reject(err);
  }
}

/**
 * Public function: returns a Promise that resolves to a PDF stream.
 * If too many jobs are running, this waits in a queue.
 */
function htmlToPdfStream(html) {
  const options = {
    pageSize: 'A4',
    marginTop: '10mm',
    marginRight: '10mm',
    marginBottom: '10mm',
    marginLeft: '10mm',
    disableJavascript: true,
    // If needed, you can add wkhtmltopdf path here
    // wkhtmltopdf: 'C:\\Program Files\\wkhtmltopdf\\bin\\wkhtmltopdf.exe'
  };

  return new Promise((resolve, reject) => {
    queue.push({ html, options, resolve, reject });
    runNext();
  });
}

module.exports = {
  htmlToPdfStream
};


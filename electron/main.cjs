
const path = require('path');
const { pathToFileURL } = require('url');

(async () => {
  try {
    const fileUrl = pathToFileURL(path.join(__dirname, 'main.mjs')).href;
    await import(fileUrl);
  } catch (err) {
    console.error('Failed to load ESM main.mjs:', err);
    process.exit(1);
  }
})();

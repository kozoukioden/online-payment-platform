// Vercel requires a root entrypoint when a package.json is present.
// We export the API application here so Vercel can build it without complaining.
// Note: This function will be very small because it doesn't include any static file serving logic.
module.exports = require('./api/index.js');

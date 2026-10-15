/**
 * Entry point for cPanel / Passenger (Setup Node.js App).
 * Do not listen on a hard-coded port here — Nest reads process.env.PORT or 'passenger'.
 */
require('./dist/main');

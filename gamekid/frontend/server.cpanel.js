/**
 * Entry for cPanel "Setup Node.js App" (Passenger).
 * Upload this as Application startup file, e.g. server.cpanel.js
 *
 * Do NOT use this on Vercel — Vercel runs `next start` itself.
 */
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const dev = false;
const app = next({ dev });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const server = createServer((req, res) => {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    });

    if (typeof PhusionPassenger !== "undefined") {
      server.listen("passenger");
    } else {
      const port = Number(process.env.PORT) || 3000;
      server.listen(port, "0.0.0.0", () => {
        console.log(`Next.js listening on ${port}`);
      });
    }
  })
  .catch((err) => {
    console.error("Failed to start Next.js", err);
    process.exit(1);
  });

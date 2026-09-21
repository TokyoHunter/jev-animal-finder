// Tiny local server: serves the page and forwards searches to Jev,
// so your API key stays on the server and never reaches the browser.
//
//   1. Create a file named .env next to this script containing:  TYPESAFE_API_KEY=your_key
//   2. Run:  node server.js
//   3. Open http://localhost:3000
//
// Needs Node 18+ (built-in fetch). No npm install required.

const http = require("http");
const fs = require("fs");
const path = require("path");

// Key can come from the environment, or from a file named .env next to this script:
//   TYPESAFE_API_KEY=your_key
try {
  const env = fs.readFileSync(path.join(__dirname, ".env"), "utf8");
  for (const line of env.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch (e) {}

const KEY = process.env.TYPESAFE_API_KEY;
const UPSTREAM = process.env.JEV_URL || "https://api.typesafe.ai/v1/systemone";
const PORT = process.env.PORT || 3000;
const PAGE = path.join(__dirname, "index.html");

if (!KEY) {
  console.error("No key found. Create a file named .env next to server.js containing:\nTYPESAFE_API_KEY=your_key");
  process.exit(1);
}

http.createServer(async (req, res) => {
  if (req.method === "POST" && req.url === "/api/systemone") {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", async () => {
      try {
        const r = await fetch(UPSTREAM, {
          method: "POST",
          headers: { Authorization: "Bearer " + KEY, "Content-Type": "application/json" },
          body,
        });
        res.writeHead(r.status, { "Content-Type": "application/json" });
        res.end(await r.text());
      } catch (e) {
        res.writeHead(502, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: String(e) }));
      }
    });
    return;
  }
  if (req.method === "GET" && (req.url === "/" || req.url === "/index.html")) {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    fs.createReadStream(PAGE).pipe(res);
    return;
  }
  res.writeHead(404);
  res.end("Not found");
}).listen(PORT, () => console.log("Open http://localhost:" + PORT));

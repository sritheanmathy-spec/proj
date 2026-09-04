const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORTS = [3001, 3002, 5000, 8080, 8000];
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  let reqPath = parsedUrl.pathname;

  // 1. Live Website URL Fetch Proxy Endpoint
  if (reqPath === '/api/fetch-url') {
    const targetUrl = parsedUrl.query.url;
    if (!targetUrl) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Missing url query parameter' }));
      return;
    }

    try {
      console.log(`[Proxy] Fetching target URL: ${targetUrl}`);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(targetUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });
      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      let html = await response.text();

      // Extract body content or main section if full document
      const bodyMatch = /<body[^>]*>([\s\S]*?)<\/body>/i.exec(html);
      let snippet = bodyMatch ? bodyMatch[1] : html;

      // Remove large script & style tags to keep HTML clean for a11y analysis
      snippet = snippet
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, '<span class="icon">[SVG Icon]</span>')
        .trim();

      // Limit length if excessively large
      if (snippet.length > 25000) {
        snippet = snippet.substring(0, 25000) + '\n<!-- Snippet trimmed for demo analysis -->';
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        targetUrl,
        html: snippet,
        length: snippet.length
      }));
    } catch (err) {
      console.error(`[Proxy] Fetch failed for ${targetUrl}:`, err.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: err.name === 'AbortError' ? 'Request timed out after 10 seconds' : err.message
      }));
    }
    return;
  }

  // 2. Static File Serving
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
  const filePath = path.join(__dirname, reqPath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

function tryListen(portIndex) {
  if (portIndex >= PORTS.length) {
    console.error('All ports in use');
    process.exit(1);
  }
  const port = PORTS[portIndex];
  server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
  });
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      tryListen(portIndex + 1);
    } else {
      console.error(err);
    }
  });
}

tryListen(0);

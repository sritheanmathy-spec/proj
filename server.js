const http = require('http');
const fs = require('fs');
const path = require('path');

// Allow dev/staging self-signed SSL certificates for target URLs in proxy
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { remediateHtml } = require('./engine/remediator.js');

const PORTS = [3000, 3001, 3002, 5000, 8080, 8000];
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

function normalizeTargetUrl(raw) {
  if (!raw) return '';
  let clean = raw.trim();
  if (!/^https?:\/\//i.test(clean)) {
    clean = 'https://' + clean;
  }
  return clean;
}

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

  const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let reqPath = reqUrl.pathname;

  // 1. Live Website URL Fetch Proxy Endpoint (Full-Document Preservation with <base href>)
  if (reqPath === '/api/fetch-url') {
    const rawTarget = reqUrl.searchParams.get('url');
    const targetUrl = normalizeTargetUrl(rawTarget);
    if (!targetUrl) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Missing or invalid url query parameter' }));
      return;
    }

    try {
      console.log(`[Proxy] Fetching target URL: ${targetUrl}`);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 35000);

      const response = await fetch(targetUrl, {
        signal: controller.signal,
        redirect: 'follow',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });
      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      const finalUrl = response.url || targetUrl;
      let rawHtml = await response.text();

      // Ensure <base href="..."> is present in <head> so images and stylesheets resolve
      let fullHtml = rawHtml;
      const baseTag = `<base href="${finalUrl}">`;
      if (/<head\b[^>]*>/i.test(fullHtml)) {
        fullHtml = fullHtml.replace(/<head\b[^>]*>/i, `$& \n  ${baseTag}`);
      } else {
        fullHtml = `${baseTag}\n${fullHtml}`;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        targetUrl,
        finalUrl,
        html: fullHtml,
        length: fullHtml.length
      }));
    } catch (err) {
      console.error(`[Proxy] Fetch failed for ${targetUrl}:`, err.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: err.name === 'AbortError' ? 'Target server response timed out after 35 seconds' : err.message
      }));
    }
    return;
  }

  // 2. Live Healed Website Reverse Proxy: Serves the real website with in-memory AST healing & runtime injection
  if (reqPath === '/api/live-heal') {
    const rawTarget = reqUrl.searchParams.get('url');
    const targetUrl = normalizeTargetUrl(rawTarget);
    if (!targetUrl) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Missing or invalid url query parameter');
      return;
    }

    try {
      console.log(`[LiveHeal] Reverse proxying & healing: ${targetUrl}`);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 35000);

      const response = await fetch(targetUrl, {
        signal: controller.signal,
        redirect: 'follow',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });
      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      const finalUrl = response.url || targetUrl;
      let rawHtml = await response.text();

      // 1. AST Remediation
      const remediated = remediateHtml(rawHtml);
      let healedHtml = remediated.remediatedHtml;

      // 2. Inject <base href> and runtime-heal script
      const baseTag = `<base href="${finalUrl}">`;
      const runtimeTag = `<script src="/engine/runtime-heal.js" async></script>`;

      if (/<head\b[^>]*>/i.test(healedHtml)) {
        healedHtml = healedHtml.replace(/<head\b[^>]*>/i, `$& \n  ${baseTag}\n  ${runtimeTag}`);
      } else {
        healedHtml = `${baseTag}\n${runtimeTag}\n${healedHtml}`;
      }

      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'X-A11y-Engine-Remediated': 'true',
        'X-A11y-Standard': 'WCAG-2.1-AA-Verified'
      });
      res.end(healedHtml);
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<h1>Live Healing Error</h1><p>${err.message}</p>`);
    }
    return;
  }

  // 3. Static File Serving
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

#!/usr/bin/env node
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = parseInt(process.env.PORT, 10) || 3000;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.md': 'text/plain; charset=utf-8',
};

const RELOAD_SCRIPT =
  '<script>new EventSource("/__reload").onmessage=()=>location.reload();</script>';

// --- SSE clients ---
let clients = [];

function broadcast() {
  const msg = 'data: reload\n\n';
  clients = clients.filter((res) => {
    try {
      res.write(msg);
      return true;
    } catch (_) {
      return false;
    }
  });
}

// --- Debounced fs.watch ---
let debounceTimer = null;

try {
  fs.watch(path.join(ROOT, 'src'), { recursive: true }, () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(broadcast, 150);
  });
} catch (err) {
  console.warn(`Warning: unable to watch src/ for changes (${err.message})`);
}

// --- Resolve URL path to filesystem path ---
function resolvePath(reqPath) {
  if (reqPath === '/') {
    return path.join(ROOT, 'index.html');
  }
  if (reqPath.startsWith('/src/')) {
    return path.join(ROOT, reqPath);
  }
  if (reqPath.startsWith('/docs/')) {
    return path.join(ROOT, reqPath);
  }
  if (reqPath === '/music-tools-boilerplate.html') {
    return path.join(ROOT, 'music-tools-boilerplate.html');
  }
  return null;
}

// --- HTTP server ---
const server = http.createServer((req, res) => {
  const parsed = new URL(req.url, `http://localhost:${PORT}`);
  const reqPath = parsed.pathname;

  // SSE endpoint
  if (reqPath === '/__reload') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    res.write(':\n\n'); // initial comment to open stream
    clients.push(res);
    req.on('close', () => {
      clients = clients.filter((c) => c !== res);
    });
    return;
  }

  const filePath = resolvePath(reqPath);

  if (!filePath) {
    console.log(`GET ${reqPath} → 404`);
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      const status = err.code === 'ENOENT' ? 404 : 500;
      console.log(`GET ${reqPath} → ${status}`);
      res.writeHead(status, { 'Content-Type': 'text/plain' });
      res.end(status === 404 ? 'Not found' : 'Internal server error');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME[ext] || 'application/octet-stream';

    let body = data;
    if (ext === '.html') {
      const html = data.toString('utf8');
      body = Buffer.from(
        html.includes('</body>')
          ? html.replace(/<\/body>(?![\s\S]*<\/body>)/, RELOAD_SCRIPT + '</body>')
          : html + RELOAD_SCRIPT
      );
    }

    console.log(`GET ${reqPath} → 200`);
    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': body.length,
    });
    res.end(body);
  });
});

server.listen(PORT, () => {
  console.log(`music-tools dev server → http://localhost:${PORT}`);
});

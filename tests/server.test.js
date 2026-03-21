const test = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const http = require('node:http');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');

function startServer() {
  const port = 4100 + Math.floor(Math.random() * 1000);
  const server = spawn(process.execPath, ['server.js'], {
    cwd: ROOT,
    env: { ...process.env, PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  const waitForReady = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Timed out waiting for dev server to start'));
    }, 5000);

    server.stdout.on('data', (chunk) => {
      const text = chunk.toString('utf8');
      if (text.includes('music-tools dev server')) {
        clearTimeout(timeout);
        resolve();
      }
    });

    server.on('exit', (code) => {
      clearTimeout(timeout);
      reject(new Error(`Dev server exited before readiness (code ${code})`));
    });
  });

  return { server, port, waitForReady };
}

function stopServer(server) {
  return new Promise((resolve) => {
    if (server.exitCode !== null) {
      resolve();
      return;
    }
    server.once('exit', () => resolve());
    server.kill('SIGTERM');
  });
}

async function request(port, pathname) {
  const response = await fetch(`http://127.0.0.1:${port}${pathname}`);
  const body = await response.text();
  return { response, body };
}

function requestSseHandshake(port) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        host: '127.0.0.1',
        port,
        path: '/__reload',
        method: 'GET',
      },
      (res) => {
        res.setEncoding('utf8');
        res.once('data', (chunk) => {
          resolve({
            statusCode: res.statusCode,
            contentType: res.headers['content-type'] || '',
            firstChunk: chunk,
          });
          req.destroy();
          res.destroy();
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

test('dev server serves routes and injects reload script into HTML only', async () => {
  const { server, port, waitForReady } = startServer();
  await waitForReady;

  try {
    const root = await request(port, '/');
    assert.equal(root.response.status, 200);
    assert.match(root.response.headers.get('content-type') || '', /^text\/html/);
    assert.match(root.body, /new EventSource\("\/__reload"\)/);

    const js = await request(port, '/src/js/music-tools.js');
    assert.equal(js.response.status, 200);
    assert.match(js.response.headers.get('content-type') || '', /^text\/javascript/);
    assert.doesNotMatch(js.body, /new EventSource\("\/__reload"\)/);

    const docs = await request(port, '/docs/ARCHITECTURE.md');
    assert.equal(docs.response.status, 200);
    assert.match(docs.response.headers.get('content-type') || '', /^text\/plain/);

    const notFound = await request(port, '/not-a-route');
    assert.equal(notFound.response.status, 404);
    assert.equal(notFound.body, 'Not found');
  } finally {
    await stopServer(server);
  }
});

test('dev server exposes reload SSE endpoint', async () => {
  const { server, port, waitForReady } = startServer();
  await waitForReady;

  try {
    const sse = await requestSseHandshake(port);
    assert.equal(sse.statusCode, 200);
    assert.match(sse.contentType, /^text\/event-stream/);
    assert.equal(sse.firstChunk, ':\n\n');
  } finally {
    await stopServer(server);
  }
});

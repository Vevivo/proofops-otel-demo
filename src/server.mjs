import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createArioDevEvidence } from './ario-sink.mjs';
import { LocalProofEngine, verifyLocalProof } from './local-proof.mjs';
import { extractOtlpLogRecords } from './otlp.mjs';
import { sampleOtlpRequest } from './sample.mjs';

const root = join(fileURLToPath(new URL('..', import.meta.url)), 'public');
const port = Number(process.env.PORT ?? 8787);
const host = process.env.HOST ?? '127.0.0.1';
const arioEnabled = process.env.ENABLE_ARIO_DEV_UPLOAD === '1';
const allowedOrigins = new Set(
  (process.env.CORS_ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
);
const engine = new LocalProofEngine();
const requestWindows = new Map();

const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json' };

function corsHeaders(request) {
  const origin = request.headers.origin;
  if (!origin || !allowedOrigins.has(origin)) return {};
  return {
    'access-control-allow-origin': origin,
    vary: 'Origin',
  };
}

function json(request, response, status, value) {
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'no-referrer',
    ...corsHeaders(request),
  });
  response.end(JSON.stringify(value, null, 2));
}

function allowed(request) {
  const forwarded = request.headers['x-forwarded-for'];
  const key = String(Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0] ?? request.socket.remoteAddress);
  const minute = Math.floor(Date.now() / 60_000);
  const current = requestWindows.get(key);
  if (!current || current.minute !== minute) {
    requestWindows.set(key, { minute, count: 1 });
    return true;
  }
  current.count += 1;
  return current.count <= 120;
}

async function body(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 1_000_000) throw new Error('Request exceeds 1 MB demo limit');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

async function api(request, response, url) {
  if (request.method === 'GET' && url.pathname === '/api/health') return json(request, response, 200, { ok: true, ario_dev_upload_enabled: arioEnabled });
  if (request.method === 'GET' && url.pathname === '/api/config') return json(request, response, 200, { ario_dev_upload_enabled: arioEnabled });
  if (request.method === 'GET' && url.pathname === '/api/sample') return json(request, response, 200, sampleOtlpRequest);
  if (request.method === 'POST' && url.pathname === '/api/preview') {
    const source = await body(request);
    return json(request, response, 200, { records: extractOtlpLogRecords(source) });
  }
  if (request.method === 'POST' && url.pathname === '/api/local-proof') {
    return json(request, response, 200, engine.create(await body(request)));
  }
  if (request.method === 'POST' && url.pathname === '/api/verify-local') {
    const payload = await body(request);
    return json(request, response, 200, verifyLocalProof(payload.proof, payload.source));
  }
  if (request.method === 'POST' && url.pathname === '/api/ario-proof') {
    if (!arioEnabled) return json(request, response, 403, { error: 'Permanent AR.IO dev uploads are disabled. Restart with ENABLE_ARIO_DEV_UPLOAD=1.' });
    const records = extractOtlpLogRecords(await body(request));
    return json(request, response, 200, await createArioDevEvidence(records));
  }
  return false;
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host ?? 'localhost'}`);
    if (request.method === 'OPTIONS' && url.pathname.startsWith('/api/')) {
      if (!allowedOrigins.has(request.headers.origin)) return json(request, response, 403, { error: 'Origin is not allowed' });
      response.writeHead(204, {
        ...corsHeaders(request),
        'access-control-allow-methods': 'GET, POST, OPTIONS',
        'access-control-allow-headers': 'content-type',
        'access-control-max-age': '600',
      });
      return response.end();
    }
    if (!allowed(request)) return json(request, response, 429, { error: 'Demo rate limit exceeded. Retry next minute.' });
    if (url.pathname.startsWith('/api/')) {
      const handled = await api(request, response, url);
      if (handled !== false) return;
      return json(request, response, 404, { error: 'API route not found' });
    }
    const pathname = url.pathname === '/' ? '/index.html' : url.pathname;
    if (pathname.includes('..')) return json(request, response, 400, { error: 'Invalid path' });
    const file = await readFile(join(root, pathname));
    response.writeHead(200, {
      'content-type': types[extname(pathname)] ?? 'application/octet-stream',
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'no-referrer',
      'content-security-policy': "default-src 'self'; style-src 'self'; script-src 'self'; connect-src 'self'; img-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
    });
    response.end(file);
  } catch (error) {
    json(request, response, error.code === 'ENOENT' ? 404 : 400, { error: error.message });
  }
});

server.listen(port, host, () => {
  process.stdout.write(`ProofOps demo: http://${host}:${port}\nAR.IO dev upload: ${arioEnabled ? 'enabled' : 'disabled'}\n`);
});

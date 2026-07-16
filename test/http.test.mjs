import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

function startServer(extraEnv = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['src/server.mjs'], {
      cwd: projectRoot,
      env: { ...process.env, PORT: '18787', HOST: '127.0.0.1', ENABLE_ARIO_DEV_UPLOAD: '0', ...extraEnv },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const timeout = setTimeout(() => {
      child.kill('SIGTERM');
      reject(new Error('Server startup timed out'));
    }, 5_000);
    child.once('error', reject);
    child.stdout.on('data', (chunk) => {
      if (chunk.toString().includes('ProofOps demo:')) {
        clearTimeout(timeout);
        resolve(child);
      }
    });
  });
}

test('HTTP demo serves securely and keeps permanent upload disabled', async (t) => {
  const child = await startServer();
  t.after(() => child.kill('SIGTERM'));

  const healthResponse = await fetch('http://127.0.0.1:18787/api/health');
  const health = await healthResponse.json();
  assert.equal(healthResponse.status, 200);
  assert.deepEqual(health, { ok: true, ario_dev_upload_enabled: false });

  const pageResponse = await fetch('http://127.0.0.1:18787/');
  assert.equal(pageResponse.status, 200);
  assert.match(pageResponse.headers.get('content-security-policy'), /default-src 'self'/);
  assert.match(await pageResponse.text(), /Make operational evidence portable/);

  const source = await (await fetch('http://127.0.0.1:18787/api/sample')).json();
  const previewResponse = await fetch('http://127.0.0.1:18787/api/preview', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(source),
  });
  const previewText = await previewResponse.text();
  assert.equal(previewResponse.status, 200);
  assert.equal(previewText.includes('alice@example.com'), false);
  assert.equal(previewText.includes('must-not-leak'), false);
  assert.equal(previewText.includes('secret-host-771'), false);
  assert.match(previewText, /source_event_sha256/);

  const arioResponse = await fetch('http://127.0.0.1:18787/api/ario-proof', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(source),
  });
  assert.equal(arioResponse.status, 403);
});

test('CORS permits only the configured ArNS frontend', async (t) => {
  const origin = 'https://proofops_document.ar.io';
  const child = await startServer({ CORS_ALLOWED_ORIGINS: origin });
  t.after(() => child.kill('SIGTERM'));

  const allowed = await fetch('http://127.0.0.1:18787/api/config', { headers: { origin } });
  assert.equal(allowed.status, 200);
  assert.equal(allowed.headers.get('access-control-allow-origin'), origin);

  const preflight = await fetch('http://127.0.0.1:18787/api/local-proof', {
    method: 'OPTIONS',
    headers: { origin, 'access-control-request-method': 'POST', 'access-control-request-headers': 'content-type' },
  });
  assert.equal(preflight.status, 204);
  assert.match(preflight.headers.get('access-control-allow-methods'), /POST/);

  const denied = await fetch('http://127.0.0.1:18787/api/local-proof', {
    method: 'OPTIONS',
    headers: { origin: 'https://attacker.example', 'access-control-request-method': 'POST' },
  });
  assert.equal(denied.status, 403);
  assert.equal(denied.headers.get('access-control-allow-origin'), null);
});

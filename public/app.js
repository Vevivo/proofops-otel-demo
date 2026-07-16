const source = document.querySelector('#source');
const output = document.querySelector('#output');
const verdict = document.querySelector('#verdict');
const verifyBtn = document.querySelector('#verifyBtn');
const tamperBtn = document.querySelector('#tamperBtn');
const arioBtn = document.querySelector('#arioBtn');
const productionApi = 'https://proofops.194.163.169.13.sslip.io';
const sameOriginHosts = new Set(['localhost', '127.0.0.1', 'proofops.194.163.169.13.sslip.io']);
const apiBase = sameOriginHosts.has(window.location.hostname) ? '' : productionApi;
let proof = null;

async function request(path, options = {}) {
  const response = await fetch(`${apiBase}${path}`, options);
  const value = await response.json();
  if (!response.ok) throw new Error(value.error ?? `HTTP ${response.status}`);
  return value;
}

function show(value, state = 'neutral', label = 'RESULT') {
  output.textContent = JSON.stringify(value, null, 2);
  verdict.className = `pill ${state}`;
  verdict.textContent = label;
}

function parsedSource() { return JSON.parse(source.value); }

async function loadSample() {
  const sample = await request('/api/sample');
  source.value = JSON.stringify(sample, null, 2);
  proof = null;
  verifyBtn.disabled = true;
  tamperBtn.disabled = true;
  show({ ready: true, next: 'Preview the safe record or create a proof.' }, 'neutral', 'READY');
}

async function post(path, value) {
  return request(path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(value) });
}

document.querySelector('#sampleBtn').addEventListener('click', loadSample);
document.querySelector('#previewBtn').addEventListener('click', async () => {
  try { show(await post('/api/preview', parsedSource()), 'good', 'MINIMIZED'); }
  catch (error) { show({ error: error.message }, 'bad', 'ERROR'); }
});
document.querySelector('#proofBtn').addEventListener('click', async () => {
  try {
    proof = await post('/api/local-proof', parsedSource());
    show(proof, 'good', 'SIGNED');
    verifyBtn.disabled = false;
    tamperBtn.disabled = false;
  } catch (error) { show({ error: error.message }, 'bad', 'ERROR'); }
});
verifyBtn.addEventListener('click', async () => {
  try {
    const result = await post('/api/verify-local', { proof, source: parsedSource() });
    show(result, result.ok ? 'good' : 'bad', result.ok ? 'VERIFIED' : 'FAILED');
  } catch (error) { show({ error: error.message }, 'bad', 'ERROR'); }
});
tamperBtn.addEventListener('click', async () => {
  try {
    const tampered = parsedSource();
    tampered.resourceLogs[0].scopeLogs[0].logRecords[0].body.stringValue += '!';
    source.value = JSON.stringify(tampered, null, 2);
    const result = await post('/api/verify-local', { proof, source: tampered });
    show(result, 'bad', 'TAMPER DETECTED');
  } catch (error) { show({ error: error.message }, 'bad', 'ERROR'); }
});
arioBtn.addEventListener('click', async () => {
  if (!confirm('This creates a permanent AR.IO development proof. Raw log bytes are not uploaded. Continue?')) return;
  try { show({ status: 'Anchoring…' }, 'neutral', 'WORKING'); show(await post('/api/ario-proof', parsedSource()), 'good', 'AR.IO PROOF'); }
  catch (error) { show({ error: error.message }, 'bad', 'ERROR'); }
});

const config = await request('/api/config');
arioBtn.disabled = !config.ario_dev_upload_enabled;
document.querySelector('#modeDot').className = config.ario_dev_upload_enabled ? 'live' : '';
document.querySelector('#modeText').textContent = config.ario_dev_upload_enabled
  ? 'AR.IO development uploads enabled'
  : 'Local-only mode · permanent uploads disabled';
const arnsHosted = window.location.hostname === 'proofops_document.ar.io';
document.querySelector('#frontendMode').textContent = arnsHosted
  ? 'Frontend: permanent AR.IO / ArNS'
  : 'Frontend: HTTPS preview';
document.querySelector('#apiMode').textContent = `Proof API: ${apiBase || window.location.origin}`;
await loadSample();

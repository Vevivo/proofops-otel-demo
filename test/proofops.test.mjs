import test from 'node:test';
import assert from 'node:assert/strict';
import { LocalProofEngine, verifyLocalProof } from '../src/local-proof.mjs';
import { extractOtlpLogRecords } from '../src/otlp.mjs';
import { sampleOtlpRequest } from '../src/sample.mjs';

test('privacy projection excludes raw body and non-allowlisted attributes', () => {
  const records = extractOtlpLogRecords(sampleOtlpRequest);
  const serialized = JSON.stringify(records);
  assert.equal(records.length, 2);
  assert.equal(records[0].resource['service.name'], 'claims-ai');
  assert.equal(records[0].attributes['event.name'], 'claim.decision');
  assert.equal(serialized.includes('alice@example.com'), false);
  assert.equal(serialized.includes('must-not-leak'), false);
  assert.equal(serialized.includes('secret-host-771'), false);
  assert.match(records[0].body_sha256, /^[a-f0-9]{64}$/);
});

test('untampered OTLP source verifies', () => {
  const engine = new LocalProofEngine();
  const proof = engine.create(sampleOtlpRequest);
  const result = verifyLocalProof(proof, sampleOtlpRequest);
  assert.equal(result.ok, true);
  assert.equal(result.signature_valid, true);
  assert.equal(result.events.every((event) => event.ok), true);
});

test('one-character source modification is detected', () => {
  const engine = new LocalProofEngine();
  const proof = engine.create(sampleOtlpRequest);
  const tampered = structuredClone(sampleOtlpRequest);
  tampered.resourceLogs[0].scopeLogs[0].logRecords[0].body.stringValue += '!';
  const result = verifyLocalProof(proof, tampered);
  assert.equal(result.ok, false);
  assert.equal(result.events[0].source_matches, false);
  assert.equal(result.events[1].source_matches, true);
});

test('modifying the embedded safe record is detected', () => {
  const engine = new LocalProofEngine();
  const proof = engine.create(sampleOtlpRequest);
  proof.events[0].record.severity = 'ERROR';
  const result = verifyLocalProof(proof, sampleOtlpRequest);
  assert.equal(result.ok, false);
  assert.equal(result.events[0].embedded_record_matches, false);
});

test('malformed OTLP input is rejected', () => {
  assert.throws(() => extractOtlpLogRecords({ logs: [] }), /resourceLogs/);
});

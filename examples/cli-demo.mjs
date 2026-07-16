import { LocalProofEngine, verifyLocalProof } from '../src/local-proof.mjs';
import { extractOtlpLogRecords } from '../src/otlp.mjs';
import { sampleOtlpRequest } from '../src/sample.mjs';

const engine = new LocalProofEngine();
const records = extractOtlpLogRecords(sampleOtlpRequest);
const proof = engine.create(sampleOtlpRequest);
const valid = verifyLocalProof(proof, sampleOtlpRequest);
const tampered = structuredClone(sampleOtlpRequest);
tampered.resourceLogs[0].scopeLogs[0].logRecords[0].body.stringValue = 'Claim 49382 rejected for customer alice@example.com';
const invalid = verifyLocalProof(proof, tampered);

process.stdout.write(`${JSON.stringify({
  safe_record: records[0],
  sensitive_values_absent: !JSON.stringify(records).includes('alice@example.com') && !JSON.stringify(records).includes('must-not-leak'),
  original_verification: valid,
  tampered_verification: invalid,
}, null, 2)}\n`);

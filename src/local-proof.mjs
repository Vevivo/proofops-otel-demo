import { generateKeyPairSync, sign, verify } from 'node:crypto';
import { canonicalize, hashJson } from './canonical.mjs';
import { buildMerkle, verifyMerklePath } from './merkle.mjs';
import { extractOtlpLogRecords } from './otlp.mjs';

export class LocalProofEngine {
  constructor() {
    const { privateKey, publicKey } = generateKeyPairSync('ed25519');
    this.privateKey = privateKey;
    this.publicKey = publicKey;
  }

  create(request) {
    const records = extractOtlpLogRecords(request);
    const leaves = records.map(hashJson);
    const tree = buildMerkle(leaves);
    const createdAt = new Date().toISOString();
    const signed = {
      spec_version: 'proofops.local-demo/v1',
      created_at: createdAt,
      merkle_root: tree.root,
      event_count: records.length,
    };
    return {
      ...signed,
      public_key_jwk: this.publicKey.export({ format: 'jwk' }),
      signature: sign(null, Buffer.from(canonicalize(signed)), this.privateKey).toString('base64url'),
      events: records.map((record, index) => ({
        index,
        record,
        leaf_hash: leaves[index],
        audit_path: tree.paths[index],
      })),
      disclaimer: 'Local demonstrator only; this is not an AR.IO network receipt.',
    };
  }
}

export function verifyLocalProof(proof, sourceRequest) {
  try {
    if (proof.spec_version !== 'proofops.local-demo/v1') throw new Error('Unsupported proof');
    const signed = {
      spec_version: proof.spec_version,
      created_at: proof.created_at,
      merkle_root: proof.merkle_root,
      event_count: proof.event_count,
    };
    const signatureValid = verify(
      null,
      Buffer.from(canonicalize(signed)),
      { key: proof.public_key_jwk, format: 'jwk' },
      Buffer.from(proof.signature, 'base64url'),
    );
    const sourceRecords = extractOtlpLogRecords(sourceRequest);
    const countMatches = sourceRecords.length === proof.events.length;
    const eventResults = proof.events.map((event, index) => {
      const sourceRecord = sourceRecords[index];
      const sourceMatches = Boolean(sourceRecord) && hashJson(sourceRecord) === event.leaf_hash;
      const embeddedMatches = hashJson(event.record) === event.leaf_hash;
      const included = verifyMerklePath(event.leaf_hash, event.audit_path, proof.merkle_root);
      return { index, source_matches: sourceMatches, embedded_record_matches: embeddedMatches, merkle_inclusion_valid: included, ok: sourceMatches && embeddedMatches && included };
    });
    const ok = signatureValid && countMatches && eventResults.every((item) => item.ok);
    return { ok, signature_valid: signatureValid, event_count_matches: countMatches, events: eventResults };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

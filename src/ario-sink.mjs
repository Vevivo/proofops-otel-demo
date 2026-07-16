import { canonicalize } from './canonical.mjs';

export async function createArioDevEvidence(records) {
  const { createAnchorer } = await import('@ar.io/anchor');
  const ario = createAnchorer();
  const batch = ario.batch({
    maxEvents: Math.max(1, records.length),
    maxAge: 60_000,
  });
  const handles = records.map((record, index) => batch.add({
    data: canonicalize(record),
    ref: `otlp://proofops/event/${index}`,
  }));
  const pending = handles.map((handle) => handle.receipt());
  await ario.close();
  const receipts = await Promise.all(pending);
  const bundle = await ario.bundle(receipts);
  return {
    mode: 'ario-dev',
    warning: 'Permanent development proof. Raw OTLP bytes were not uploaded.',
    checkpoint_tx_ids: [...new Set(receipts.map((receipt) => receipt.checkpointTxId))],
    gateway_urls: [...new Set(receipts.map((receipt) => receipt.gatewayUrl).filter(Boolean))],
    bundle,
  };
}

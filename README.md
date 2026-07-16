# ProofOps — OpenTelemetry → AR.IO proof demo

ProofOps is a deliberately small proof-of-value. It shows that a company can take standard OTLP/HTTP JSON logs, keep the raw log body private, and produce a portable tamper-evident proof using AR.IO's existing `@ar.io/anchor` stack.

This is not a production service and it does not invent a new AR.IO proof format.

## Live demos

- Permanent frontend target: [proofops_document.ar.io](https://proofops_document.ar.io)

The ArNS frontend is a static, immutable build served from an Arweave manifest. It calls the isolated HTTPS proof API on Contabo. The backend accepts cross-origin browser requests only from the configured ArNS origin; permanent AR.IO uploads remain disabled by default.

## What the demo proves

1. It accepts the standard OpenTelemetry `ExportLogsServiceRequest` JSON shape.
2. It creates a safe projection for display while hashing the complete source event locally.
3. It groups events into one Merkle root in local-demo mode.
4. It detects a one-character modification in the original log.
5. With an explicit opt-in, it uses `@ar.io/anchor` dev mode to create a real `ario.events/v1` batch and `ario.evidence/v1` bundle.

## Run locally

```bash
npm install
npm start
```

Open `http://localhost:8787`. No account, wallet, database, domain, or paid cloud is required.

For a public Contabo deployment, see `deploy/CONTABO.md`. The supplied Compose configuration binds the app to loopback for use behind a TLS reverse proxy and keeps permanent uploads disabled.

Run tests:

```bash
npm test
```

Create the static ArNS build:

```bash
npm run build
```

This copies the reviewed frontend into `dist/` with relative asset paths suitable for Arweave manifests.

Run the command-line walkthrough:

```bash
npm run demo:cli
```

## Optional AR.IO dev upload

Permanent network writes are disabled by default. Enable the button explicitly:

```bash
ENABLE_ARIO_DEV_UPLOAD=1 npm start
```

Then choose **Create AR.IO dev proof** in the UI. `@ar.io/anchor` dev mode creates a temporary identity/funding wallet and uses Turbo's small-upload development flow. The resulting proof is permanently marked `environment: "dev"` and only the signed minimal-disclosure envelope is uploaded; raw OTLP data stays local.

The returned evidence bundle can be checked with AR.IO's existing read-only verifier:

```bash
npx @ar.io/proof verify evidence-bundle.json
```

Always review Turbo/AR.IO terms and current free-tier behavior before a public demo.

## Permanent frontend deployment

The repository pins the official `@ar.io/deploy` CLI and targets the `proofops` undername of the existing `document` ArNS name:

```bash
npm run deploy:arns
```

The command builds `dist/`, uploads it through Turbo, creates the manifest, and requests an update to `proofops_document`. Run it only from a trusted machine with a dedicated deployment wallet and the Solana wallet/controller that manages the ArNS name. Never commit or paste private keys into issues, logs, or chat.

The backend container must include:

```text
CORS_ALLOWED_ORIGINS=https://proofops_document.ar.io
```

This is a hybrid demo by design: the discoverable frontend is permanent on AR.IO/ArNS, while compute remains an isolated, replaceable service. A production API would add authentication, durable receipts, managed keys, quotas, and an SLA.

## Privacy model

The public/safe record contains:

- service name, version, environment, and region when supplied;
- timestamp, severity, trace ID, and span ID;
- a small allowlist of operational attributes;
- SHA-256 of the original body;
- SHA-256 of the complete source event.

It does not disclose the body or arbitrary attributes. A hash can still reveal equality or permit guessing when the source has low entropy. Production policy must support salting/keyed commitments, retention rules, and a data-protection review.

## Repository map

- `src/otlp.mjs`: OTLP parsing and privacy projection.
- `src/local-proof.mjs`: zero-cost Merkle/signature demonstrator.
- `src/ario-sink.mjs`: thin adapter over the existing AR.IO package.
- `src/server.mjs`: local API and demo server.
- `public/`: single-page demo interface.
- `test/`: positive, tamper, redaction, and malformed-input tests.
- `PARTNERSHIP_BRIEF.md`: funding/partnership pitch and bounded milestones.
- `docs/SOURCES.md`: verified official sources, current grant status, and honest product boundaries.

## Commercial boundary

The open-source bridge demonstrates interoperability. A sustainable managed product would charge for policy management, hosted ingestion, SSO/RBAC, key management, monitoring, audit exports, SLAs, and compliance workflows. Those services are intentionally outside this zero-budget demo.

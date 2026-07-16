# ProofOps partnership brief

## One-line proposal

Turn selected OpenTelemetry audit events into privacy-minimized, independently verifiable AR.IO evidence without changing application code or inventing a new proof format.

## Why this matters to AR.IO

AR.IO already has the verification kernel, anchoring SDK, Merkle batching, evidence bundles, and adapters for selected developer ecosystems. ProofOps demonstrates a route into the vendor-neutral OpenTelemetry ecosystem while reusing those assets directly.

The demo's value is distribution:

- one OTLP integration can receive events from many languages and frameworks;
- raw logs remain within the producer's system;
- selected audit events become portable evidence;
- every successful batch generates AR.IO network usage;
- existing AR.IO verification tooling remains the trust path.

## What is already working

- OTLP/HTTP JSON ingestion;
- deterministic privacy projection;
- full-source-event commitment;
- local signed Merkle proof with tamper demonstration;
- optional `@ar.io/anchor` dev batch and `ario.evidence/v1` generation;
- automated redaction and adversarial tests;
- zero-cloud local demo UI.

## What funding would buy

### Milestone 1 — Interoperability hardening

- protobuf OTLP/gRPC and OTLP/HTTP support;
- configurable semantic-convention policies;
- bounded queues, retry behavior, backpressure, and dead-letter handling;
- AR.IO conformance tests and reproducible test vectors.

### Milestone 2 — Collector distribution

- native or officially packaged OpenTelemetry Collector component;
- container image, Helm example, and Kubernetes deployment guide;
- performance benchmark for batching cost, latency, and throughput;
- end-to-end verification example with the existing AR.IO proof checker.

### Milestone 3 — Design-partner pilot

- one AI or regulated-software design partner;
- signed production enrollment and managed keys/KMS adapter;
- audit evidence export and verification runbook;
- public case study with measurable network writes and verification reuse.

## Funding gate

No production build should begin without at least one of:

1. AR.IO sponsorship, a reopened grant/RFP, or paid integration agreement;
2. a paid design partner or written pilot commitment;
3. a co-selling/revenue-sharing agreement.

The first AR.IO grant program repository was archived on 2026-06-12 and new applications were closed. This brief is therefore a partnership/future-funding proposal, not a claim that a current grant application is available.

## Business model

Keep the bridge and proof format interoperable. Charge for the managed control plane:

- hosted ingestion and operational support;
- organization policies and redaction rules;
- RBAC/SSO and managed keys;
- searchable evidence inventory;
- scheduled auditor exports;
- SLA, monitoring, and incident response;
- vertical compliance workflow packs.

AR.IO receives new writes, integrations, and enterprise adoption. ProofOps receives recurring service revenue. Customers receive portable evidence rather than another proprietary log silo.

## Questions for the AR.IO team

1. Is an OTLP-to-proof integration already on the private or public roadmap?
2. Is `@ar.io/anchor` the preferred write path for a Collector component?
3. Which event profile and producer-enrollment surface should a production pilot target?
4. Would AR.IO consider sponsorship, a future RFP, or a co-selling pilot after reviewing the demo?
5. Which existing customer segment has expressed the strongest need for tamper-evident audit logs?

# Test results

Last local verification: 2026-07-16

Command:

```bash
npm test
```

Result: 7 passed, 0 failed.

Verified behaviors:

- HTTP health and static demo page;
- Content Security Policy header;
- exact-origin CORS and preflight behavior for `proofops_document.ar.io`;
- permanent AR.IO upload endpoint disabled by default;
- raw body and non-allowlisted attributes absent from safe projection;
- valid local signature and Merkle inclusion;
- one-character source tampering detected;
- embedded proof-record tampering detected;
- malformed OTLP input rejected.

The initial Docker image and public HTTPS deployment were acceptance-tested on the isolated Contabo runtime. Any revision must rebuild the image and repeat the checks in `deploy/CONTABO.md` before replacing the running container.

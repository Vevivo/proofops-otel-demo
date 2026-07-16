# Contabo deployment

The safest public demo starts in local-proof-only mode. It performs no permanent network writes and stores no submitted OTLP data.

## Requirements

- Ubuntu 22.04/24.04 or another supported Linux distribution;
- Docker Engine (Docker Compose is optional);
- an existing reverse proxy on ports 80 and 443;
- a DNS record pointing a subdomain to the server.

## Isolated Docker deployment

The example below uses loopback port `8791`, a dedicated container name, and strict resource/security limits. Check that the port and name are free before running it.

```bash
test -z "$(docker ps -aq -f name=^/proofops-demo$)"
! ss -lntH | grep -q ':8791 '

docker build -t proofops-demo:0.1.0 .
docker run -d \
  --name proofops-demo \
  --restart unless-stopped \
  --read-only \
  --tmpfs /tmp:rw,noexec,nosuid,size=16m \
  --security-opt no-new-privileges \
  --cap-drop ALL \
  --pids-limit 100 \
  --memory 256m \
  --cpus 0.5 \
  -p 127.0.0.1:8791:8787 \
  -e ENABLE_ARIO_DEV_UPLOAD=0 \
  -e CORS_ALLOWED_ORIGINS=https://proofops_document.ar.io \
  proofops-demo:0.1.0

curl --fail http://127.0.0.1:8791/api/health
```

The application is bound to loopback only. Do not publish its container port directly when a reverse proxy is available.

If Docker Compose is installed, the included `compose.yaml` remains available. Select an unused host port with `PROOFOPS_HOST_PORT`; lifecycle operations must be run only from this project directory.

## Nginx reverse proxy

Point a dedicated Nginx `server_name` at `http://127.0.0.1:8791`, set `client_max_body_size 1m`, validate with `nginx -t`, and only then perform a graceful reload. Add TLS using the server's existing certificate-management process.

## Safe defaults

- `ENABLE_ARIO_DEV_UPLOAD=0`: prevents permanent uploads from the public interface.
- `CORS_ALLOWED_ORIGINS=https://proofops_document.ar.io`: permits the permanent frontend without opening browser access to arbitrary origins.
- read-only container filesystem;
- no Linux capabilities and no privilege escalation;
- memory, CPU, process, request-size, and request-rate limits;
- no database or retained request logs inside the application.

If a live AR.IO demonstration is needed, enable it only for a short supervised session and disable it immediately afterward. A production service needs authentication, quotas, managed keys, durable receipts, observability, backups, and an abuse plan.

## Rollback

```bash
docker rm -f proofops-demo
docker image rm proofops-demo:0.1.0
```

Then remove only the ProofOps reverse-proxy site entry and application directory. Do not stop or delete any unrelated container, network, image, or volume.

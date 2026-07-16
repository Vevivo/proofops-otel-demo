#!/bin/sh
set -eu

echo "ProofOps read-only preflight"
date -u
id
uname -a

if [ -r /etc/os-release ]; then
  sed -n '1,12p' /etc/os-release
fi

uptime
df -h /

if command -v free >/dev/null 2>&1; then
  free -h
fi

if command -v ss >/dev/null 2>&1; then
  ss -lntup
fi

if command -v docker >/dev/null 2>&1; then
  docker --version
  docker compose version 2>/dev/null || true
  docker compose ls 2>/dev/null || true
  docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}'
else
  echo "Docker: not installed"
fi

for service in nginx caddy traefik; do
  if command -v systemctl >/dev/null 2>&1; then
    printf '%s: ' "$service"
    systemctl is-active "$service" 2>/dev/null || true
  fi
done

if command -v getent >/dev/null 2>&1 && [ "${PROOFOPS_DOMAIN:-}" ]; then
  getent ahosts "$PROOFOPS_DOMAIN" || true
fi

echo "Preflight complete. No state was changed."

#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
git pull
( cd web && pnpm install --frozen-lockfile && pnpm build )
pm2 restart ecosystem.config.js

#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

HOST="${MT5_BRIDGE_HOST:-127.0.0.1}"
PORT="${MT5_BRIDGE_PORT:-8789}"

if ! python3 - <<'PY' >/dev/null 2>&1
import fastapi
import uvicorn
PY
then
  echo "Installing Python requirements..."
  python3 -m pip install -r requirements.txt
fi

echo "Starting Zeus MT5 bridge on http://${HOST}:${PORT}"
echo "Safe default: MT5_ENABLE_LIVE=${MT5_ENABLE_LIVE:-false}"
python3 -m uvicorn mt5_bridge.server:app --host "${HOST}" --port "${PORT}"


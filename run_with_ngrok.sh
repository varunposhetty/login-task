#!/usr/bin/env bash
# run_with_ngrok.sh - start backend, frontend, and ngrok tunnels
# requires: ngrok installed and displayed via `ngrok version`

set -euo pipefail

# Backend
echo "Starting backend (uvicorn) on 127.0.0.1:8000..."
cd "$(dirname "$0")/backend"
source ../.venv/bin/activate
if pgrep -f "uvicorn server:app" >/dev/null; then
  echo "Existing uvicorn found, skipping spawn."
else
  nohup python -m uvicorn server:app --host 127.0.0.1 --port 8000 > /tmp/backend.log 2>&1 &
  echo "Backend pid: $!"
fi

# Frontend
echo "Starting frontend (craco) on 127.0.0.1:3000..."
cd "$(dirname "$0")/frontend"
if lsof -i :3000 -sTCP:LISTEN >/dev/null; then
  echo "Frontend already listening on :3000."
else
  nohup npm start > /tmp/frontend.log 2>&1 &
  echo "Frontend pid: $!"
fi

# ngrok
if ! command -v ngrok >/dev/null 2>&1; then
  echo "ERROR: ngrok is not installed. Install with:"
  echo "  brew install --cask ngrok"
  echo "  or from https://ngrok.com/download"
  exit 1
fi

echo "Starting ngrok tunnels for 8000 and 3000..."
ngrok http 8000 --log=stdout > /tmp/ngrok-backend.log 2>&1 &
echo "ngrok backend pid: $!"
ngrok http 3000 --log=stdout > /tmp/ngrok-frontend.log 2>&1 &
echo "ngrok frontend pid: $!"

echo "Done. Check /tmp/backend.log, /tmp/frontend.log, /tmp/ngrok-backend.log, /tmp/ngrok-frontend.log"
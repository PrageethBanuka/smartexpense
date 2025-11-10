#!/usr/bin/env bash
set -euo pipefail

# start-ngrok-jenkins.sh
# Starts an ngrok HTTPS tunnel to a local Jenkins instance and prints the public URL
# Usage: bash scripts/start-ngrok-jenkins.sh [port]

PORT=${1:-8080}

if ! command -v ngrok >/dev/null 2>&1; then
  echo "Error: ngrok is not installed."
  echo "Install on macOS: brew install --cask ngrok"
  echo "Then authenticate: ngrok config add-authtoken 35FoGvkrFOWPqR1VYHwzRXKGP2q_42WgzQjMRcENREksC8gaW"
  exit 1
fi

LOGFILE="/tmp/ngrok-jenkins.log"
echo "Starting ngrok tunnel to http://localhost:${PORT} ..."
echo "Logs: ${LOGFILE}"

# Start ngrok in the background
ngrok http "${PORT}" --log=stdout >"${LOGFILE}" 2>&1 &
NGROK_PID=$!
trap 'kill ${NGROK_PID} 2>/dev/null || true' EXIT

# Wait for ngrok API
API="http://127.0.0.1:4040/api/tunnels"
for i in {1..30}; do
  if curl -sf "${API}" >/dev/null; then break; fi
  sleep 1
done

PUBLIC_URL=""
if command -v jq >/dev/null 2>&1; then
  PUBLIC_URL=$(curl -s "${API}" | jq -r '.tunnels[] | select(.proto=="https") | .public_url' | head -n1)
else
  # Fallback parser without jq
  PUBLIC_URL=$(curl -s "${API}" | sed -n 's/.*"public_url":"\(https:[^"]*\)".*/\1/p' | head -n1)
fi

if [ -z "${PUBLIC_URL}" ] || [ "${PUBLIC_URL}" = "null" ]; then
  echo "Could not determine ngrok public URL automatically."
  echo "Open the ngrok web UI to copy it: http://127.0.0.1:4040"
  echo "Once you have it, use:"
  echo "  Jenkins URL:   https://https://smartish-dessie-geminiflorous.ngrok-free.dev//"
  echo "  Webhook URL:   https://https://smartish-dessie-geminiflorous.ngrok-free.dev//github-webhook/"
  wait ${NGROK_PID}
  exit 0
fi

echo ""
echo "Ngrok public URL: ${PUBLIC_URL}"
echo ""
echo "Set in Jenkins (Manage Jenkins → Configure System):"
echo "  Jenkins URL:   ${PUBLIC_URL}/"
echo ""
echo "GitHub webhook (Repo → Settings → Webhooks):"
echo "  Payload URL:   ${PUBLIC_URL}/github-webhook/"
echo "  Content type:  application/json"
echo "  Event:         Just the push event (or add PR events)"
echo ""
echo "Press Ctrl+C to stop the tunnel."
wait ${NGROK_PID}

#!/usr/bin/env bash
set -euo pipefail

BOT_DIR="/opt/TimchenkoBot"
BOT_FILE="$BOT_DIR/uzelpro_bot_v4.py"
PYTHON="$BOT_DIR/venv/bin/python"
SERVICE="uzelpro"
RAW_URL="https://raw.githubusercontent.com/Timchenko6/plapforma/main/telegram-bot/uzelpro_bot_v4.py"
OVERRIDE_DIR="/etc/systemd/system/${SERVICE}.service.d"
OVERRIDE_FILE="$OVERRIDE_DIR/v4.conf"
TMP="$(mktemp)"

cleanup() { rm -f "$TMP"; }
trap cleanup EXIT

if [[ ! -x "$PYTHON" ]]; then
  echo "ERROR: Python venv not found: $PYTHON" >&2
  exit 1
fi
if [[ ! -f "$BOT_DIR/.env" ]]; then
  echo "ERROR: .env not found: $BOT_DIR/.env" >&2
  exit 1
fi

curl -fsSL "$RAW_URL" -o "$TMP"
"$PYTHON" -m py_compile "$TMP"

if [[ -f "$BOT_FILE" ]]; then
  cp -a "$BOT_FILE" "$BOT_FILE.bak.$(date +%Y%m%d-%H%M%S)"
fi
install -m 0644 "$TMP" "$BOT_FILE"

mkdir -p "$OVERRIDE_DIR"
cat > "$OVERRIDE_FILE" <<EOF
[Service]
ExecStart=
ExecStart=$PYTHON $BOT_FILE
WorkingDirectory=$BOT_DIR
EOF

systemctl daemon-reload
systemctl restart "$SERVICE"
sleep 2

if systemctl is-active --quiet "$SERVICE"; then
  echo "OK: $SERVICE is active and TimchenkoBot v4 is deployed."
  systemctl --no-pager --full status "$SERVICE" | sed -n '1,12p'
else
  echo "ERROR: v4 failed to start. Rolling systemd override back to previous service command." >&2
  journalctl -u "$SERVICE" -n 40 --no-pager >&2 || true
  rm -f "$OVERRIDE_FILE"
  systemctl daemon-reload
  systemctl restart "$SERVICE" || true
  exit 1
fi

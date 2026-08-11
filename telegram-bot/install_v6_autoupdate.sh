#!/usr/bin/env bash
set -euo pipefail

BOT_DIR="/opt/TimchenkoBot"
BOT_FILE="$BOT_DIR/timchenko_bot_v6.py"
BOT_URL="https://raw.githubusercontent.com/Timchenko6/plapforma/main/telegram-bot/timchenko_bot_v6.py"
PY="$BOT_DIR/venv/bin/python"
SERVICE="uzelpro"
DROPIN_DIR="/etc/systemd/system/${SERVICE}.service.d"

if [[ ! -x "$PY" ]]; then
  echo "ERROR: Python venv not found: $PY" >&2
  exit 1
fi

mkdir -p "$BOT_DIR" "$DROPIN_DIR"
TMP="$(mktemp)"
BACKUP_DIR="$(mktemp -d)"
trap 'rm -f "$TMP"; rm -rf "$BACKUP_DIR"' EXIT

# Preserve current service override so a failed v6 switch can be rolled back.
for f in "$DROPIN_DIR"/v4.conf "$DROPIN_DIR"/v5.conf "$DROPIN_DIR"/v6.conf; do
  [[ -f "$f" ]] && cp -a "$f" "$BACKUP_DIR/"
done

curl -fsSL "$BOT_URL" -o "$TMP"
"$PY" -m py_compile "$TMP"

[[ -f "$BOT_FILE" ]] && cp -f "$BOT_FILE" "${BOT_FILE}.bak"
install -m 0644 "$TMP" "$BOT_FILE"

# Only one ExecStart override must be active.
rm -f "$DROPIN_DIR/v4.conf" "$DROPIN_DIR/v5.conf" "$DROPIN_DIR/v6.conf"
cat > "$DROPIN_DIR/v6.conf" <<CONF
[Service]
ExecStart=
ExecStart=$PY $BOT_FILE
Restart=always
RestartSec=3
CONF

systemctl daemon-reload
systemctl restart "$SERVICE"
sleep 4

if ! systemctl is-active --quiet "$SERVICE"; then
  echo "ERROR: v6 failed to start. Restoring previous service configuration..." >&2
  rm -f "$DROPIN_DIR/v4.conf" "$DROPIN_DIR/v5.conf" "$DROPIN_DIR/v6.conf"
  cp -a "$BACKUP_DIR"/*.conf "$DROPIN_DIR/" 2>/dev/null || true
  systemctl daemon-reload
  systemctl restart "$SERVICE" || true
  journalctl -u "$SERVICE" -n 100 --no-pager >&2 || true
  exit 1
fi

cat > /usr/local/sbin/timchenko-bot-update <<'UPDATER'
#!/usr/bin/env bash
set -euo pipefail
BOT_DIR="/opt/TimchenkoBot"
BOT_FILE="$BOT_DIR/timchenko_bot_v6.py"
BOT_URL="https://raw.githubusercontent.com/Timchenko6/plapforma/main/telegram-bot/timchenko_bot_v6.py"
PY="$BOT_DIR/venv/bin/python"
SERVICE="uzelpro"
TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT

curl -fsSL "$BOT_URL" -o "$TMP"
"$PY" -m py_compile "$TMP"
if [[ -f "$BOT_FILE" ]] && cmp -s "$TMP" "$BOT_FILE"; then
  exit 0
fi
BACKUP="${BOT_FILE}.last-good"
[[ -f "$BOT_FILE" ]] && cp -f "$BOT_FILE" "$BACKUP"
install -m 0644 "$TMP" "$BOT_FILE"
systemctl restart "$SERVICE"
sleep 4
if ! systemctl is-active --quiet "$SERVICE"; then
  logger -t timchenko-bot-update "new bot version failed; rolling back"
  if [[ -f "$BACKUP" ]]; then
    cp -f "$BACKUP" "$BOT_FILE"
    systemctl restart "$SERVICE" || true
  fi
  exit 1
fi
logger -t timchenko-bot-update "bot updated successfully"
UPDATER
chmod 0755 /usr/local/sbin/timchenko-bot-update

cat > /etc/systemd/system/timchenko-bot-update.service <<'UNIT'
[Unit]
Description=Update TimchenkoBot from GitHub
After=network-online.target
Wants=network-online.target

[Service]
Type=oneshot
ExecStart=/usr/local/sbin/timchenko-bot-update
UNIT

cat > /etc/systemd/system/timchenko-bot-update.timer <<'TIMER'
[Unit]
Description=Check TimchenkoBot updates every 2 minutes

[Timer]
OnBootSec=2min
OnUnitActiveSec=2min
RandomizedDelaySec=10
Persistent=true
Unit=timchenko-bot-update.service

[Install]
WantedBy=timers.target
TIMER

systemctl daemon-reload
systemctl enable --now timchenko-bot-update.timer

echo "OK: TimchenkoBot v6 is active. Auto-update is enabled."
systemctl --no-pager --full status "$SERVICE" | sed -n '1,15p'
echo
echo "Auto-update timer:"
systemctl --no-pager --full status timchenko-bot-update.timer | sed -n '1,12p'

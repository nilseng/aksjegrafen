#!/usr/bin/env bash
# One-time setup of the import runner on the Neo4j EC2 box. Idempotent — rerun to update.
#
# Usage (on the box, e.g. via EC2 Connect):
#   git clone https://github.com/<owner>/aksjegrafen.git ~/aksjegrafen   # first time
#   ~/aksjegrafen/infrastructure/import-runner/setup.sh
#
# Afterwards, put credentials in ~/aksjegrafen/server/.env (same variables as on the
# laptop; NEO4J_URL can point at bolt://localhost:7687 since Neo4j runs on this box).
set -euo pipefail

REPO_DIR="$HOME/aksjegrafen"
LOG_DIR="$HOME/aksjegrafen-logs"

if ! command -v node > /dev/null || [[ "$(node --version | cut -c2-3)" -lt 20 ]]; then
  echo "Installing Node 22 (NodeSource)..."
  curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo bash -
  sudo yum install -y nodejs
fi

echo "Updating repo..."
git -C "$REPO_DIR" pull --ff-only

echo "Installing server dependencies and building..."
cd "$REPO_DIR/server"
npm ci --no-audit --no-fund
npx tsc

mkdir -p "$LOG_DIR" "$REPO_DIR/data"

if [[ ! -f "$REPO_DIR/server/.env" ]]; then
  echo "WARNING: $REPO_DIR/server/.env is missing — create it before the jobs can run."
fi

echo "Installing crontab (replaces this user's existing crontab)..."
crontab "$REPO_DIR/infrastructure/import-runner/crontab.txt"
crontab -l

echo
echo "Done. Yearly import (after the May drop):"
echo "  1. aws s3 cp s3://<bucket>/aksjeeiebok__<year>.csv $REPO_DIR/data/   # or scp it"
echo "  2. cd $REPO_DIR/server && npm run import -- <year>"
echo "     (t3.large has 8GB RAM — use --max-old-space-size=6144 if the 8192 default OOMs,"
echo "      or temporarily resize the instance for the import)"

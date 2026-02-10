#!/bin/bash
# Deploy Noite Italiana — build limpo e restart PM2
# Uso: ./deploy.sh  (rodar na raiz do repo, ex.: /var/www/noite-italiana)

set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

echo "[1/5] Parando frontend..."
pm2 stop noite-frontend 2>/dev/null || true

echo "[2/5] Limpando build antigo do Next..."
rm -rf frontend/.next

echo "[3/5] Build do frontend..."
cd frontend && npm ci && npm run build && cd ..

echo "[4/5] Reiniciando apps..."
pm2 restart noite-backend   2>/dev/null || true
pm2 restart noite-frontend  2>/dev/null || pm2 start "npm start" --name noite-frontend --cwd "$ROOT/frontend" -- -p 4000

echo "[5/5] Status..."
pm2 list | grep -E "noite-backend|noite-frontend"

echo ""
echo "Deploy concluído. Logs: pm2 logs noite-frontend --lines 50"

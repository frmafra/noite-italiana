#!/bin/bash
echo "========================================="
echo "🚀 APLICANDO NOVAS FEATURES EM PRODUÇÃO"
echo "========================================="

# 0. Garantir que pasta de backups existe
mkdir -p /var/www/noite-italiana/backups

# 1. Fazer backup do banco antes (segurança)
echo ""
echo "1️⃣ Fazendo backup do banco..."
sudo -u postgres pg_dump noite_italiana > /var/www/noite-italiana/backups/backup-antes-features-$(date +%Y%m%d-%H%M%S).sql
echo "✓ Backup salvo!"

# 2. Verificar se coluna coordenador_id existe
echo ""
echo "2️⃣ Verificando estrutura da tabela projetos:"
sudo -u postgres psql -d noite_italiana -c "\d projetos" | grep coordenador
echo "========================================="

# 3. Reiniciar backend (aceita coordenador_id no POST)
echo ""
echo "3️⃣ Reiniciando backend..."
pm2 restart noite-backend
sleep 3

# 4. Reiniciar frontend (nova interface)
echo ""
echo "4️⃣ Reiniciando frontend..."
pm2 restart noite-frontend
sleep 5

# 5. Ver status
echo ""
echo "5️⃣ Status PM2:"
pm2 list
echo "========================================="

# 6. Ver logs do backend
echo ""
echo "6️⃣ Logs do backend (últimas 20 linhas):"
pm2 logs noite-backend --lines 20 --nostream
echo "========================================="

# 7. Ver logs do frontend
echo ""
echo "7️⃣ Logs do frontend (últimas 20 linhas):"
pm2 logs noite-frontend --lines 20 --nostream
echo "========================================="

# 8. Testar API
echo ""
echo "8️⃣ Testando API de projetos:"
curl -s http://localhost:4001/api/projetos | jq '.' 2>/dev/null || curl -s http://localhost:4001/api/projetos
echo "========================================="

echo ""
echo "✅ DEPLOY CONCLUÍDO!"
echo "Acesse: http://213.199.51.121:4000/config?tab=projetos"
echo "========================================="

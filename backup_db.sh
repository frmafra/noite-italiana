#!/bin/bash
DATE=$(date +%Y-%m-%d_%H-%M)
FILENAME="/var/www/noite-italiana/backups/backup_italiana_$DATE.sql"
sudo -u postgres pg_dump novo_projeto_db > $FILENAME
echo "✅ Backup realizado com sucesso: $FILENAME"

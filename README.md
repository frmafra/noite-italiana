# Noite Italiana — Projeto Beneficente

Sistema de gestão do evento Noite Italiana (landing, convites, portal com login e funil de solicitações).

- **Frontend:** Next.js 14 (porta 4000)
- **Backend:** Node/Express (porta 4001)
- **Banco:** PostgreSQL (`noite_italiana`)

---

## Como subir

### Pré-requisitos

- Node.js 18+
- PostgreSQL
- (Opcional) PM2 para produção

### Desenvolvimento

```bash
# Clone
git clone https://github.com/frmafra/noite-italiana.git
cd noite-italiana

# Backend
cd backend
cp .env.example .env   # ajustar DB_* se precisar
npm install
npm run dev            # porta 4001

# Frontend (outro terminal)
cd frontend
npm install
npm run dev            # porta 4000
```

Variáveis de ambiente no backend: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`. O frontend chama a API via `NEXT_PUBLIC_API_URL` (ex.: `http://localhost:4001`).

### Produção (build + PM2)

```bash
cd noite-italiana

# Backend
cd backend && npm ci && cd ..

# Frontend: build
cd frontend && npm ci && npm run build && cd ..

# Subir com PM2 (ajustar nomes/portas conforme seu ecosystem.config.js ou start manual)
pm2 start backend/src/server.js --name noite-backend -i 1
pm2 start "npm start" --name noite-frontend --cwd frontend -- -p 4000
```

Ou use o script de deploy (se existir):

```bash
./deploy.sh
```

### Migrações do banco

As migrações ficam em `backend/migrations/`. Rodar em ordem (001, 002, … 013) contra o banco `noite_italiana`, por exemplo:

```bash
cd backend
psql -h localhost -U postgres -d noite_italiana -f migrations/012_solicitacoes_convite.sql
psql -h localhost -U postgres -d noite_italiana -f migrations/013_solicitacoes_convite_status.sql
```

(Substituir host/usuário/senha conforme o ambiente.)

---

## Estrutura rápida

| Caminho | Descrição |
|--------|-----------|
| `frontend/src/app/` | Páginas Next (App Router): `/`, `/convite`, `/login`, `/portal`, `/solicitacoes-convite` |
| `backend/src/routes/` | API: `auth`, `solicitacoes-convite`, `membros`, etc. |
| `backend/migrations/` | SQL versionado (013 = funil de status/ responsável/conclusão) |

---

*Porta externa (proxy/reverse): 7600 → front 4000 / api 4001, conforme configuração do servidor.*

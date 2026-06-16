# FIMS — Facility Inspection Management System

Sistema completo de gestão de inspeções de instalações, construído com React, Node.js/Express e PostgreSQL.

---

## Stack Tecnológica

| Camada      | Tecnologia                              |
|-------------|------------------------------------------|
| Frontend    | React 18 + Vite + React Router v6        |
| Backend     | Node.js + Express                        |
| Base Dados  | PostgreSQL 14+                           |
| Auth        | JWT Access Token + Refresh Token (rotação)|
| Segurança   | Helmet, bcryptjs, Rate Limiting, CORS    |
| Estilo      | CSS custom (design system próprio)       |

---

## Estrutura do Projecto

```
fims/
├── backend/
│   ├── src/
│   │   ├── config/          # DB connection (pg Pool)
│   │   ├── controllers/     # auth, users, locations, inspections, templates
│   │   ├── services/        # lógica de negócio
│   │   ├── routes/          # todos os endpoints
│   │   ├── middlewares/     # auth, audit, response, error handling
│   │   └── server.js        # entrada principal Express
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── context/         # AuthContext (JWT state global)
│   │   ├── services/        # axios API client com refresh automático
│   │   ├── components/
│   │   │   ├── common/      # ScoreRing, StatusBadge, Spinner, ProgressBar…
│   │   │   └── layout/      # Sidebar, DashboardLayout
│   │   └── pages/           # Home, Login, Dashboard, Inspections, Users…
│   ├── vite.config.js
│   └── package.json
│
└── database/
    ├── schema.sql           # DDL completo (tabelas, índices, triggers)
    └── seeds.sql            # Dados iniciais (utilizadores, localizações, template)
```

---

## Pré-requisitos

- Node.js 18+
- PostgreSQL 14+ instalado e a correr
- npm 9+

---

## Setup Completo (passo a passo)

### 1. Base de Dados

```bash
# Aceder ao PostgreSQL
psql -U postgres

# Criar base de dados
CREATE DATABASE fims_db;
\q

# Executar schema e seeds
psql -U postgres -d fims_db -f database/schema.sql
psql -U postgres -d fims_db -f database/seeds.sql
```

### 2. Backend

```bash
cd backend

# Copiar e configurar variáveis de ambiente
cp .env.example .env
# Editar .env com as suas credenciais PostgreSQL

# Instalar dependências
npm install

# Iniciar servidor (desenvolvimento)
npm run dev
# → http://localhost:5000
```

### 3. Frontend

```bash
cd frontend

# Copiar env
cp .env.example .env

# Instalar dependências
npm install

# Iniciar app React
npm run dev
# → http://localhost:5173
```

---

## Variáveis de Ambiente

### Backend (`backend/.env`)

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=fims_db
DB_USER=postgres
DB_PASSWORD=SUA_PASSWORD_AQUI

JWT_SECRET=coloque_aqui_string_aleatoria_longa_64_chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=outra_string_aleatoria_diferente_64_chars
JWT_REFRESH_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:5173
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

---

## Credenciais de Acesso (Demo)

> Password universal: **Fims@2024**

| Email                    | Perfil      | Permissões                         |
|--------------------------|-------------|-------------------------------------|
| admin@fims.co.mz         | Admin       | Acesso total                        |
| ceo@fims.co.mz           | CEO         | Dashboard, relatórios, auditoria    |
| supervisor@fims.co.mz    | Supervisor  | Gerir localizações, rever inspeções |
| inspector1@fims.co.mz    | Inspetor    | Criar e preencher inspeções próprias|
| inspector2@fims.co.mz    | Inspetor    | Criar e preencher inspeções próprias|

---

## API — Endpoints Principais

### Autenticação
```
POST   /api/auth/login          Body: { email, password }
POST   /api/auth/register       [Admin] Body: { name, email, password, role }
POST   /api/auth/refresh        Body: { refreshToken }
POST   /api/auth/logout         Body: { refreshToken }
GET    /api/auth/me             → utilizador autenticado
```

### Utilizadores
```
GET    /api/users               [Admin/CEO/Supervisor]
GET    /api/users/:id
PUT    /api/users/:id           [Admin]
DELETE /api/users/:id           [Admin] — soft delete
```

### Localizações
```
GET    /api/locations
GET    /api/locations/:id
POST   /api/locations           [Admin/Supervisor]
PUT    /api/locations/:id       [Admin/Supervisor]
DELETE /api/locations/:id       [Admin]
```

### Inspeções
```
GET    /api/inspections         Query: status, location_id, from, to
GET    /api/inspections/:id
POST   /api/inspections         Body: { location_id, inspector_id, inspection_date }
PATCH  /api/inspections/:id/items    Body: { items: [{ id, score, comment }] }
PATCH  /api/inspections/:id/submit
PATCH  /api/inspections/:id/review  [Admin/CEO/Supervisor]
PATCH  /api/inspections/:id/close   [Admin/CEO/Supervisor]
DELETE /api/inspections/:id         [Admin]
```

### Dashboard & Outros
```
GET    /api/dashboard           [Admin/CEO/Supervisor] — estatísticas gerais
GET    /api/templates           — secções e itens do template
GET    /api/audit-logs          [Admin/CEO] — logs de auditoria paginados
```

---

## Exemplos cURL

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fims.co.mz","password":"Fims@2024"}'

# Listar inspeções (substituir TOKEN)
curl http://localhost:5000/api/inspections \
  -H "Authorization: Bearer TOKEN"

# Criar inspeção
curl -X POST http://localhost:5000/api/inspections \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"location_id":"bbbbbbbb-0000-0000-0000-000000000001","inspection_date":"2024-06-01"}'

# Dashboard
curl http://localhost:5000/api/dashboard \
  -H "Authorization: Bearer TOKEN"
```

---

## Lógica de Negócio

### Workflow de uma Inspeção
```
pending → in_progress → submitted → reviewed → closed
                         ↑ Inspetor   ↑ Supervisor  ↑ Admin/CEO
```

### Cálculo de Score
- Cada item avaliado de **1–5**
- Score (%) = (soma dos scores / (nº itens × 5)) × 100
- Recalculado automaticamente ao guardar itens

### Níveis de Alerta
| Score     | Nível    | Cor      |
|-----------|----------|----------|
| ≥ 75%     | OK       | Verde    |
| 60–74%    | Warning  | Amarelo  |
| < 60%     | Critical | Vermelho |

---

## Segurança

- Passwords com **bcrypt** (custo 12)
- **JWT** access token (15 min) + refresh token rotativo (7 dias)
- **Rate limiting**: 200 req/15min geral, 20 req/15min em auth
- **Helmet** para headers HTTP seguros
- **CORS** configurado com origin whitelist
- **Auditoria** de todas as ações críticas em base de dados
- Validação de dados com **express-validator**
- Respostas padronizadas `{ success, message, data }`

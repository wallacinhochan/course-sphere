# CourseSphere 🎓

Plataforma de gestão de cursos online com autenticação JWT, controle de permissões por criador, paginação, geração de descrições com IA e integração com APIs externas.

---

## 🚀 Deploy

| Serviço | URL |
|---------|-----|
| **Frontend** | https://course-sphere-nine.vercel.app |
| **Backend API** | https://course-sphere-api-47qw.onrender.com |
| **Swagger UI** | https://course-sphere-api-47qw.onrender.com/api-docs |

> ⚠️ O backend está no free tier do Render — pode demorar ~30s para acordar na primeira requisição.

---

## 👤 Usuários de teste

| Email | Senha |
|-------|-------|
| ana@test.com | 123456 |
| bruno@test.com | 123456 |

---

## 🛠️ Stack

**Backend**
- Ruby on Rails 8.1.3 (API mode)
- PostgreSQL 16
- Devise + JWT customizado (token no body)
- RSpec + FactoryBot + Shoulda Matchers
- Swagger via rswag

**Frontend**
- React + Vite
- TailwindCSS
- TanStack Query
- React Hook Form + Zod
- Axios

**Infra**
- Docker + Docker Compose
- GitHub Actions CI/CD
- Render (backend) + Vercel (frontend)

---

## 📦 Pré-requisitos

- Docker e Docker Compose
- Node.js 18+

---

## ⚙️ Como rodar localmente

### 1. Clone o repositório

```bash
git clone https://github.com/wallacinhochan/course-sphere.git
cd course-sphere
```

### 2. Suba o backend com Docker

```bash
docker compose up -d
```

Aguarde ~30 segundos para o banco inicializar, depois:

```bash
docker compose exec api bundle exec rails db:prepare
docker compose exec api bundle exec rails db:seed
```

Backend disponível em: `http://localhost:3000`

### 3. Configure o frontend

```bash
cd frontend
cp .env.example .env
# edite o .env com sua VITE_GROQ_API_KEY
npm install
npm run dev
```

Frontend disponível em: `http://localhost:5173`

---

## 🔐 Autenticação

A API usa **JWT retornado no body** da resposta (não no header Authorization).

**Login:**
```http
POST /api/v1/auth/sign_in
Content-Type: application/json

{
  "user": {
    "email": "ana@test.com",
    "password": "123456"
  }
}
```

**Resposta:**
```json
{
  "token": "eyJhbGci...",
  "user": { "id": 1, "name": "Ana", "email": "ana@test.com" },
  "message": "Login realizado com sucesso"
}
```

**Uso nas requisições:**
```http
Authorization: Bearer eyJhbGci...
```

---

## 📡 Rotas da API

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | /api/v1/auth/register | ❌ | Registro |
| POST | /api/v1/auth/sign_in | ❌ | Login |
| GET | /api/v1/courses | ✅ | Listar cursos (paginado) |
| POST | /api/v1/courses | ✅ | Criar curso |
| GET | /api/v1/courses/:id | ✅ | Detalhe do curso |
| PATCH | /api/v1/courses/:id | ✅ | Editar (apenas criador) |
| DELETE | /api/v1/courses/:id | ✅ | Excluir (apenas criador) |
| POST | /api/v1/courses/:id/lessons | ✅ | Criar aula |
| GET | /api/v1/courses/:id/lessons | ✅ | Listar aulas |
| PATCH | /api/v1/lessons/:id | ✅ | Editar aula |
| DELETE | /api/v1/lessons/:id | ✅ | Excluir aula |

Documentação interativa: https://course-sphere-api-47qw.onrender.com/api-docs

---

## 🌐 APIs Externas

| API | Uso |
|-----|-----|
| [RandomUser API](https://randomuser.me/) | Turma fictícia na tela de detalhes do curso |
| [Groq API](https://groq.com/) (LLaMA 3) | Geração de descrição do curso com IA |

---

## ✅ Funcionalidades

- Registro e login com JWT
- CRUD completo de cursos e aulas
- Permissões por criador (403 para não-criadores)
- Paginação de cursos (6 por página)
- Busca de cursos por nome
- Filtro de aulas por status (draft/published)
- Geração de descrição com IA (Groq/LLaMA 3)
- Turma fictícia com RandomUser API
- Modal de confirmação para exclusões
- Feedback de loading e erro em todos os formulários
- Responsividade mobile
- Swagger UI em produção

---

## 🧪 Testes

```bash
docker compose exec api bundle exec rspec --format documentation
```

Cobertura atual: **34 examples, 0 failures**
- Models: User, Course, Lesson
- Requests: Auth, Courses
- Swagger specs

---

## 🔄 CI/CD

GitHub Actions em `.github/workflows/ci.yml`:
- Roda RSpec a cada push em `develop` e `main`
- PostgreSQL 16 como serviço no pipeline

---

## 📁 Estrutura do projeto

```
course-sphere/
├── .github/workflows/    # GitHub Actions
├── backend/              # Rails 8 API
│   ├── app/
│   │   ├── controllers/api/v1/
│   │   └── models/
│   ├── spec/             # RSpec
│   │   ├── factories/
│   │   ├── models/
│   │   ├── requests/
│   │   └── swagger/
│   ├── swagger/v1/       # swagger.yaml gerado
│   ├── bin/render-start.sh
│   └── Dockerfile
├── frontend/             # React + Vite
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── services/
│   └── vercel.json
└── docker-compose.yml
```

---

## 📝 Decisões técnicas

- **JWT no body**: devise-jwt não parseia JSON em API mode no Rails 8 — solução com SessionsController customizado
- **`params.dig`**: Devise não lê JSON body automaticamente — RegistrationsController sobrescreve `create`
- **WORKDIR `/rails`**: Rails 8 gerou com `/rails` — volume mapeado como `./backend:/rails`
- **Paginação no backend**: `GET /courses` aceita `?page=N` e retorna `{ courses, meta: { total, page, per_page, total_pages } }`
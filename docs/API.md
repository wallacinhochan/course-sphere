# CourseSphere — Documentação da API

Base URL (produção): `https://course-sphere-api-47qw.onrender.com/api/v1`  
Base URL (local): `http://localhost:3000/api/v1`

Documentação interativa (Swagger): https://course-sphere-api-47qw.onrender.com/api-docs

---

## Autenticação

Todas as rotas marcadas com 🔒 exigem o header:

```http
Authorization: Bearer <token>
```

O token é obtido no login ou registro e retornado no **body** da resposta.

---

## Auth

### Registro

```http
POST /auth/register
```

**Body:**
```json
{
  "user": {
    "name": "João Silva",
    "email": "joao@email.com",
    "password": "123456"
  }
}
```

**Resposta 201:**
```json
{
  "user": { "id": 1, "name": "João Silva", "email": "joao@email.com" },
  "token": "eyJhbGci...",
  "message": "Conta criada com sucesso"
}
```

**Resposta 422 (validação):**
```json
{
  "errors": ["Email já está em uso", "Nome não pode ficar em branco"]
}
```

---

### Login

```http
POST /auth/sign_in
```

**Body:**
```json
{
  "user": {
    "email": "joao@email.com",
    "password": "123456"
  }
}
```

**Resposta 200:**
```json
{
  "user": { "id": 1, "name": "João Silva", "email": "joao@email.com" },
  "token": "eyJhbGci...",
  "message": "Login realizado com sucesso"
}
```

**Resposta 401:**
```json
{
  "error": "Email ou senha inválidos"
}
```

---

## Courses

### Listar cursos 🔒

```http
GET /courses?page=1
```

**Query params:**

| Param | Tipo | Padrão | Descrição |
|-------|------|--------|-----------|
| page | integer | 1 | Página atual |

**Resposta 200:**
```json
{
  "courses": [
    {
      "id": 1,
      "name": "React do Zero",
      "description": "Aprenda React do início",
      "start_date": "2026-01-01",
      "end_date": "2026-06-01",
      "lessons_count": 3
    }
  ],
  "meta": {
    "total": 10,
    "page": 1,
    "per_page": 6,
    "total_pages": 2
  }
}
```

---

### Criar curso 🔒

```http
POST /courses
```

**Body:**
```json
{
  "course": {
    "name": "React do Zero",
    "description": "Aprenda React do início",
    "start_date": "2026-01-01",
    "end_date": "2026-06-01"
  }
}
```

**Resposta 201:**
```json
{
  "id": 1,
  "name": "React do Zero",
  "description": "Aprenda React do início",
  "start_date": "2026-01-01",
  "end_date": "2026-06-01"
}
```

**Resposta 422:**
```json
{
  "errors": ["Nome é muito curto (mínimo 3 caracteres)", "Data de término deve ser após a data de início"]
}
```

---

### Detalhe do curso 🔒

```http
GET /courses/:id
```

**Resposta 200:**
```json
{
  "id": 1,
  "name": "React do Zero",
  "description": "Aprenda React do início",
  "start_date": "2026-01-01",
  "end_date": "2026-06-01",
  "creator_id": 1,
  "creator": { "id": 1, "name": "Ana Silva" },
  "lessons": [
    {
      "id": 1,
      "title": "Introdução ao React",
      "status": "published",
      "video_url": "https://youtube.com/..."
    }
  ]
}
```

**Resposta 404:**
```json
{
  "error": "Registro não encontrado"
}
```

---

### Editar curso 🔒 (apenas criador)

```http
PATCH /courses/:id
```

**Body:** (mesmos campos do criar, todos opcionais)

**Resposta 200:** curso atualizado  
**Resposta 403:**
```json
{
  "error": "Não autorizado"
}
```

---

### Excluir curso 🔒 (apenas criador)

```http
DELETE /courses/:id
```

**Resposta 204:** sem body  
**Resposta 403:**
```json
{
  "error": "Não autorizado"
}
```

---

## Lessons

### Criar aula 🔒

```http
POST /courses/:course_id/lessons
```

**Body:**
```json
{
  "lesson": {
    "title": "Introdução ao React",
    "status": "draft",
    "video_url": "https://youtube.com/..."
  }
}
```

**Resposta 201:**
```json
{
  "id": 1,
  "title": "Introdução ao React",
  "status": "draft",
  "video_url": "https://youtube.com/..."
}
```

**Resposta 422:**
```json
{
  "errors": ["Título é muito curto (mínimo 3 caracteres)"]
}
```

---

### Editar aula 🔒

```http
PATCH /lessons/:id
```

**Body:** (mesmos campos do criar, todos opcionais)

**Resposta 200:** aula atualizada

---

### Excluir aula 🔒

```http
DELETE /lessons/:id
```

**Resposta 204:** sem body

---

## Códigos de resposta

| Código | Descrição |
|--------|-----------|
| 200 | OK |
| 201 | Criado |
| 204 | Sem conteúdo |
| 401 | Não autenticado |
| 403 | Não autorizado (sem permissão) |
| 404 | Não encontrado |
| 422 | Dados inválidos |

---

## Validações

**User**
- `name`: obrigatório
- `email`: obrigatório, formato válido, único

**Course**
- `name`: obrigatório, mínimo 3 caracteres
- `start_date`: obrigatório
- `end_date`: obrigatório, deve ser >= start_date

**Lesson**
- `title`: obrigatório, mínimo 3 caracteres
- `status`: `draft` ou `published`
- `video_url`: opcional, deve ser URL válida se informado
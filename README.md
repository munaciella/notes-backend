# Notes App Backend

A Node.js/Express backend for a simple notes-taking application with PostgreSQL, Clerk authentication, and OpenAI–powered summaries.

---

## Features

* **CRUD** operations on notes (`title`, `content`, `summary`, `tags`)
* **User isolation** via Clerk JWTs (or dev stub in local/test)
* **AI-powered** one-paragraph summaries on demand (OpenAI GPT-3.5)
* **PostgreSQL** database (Neon, ElephantSQL, or any connection string)
* **CORS** and JSON parsing
* **Robust error handling**
* **Jest + Supertest** integration tests

---

## 🔧 Prerequisites

* **Node.js** ≥16
* **npm** or **yarn**
* A **PostgreSQL** database URL
* Clerk frontend & backend API keys
* (Optional) OpenAI API key for summaries

---

## ⚙️ Environment Variables

Create a `.env` file in the project root:

```dotenv
# Database connection (Neon, etc.)
DATABASE_URL=<your Postgres connection string>

# Clerk (only backend secret key needed)
CLERK_SECRET_KEY=<sk_…>
CLERK_PUBLISHABLE_KEY=<pk_…>

# Only required if you use AI summaries:
OPENAI_API_KEY=<sk-…>

# Frontend origin for CORS
NEXT_PUBLIC_FRONTEND_URL=https://your-frontend.com

# Node environment
NODE_ENV=development
PORT=4000
```

---

## 🚀 Getting Started

1. **Install dependencies**

   ```bash
   npm install
   # or
   yarn
   ```

2. **Run in development** (with stubbed auth)

   ```bash
   npm run dev
   # or
   yarn dev
   ```

   * Listens on `http://localhost:4000`
   * All `/notes` routes use a fake `userId = 'dev-user'`

3. **Build & start**

   ```bash
   npm run build
   npm start
   # or
   yarn build && yarn start
   ```

---

## 🧪 Testing

We use **Jest** + **ts-jest** + **Supertest**:

1. Ensure `NODE_ENV=test` and `DATABASE_URL` point at a test database.
2. Run:

   ```bash
   npm test
   # or
   yarn test
   ```

All CRUD endpoints are covered:

* `POST   /notes`
* `GET    /notes`
* `GET    /notes/:id`
* `PUT    /notes/:id`
* `DELETE /notes/:id`

---

## 📐 API Reference

All endpoints require an `Authorization: Bearer <token>` header:

### Create a Note

```
POST /notes
Content-Type: application/json
Authorization: Bearer <JWT or dev stub token>

{
  "title": "My first note",
  "content": "Hello **Markdown**!",
  "tags": ["foo","bar"]
}
```

**Response**

* `201 Created`
* JSON note object:

  ```json
  {
    "id": "uuid",
    "user_id": "clerk-user-id",
    "title": "...",
    "content": "...",
    "summary": "...",
    "tags": ["foo","bar"],
    "created_at": "...",
    "updated_at": "..."
  }
  ```

### List Notes

```
GET /notes?tag=foo&q=searchTerm
Authorization: Bearer <token>
```

**Response**

* `200 OK`
* Array of notes for the authenticated user, optionally filtered by tag or full-text search on title/content.

### Get One Note

```
GET /notes/:id
Authorization: Bearer <token>
```

**Response**

* `200 OK` + single note object
* `404 Not Found` if note doesn’t exist or belongs to another user

### Update a Note

```
PUT /notes/:id
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Updated title",
  "content": "Updated content",
  "tags": ["baz"]
}
```

**Response**

* `200 OK` + updated note object
* `404 Not Found` if not found

### Delete a Note

```
DELETE /notes/:id
Authorization: Bearer <token>
```

**Response**

* `204 No Content`
* `404 Not Found` if not found

---

## 📦 Project Structure

```
.
├── src
│   ├── index.ts        # Express app + routing + error handler
│   ├── lib
│   │   ├── db.ts       # pg Pool init/get/close
│   ├── routes
│   │   └── notes.ts    # All /notes handlers
│   └── __tests__       # Jest + Supertest specs
├── jest.config.js
├── tsconfig.json
├── package.json
└── .env
```

---

## 🖋️ Database Schema

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE notes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     TEXT NOT NULL,
  title       TEXT NOT NULL,
  content     TEXT NOT NULL,
  summary     TEXT NOT NULL DEFAULT '',
  tags        TEXT[] NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

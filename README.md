# Finance Backend

A **RESTful backend API** for a finance dashboard system with **role-based access control (RBAC)**, **financial records management**, and **dashboard analytics**.

---

## Tech Stack

| Technology          | Purpose                                            |
| ------------------- | -------------------------------------------------- |
| Node.js + Express 5 | Runtime and web framework                          |
| PostgreSQL          | Relational database                                |
| Prisma ORM          | Database access and migrations                     |
| JWT                 | Stateless authentication (access + refresh tokens) |
| Joi                 | Request validation                                 |
| bcryptjs            | Password hashing                                   |
| Jest + Supertest    | Integration and unit testing                       |

---

## Architecture

The request flow follows a **layered, modular architecture**:

```
Request → Rate Limiter → Route → authenticate → authorize → validate → Controller → Service → Prisma → DB
```

### Layers

* **Routes** — URL mapping and middleware chain (RBAC visible at a glance)
* **Controllers** — Thin layer: parse request, call service, send response
* **Services** — Business logic, testable without HTTP
* **Middleware** — Authentication, RBAC, validation, error handling
* **Modules** — Feature-based structure:

## Setup & Run

### Prerequisites

* Node.js 18+
* PostgreSQL running locally (or remote connection string)

### Installation

```bash
git clone <your-repo-url>
cd dashB
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable           | Description                       |
| ------------------ | --------------------------------- |
| PORT               | Server port (default: 5000)       |
| DATABASE_URL       | PostgreSQL connection string      |
| JWT_ACCESS_SECRET  | Secret for access tokens          |
| JWT_REFRESH_SECRET | Secret for refresh tokens         |
| JWT_ACCESS_EXPIRY  | Access token lifetime (e.g., 15m) |
| JWT_REFRESH_EXPIRY | Refresh token lifetime (e.g., 7d) |

### Database Setup

```bash
npx prisma migrate dev
npx prisma db seed
```

Seeds:

* 3 users (admin, analyst, viewer) — all password: `Admin@123`
* 20 sample financial records

### Run the Server

```bash
npm run dev
```

Server starts at: `http://localhost:5000`

---

## API Endpoints

### Auth

| Method | Endpoint             | Access | Description               |
| ------ | -------------------- | ------ | ------------------------- |
| POST   | /api/v1/auth/login   | Public | Login, returns JWT tokens |
| POST   | /api/v1/auth/refresh | Public | Refresh access token      |

### Users

| Method | Endpoint          | Access        | Description                        |
| ------ | ----------------- | ------------- | ---------------------------------- |
| GET    | /api/v1/users/me  | Authenticated | Own profile                        |
| GET    | /api/v1/users     | Admin         | List users (paginated, filterable) |
| POST   | /api/v1/users     | Admin         | Create user                        |
| GET    | /api/v1/users/:id | Admin         | Get user by ID                     |
| PATCH  | /api/v1/users/:id | Admin         | Update role/status                 |

### Financial Records

| Method | Endpoint            | Access        | Description                           |
| ------ | ------------------- | ------------- | ------------------------------------- |
| GET    | /api/v1/records     | Authenticated | List records (filter, paginate, sort) |
| GET    | /api/v1/records/:id | Authenticated | Get single record                     |
| POST   | /api/v1/records     | Admin         | Create record                         |
| PATCH  | /api/v1/records/:id | Admin         | Update record                         |
| DELETE | /api/v1/records/:id | Admin         | Soft-delete record                    |

**Query parameters for GET /records:**
`type`, `category`, `startDate`, `endDate`, `page`, `limit`, `sortBy`, `order`

### Dashboard

| Method | Endpoint                             | Access         | Description                   |
| ------ | ------------------------------------ | -------------- | ----------------------------- |
| GET    | /api/v1/dashboard/summary            | Authenticated  | Income, expenses, net balance |
| GET    | /api/v1/dashboard/recent             | Authenticated  | Last N records                |
| GET    | /api/v1/dashboard/category-breakdown | Analyst, Admin | Category-wise totals          |
| GET    | /api/v1/dashboard/trends             | Analyst, Admin | Monthly income/expense trends |

---

## Role-Based Access Control (RBAC)

| Role    | View Data | View Analytics        | Manage Records | Manage Users |
| ------- | --------- | --------------------- | -------------- | ------------ |
| Viewer  | ✅         | Summary + Recent only | ❌              | ❌            |
| Analyst | ✅         | ✅ Full analytics      | ❌              | ❌            |
| Admin   | ✅         | ✅ Full analytics      | ✅              | ✅            |

---

## Design Decisions & Tradeoffs

* **Money as integers** — Amounts stored in paise/cents to avoid floating-point precision issues (e.g., ₹500.50 = 50050).
* **Soft delete** — Records are never truly deleted (`is_deleted` flag) for audit trails.
* **Module-based structure** — Grouped by feature, not by layer, for better cohesion.
* **Stateless JWT auth** — Scales horizontally; no server-side session needed.
* **Prisma ORM** — Type-safe schema, auto-generated migrations, clean queries.
* **Middleware-based RBAC** — Route-level rules, visible and auditable.

---

## Testing

```bash
npm test
```

Tests cover:

* Auth (login, refresh, invalid credentials, validation)
* RBAC (role enforcement)
* Records (CRUD, filtering, pagination, soft delete)
* Dashboard (summary, trends, categories, recent)

---

## Assumptions

* Single-tenant system (one organization)
* No email service
* Admin is seeded; users created by admins only
* Monetary values stored in smallest currency unit (paise)
* Categories are free-text, not a fixed list

---


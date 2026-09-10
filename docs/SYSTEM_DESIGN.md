# Anonimy — System Design

## 1. System Overview

Anonimy follows a client-server architecture.

```text
User
  |
  v
React + Vite + TypeScript
  |
  | REST / HTTP
  v
Express + TypeScript
  |
  +---- Better Auth
  |
  +---- Application Logic
  |
  +---- Validation
  |
  v
Prisma ORM
  |
  v
PostgreSQL
```

The frontend is responsible for presentation and user interaction. The Express server owns business logic, authorization, validation, and database access.

## 2. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + TypeScript |
| Styling | Tailwind CSS |
| Backend | Node.js + Express + TypeScript |
| API | REST |
| Authentication | Better Auth |
| ORM | Prisma |
| Database | PostgreSQL |
| Validation | Zod |
| Version Control | Git / GitHub |

## 3. Frontend Architecture

The frontend is organized around route-level pages and reusable components.

```text
client/src/
├── components/
├── pages/
├── hooks/
├── services/
├── types/
├── lib/
├── assets/
├── App.tsx
└── main.tsx
```

### Main Routes

```text
/                  Landing
/login             Login
/signup            Signup
/feed              Global Feed
/post/:postId      Post Detail
/profile            Profile
```

The frontend currently uses mock data where backend functionality has not yet been implemented.

## 4. Backend Architecture

The backend follows modular separation:

```text
Request
  |
  v
Routes
  |
  v
Validation / Middleware
  |
  v
Business Logic / Services
  |
  v
Prisma Data Access
  |
  v
PostgreSQL
```

Authentication is handled separately through Better Auth, while authorization is enforced before protected data is accessed.

## 5. Core Data Model

The central relationships are:

```text
User
 |
 +----< Post
 |
 +----< PostParticipant / Contextual Alias
 |
 +----< Comment / Response

Post
 |
 +----< PostParticipant
 |
 +----< Comment
```

A user's real account identity is stored separately from the alias displayed publicly.

### Alias Rule

Contextual aliases are scoped to a post:

```text
Same alias in different posts       → Allowed
Same alias for two participants
inside one post                     → Not allowed
Real identity exposed publicly      → Not allowed
```

The database should enforce the relevant uniqueness constraints rather than relying only on frontend logic.

## 6. Authentication Flow

```text
User
  |
  v
Login / Signup
  |
  v
Better Auth
  |
  v
Authenticated Session
  |
  v
Protected Express Request
  |
  v
Authorization
  |
  v
Application Data
```

Authentication establishes identity; authorization determines what the authenticated user is allowed to access.

## 7. Create Post Flow

```text
User writes post
      |
      v
Frontend validation
      |
      v
POST request
      |
      v
Express
      |
      v
Authentication + Authorization
      |
      v
Validation
      |
      v
Prisma
      |
      v
PostgreSQL
```

The server remains responsible for final validation and data integrity.

## 8. Feed Flow

```text
React Feed
   |
   v
GET /posts
   |
   v
Express
   |
   v
Prisma
   |
   v
PostgreSQL
   |
   v
Paginated posts
   |
   v
Global Feed UI
```

Feed retrieval should be bounded and indexed to avoid unbounded database queries.

## 9. Post Detail Flow

```text
User selects post
      |
      v
/post/:postId
      |
      v
GET post + responses
      |
      v
Authorization / validation
      |
      v
Prisma
      |
      v
PostgreSQL
      |
      v
Post Detail UI
```

The post detail view provides the contextual space in which aliases and responses are interpreted.

## 10. Security Design

Key security boundaries include:

- Better Auth for authentication/session management.
- Server-side authorization.
- Zod/input validation.
- Prisma for controlled database access.
- Secrets stored in environment variables.
- No passwords or private credentials exposed to the client.
- Protection against XSS and unsafe user-generated content.
- Rate limiting for sensitive/expensive endpoints.
- Pagination and bounded queries.
- Public responses must not reveal the underlying account identity.

## 11. Assessment Implementation Strategy

For the current assessment, implementation is staged:

```text
Requirement Analysis
        ↓
System Design
        ↓
Frontend Development
        ↓
Assessment Demo
        ↓
Backend + Database Integration
        ↓
Testing
        ↓
Deployment
```

The immediate implementation priority is the frontend, while the backend architecture is documented now so that later integration does not require redesigning the application.

## 12. Deployment Design

Planned deployment:

```text
Browser
  |
  v
Frontend Hosting
  |
  | HTTPS / REST
  v
Express Backend
  |
  v
PostgreSQL
```

Environment variables are used for database credentials, authentication secrets, and other sensitive configuration.

## 13. Design Principles

- Privacy by design.
- Server-side authorization.
- Contextual rather than globally persistent public identity.
- Clear separation of concerns.
- Simple modular architecture.
- Incremental implementation.
- Pagination and database indexing for scalability.
- No premature microservices or unnecessary infrastructure.

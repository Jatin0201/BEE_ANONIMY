# Anonimy --- Technology Stack

## 1. Final MVP Stack

  -----------------------------------------------------------------------
  Layer                   Technology              Purpose
  ----------------------- ----------------------- -----------------------
  Language                TypeScript              Type safety across
                                                  frontend and backend

  Frontend                React + Vite            Client-side application
                                                  and UI

  Styling                 Tailwind CSS            Responsive styling and
                                                  design implementation

  Backend                 Node.js + Express       REST API and
                                                  server-side business
                                                  logic

  Authentication          Better Auth             Account and session
                                                  management

  Validation              Zod                     Runtime input
                                                  validation

  ORM                     Prisma                  Type-safe PostgreSQL
                                                  access and migrations

  Database                PostgreSQL              Relational persistent
                                                  storage

  Testing                 Vitest + Playwright     Unit/integration and
                                                  end-to-end testing

  Version Control         Git + GitHub            Source control and
                                                  collaboration

  Deployment              Vercel + managed        MVP deployment
                          backend/database        
                          hosting                 
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 2. Frontend

### React + Vite

React is responsible for: - page rendering - reusable components -
client-side interaction - form handling - feed/post/comment UI -
authenticated application views

Vite is used for: - development server - frontend build - fast
development workflow

Do not introduce Next.js. The approved stack is React + Vite + Express.

### Tailwind CSS

Tailwind is the primary styling system.

Use it for: - layout - responsive behavior - spacing - typography -
colors - borders - states

Avoid creating large amounts of unrelated global CSS.

------------------------------------------------------------------------

## 3. Backend

### Node.js + Express

Express provides the backend API and server-side application boundary.

Responsibilities: - authentication integration - request validation -
authorization - post operations - comment operations - alias
generation/resolution - database access through Prisma - error handling

The frontend must communicate with the backend through defined API
contracts.

------------------------------------------------------------------------

## 4. Authentication

### Better Auth

Better Auth is responsible for: - registration - login - logout -
session management - secure password handling

The application must still enforce authorization on the Express server.

Never trust frontend authentication state as a security boundary.

------------------------------------------------------------------------

## 5. Validation

### Zod

All externally supplied data should be validated on the server.

Examples: - registration data - login data - post content - comment
content - route parameters where appropriate

Validation schemas should be reusable and kept close to the relevant
domain module.

------------------------------------------------------------------------

## 6. Database

### PostgreSQL

PostgreSQL is the primary persistent database.

It is appropriate because Anonimy depends on: - users - posts -
comments - contextual post participants - aliases -
authentication/session data

PostgreSQL provides: - foreign keys - transactions - unique
constraints - indexes - reliable relational integrity

### Prisma

Prisma provides: - schema definition - type-safe queries - migrations -
database client - TypeScript integration

Business logic should not bypass Prisma for normal database operations.

------------------------------------------------------------------------

## 7. Testing

### Vitest

Use for: - utility functions - alias-generation logic - validation -
domain services

### Playwright

Use for important end-to-end flows: - signup - login - create post -
open post - comment - contextual alias behavior

------------------------------------------------------------------------

## 8. Frontend State

Do not add Redux by default.

Prefer: - React state for local UI state - API/service functions for
server communication - lightweight client-side state only where
necessary

Add a dedicated server-state library only if the implementation
demonstrates a real need.

------------------------------------------------------------------------

## 9. Animation

No animation framework is required for the current MVP.

The approved UI should initially be implemented as a **static visual
reproduction** of the reference.

Do not add Framer Motion or another animation framework unless animation
is explicitly approved later.

------------------------------------------------------------------------

## 10. Security Baseline

Implement: - server-side validation - server-side authorization - secure
authentication/session handling through Better Auth - parameterized/ORM
database access - XSS-safe rendering - appropriate CSRF protection for
the chosen auth/API setup - rate limiting where appropriate - secure
environment variables - no secrets in client code

Never commit secrets or `.env` files containing credentials.

------------------------------------------------------------------------

## 11. Engineering Principle

Prefer the simplest architecture that correctly implements the
requirements.

Do not add: - microservices - Redis - Elasticsearch - queues - complex
state management - unnecessary dependencies

unless a documented requirement justifies them.

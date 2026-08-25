# Anonimy --- System Design & Architecture

## 1. Architecture Goal

Anonimy uses a simple layered full-stack architecture that is easy to
understand, demonstrate, test, and extend.

The MVP intentionally avoids microservices and unnecessary
infrastructure.

------------------------------------------------------------------------

## 2. High-Level Architecture

``` text
+-----------------------------+
|          Browser            |
|       React + Vite          |
+--------------+--------------+
               |
               | HTTP / REST
               v
+-----------------------------+
|       Express Server        |
|                             |
|  Auth / Posts / Comments    |
|  Aliases / Validation       |
+--------------+--------------+
               |
               v
+-----------------------------+
|           Prisma            |
|       ORM / Data Access     |
+--------------+--------------+
               |
               v
+-----------------------------+
|         PostgreSQL          |
|       Persistent Data       |
+-----------------------------+
```

Better Auth integrates with the authentication boundary and session
handling.

------------------------------------------------------------------------

## 3. Frontend Layer

Responsibilities: - render pages - collect user input - call backend
APIs - display feed/post/comment data - manage local UI state - handle
loading, empty and error states - provide responsive layouts

The frontend must not: - determine authorization - choose the
authoritative user identity - choose the authoritative alias - expose
internal identity mappings

Client-side checks are for UX only, not security.

------------------------------------------------------------------------

## 4. Backend/API Layer

Express is responsible for: - receiving requests - authenticating
sessions - authorizing operations - validating input - executing
business rules - calling domain services - accessing PostgreSQL through
Prisma - returning sanitized responses

Suggested API surface:

``` text
Authentication:
    Better Auth endpoints/integration

Posts:
    GET    /api/posts
    POST   /api/posts
    GET    /api/posts/:id
    DELETE /api/posts/:id        # if included in MVP

Comments:
    GET    /api/posts/:id/comments
    POST   /api/posts/:id/comments
```

The exact Better Auth route structure should follow the selected Better
Auth integration rather than duplicating authentication logic manually.

------------------------------------------------------------------------

## 5. Domain Modules

Recommended backend organization:

``` text
server/
└── src/
    ├── auth/
    ├── posts/
    ├── comments/
    ├── aliases/
    ├── middleware/
    ├── lib/
    └── server.ts
```

The alias system must be isolated as a domain responsibility.

------------------------------------------------------------------------

## 6. Alias Resolution

### Creating a Post

``` text
Authenticated Request
        |
        v
Validate Post Content
        |
        v
Create Post
        |
        v
Create PostParticipant
        |
        v
Generate Alias
        |
        v
Return Sanitized Post
```

### Commenting

``` text
Authenticated Request
        |
        v
Validate Comment
        |
        v
Verify Post
        |
        v
Find PostParticipant(userId, postId)
        |
     +--+--+
     |     |
   found  absent
     |     |
   reuse  generate
     |     |
     +--+--+
        |
        v
Create Comment
        |
        v
Return Sanitized Comment
```

------------------------------------------------------------------------

## 7. Critical Anonymity Guarantees

The database and server must enforce:

``` text
UNIQUE(postId, userId)
UNIQUE(postId, alias)
```

Therefore:

-   one user has one alias within a post
-   two users cannot share an alias inside one post
-   aliases can repeat between different posts

The public response should contain:

``` json
{
  "id": "post-id",
  "content": "I finally got my internship.",
  "alias": "Silent Fox",
  "createdAt": "..."
}
```

It should not contain:

``` json
{
  "authorId": "user-17"
}
```

unless the endpoint is explicitly an authorized private/admin endpoint.

------------------------------------------------------------------------

## 8. Authentication and Authorization

The authenticated session determines the current user.

The server must never trust: - client-provided user IDs -
client-provided author IDs - client-provided aliases - client-side
authorization state

Example:

``` text
Browser
   |
   | authenticated request
   v
Express
   |
   | identify session/user
   v
Authorization
   |
   v
Domain Service
   |
   v
Prisma
```

------------------------------------------------------------------------

## 9. Data Flow --- Global Feed

``` text
React Feed
    |
    | GET /api/posts
    v
Express
    |
    v
Post Service
    |
    v
Prisma
    |
    v
PostgreSQL
    |
    v
Sanitized Post DTOs
    |
    v
React Feed
```

The response is content-first and exposes contextual aliases rather than
permanent public identities.

------------------------------------------------------------------------

## 10. Data Flow --- Create Post

``` text
Post Composer
      |
      | POST /api/posts
      v
Express
      |
      +--> Validate content
      |
      +--> Authenticate user
      |
      +--> Create Post
      |
      +--> Generate PostParticipant alias
      |
      v
PostgreSQL
      |
      v
Sanitized response
      |
      v
Feed
```

------------------------------------------------------------------------

## 11. Security Boundary

Security responsibilities are separated:

``` text
Better Auth
    -> authentication/session

Express
    -> authorization + business rules

Zod
    -> input validation

Prisma
    -> safe database access

PostgreSQL
    -> relational integrity + uniqueness
```

No single client-side component should be responsible for enforcing
these guarantees.

------------------------------------------------------------------------

## 12. Scaling Direction

Do not implement distributed infrastructure for the MVP.

Start with: - efficient PostgreSQL queries - indexes - pagination when
required - clean service boundaries - validation - proper authorization

Future scaling options, only when justified: - Redis - background jobs -
object storage - PostgreSQL read replicas - dedicated search - service
extraction

------------------------------------------------------------------------

## 13. Deployment Concept

The target deployment can separate:

``` text
React + Vite frontend
        |
        v
Frontend hosting

Express backend
        |
        v
Backend hosting

PostgreSQL
        |
        v
Managed PostgreSQL
```

All secrets must be provided through environment variables.

Never commit: - database credentials - auth secrets - API keys -
passwords

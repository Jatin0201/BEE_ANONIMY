# Anonimy — Requirement Analysis

## 1. Project Overview

**Anonimy** is a global anonymous social platform where users can share confessions, advice, experiences, opinions, questions, or everyday thoughts without exposing their real identity.

The platform uses **contextual anonymity**: a user's public alias can differ between posts, while participants within the same post remain distinguishable.

## 2. Problem Statement

Traditional social platforms associate posts with persistent identities, which can discourage users from sharing personal or sensitive thoughts. Completely anonymous platforms can, however, reduce accountability and make conversations difficult to follow.

Anonimy addresses this by separating the user's real account identity from their contextual public identity.

## 3. Objectives

- Provide a safe and approachable space for anonymous expression.
- Allow users to publish different types of content through a global feed.
- Maintain contextual anonymity without exposing account identity.
- Allow meaningful interaction through post responses/comments.
- Provide secure authentication while keeping public identity anonymous.
- Maintain a scalable foundation for future moderation and safety features.

## 4. Target Users

- General social-media users.
- Students and young adults.
- Users seeking advice or sharing personal experiences.
- Users who prefer expressing thoughts without attaching their real identity.

## 5. Functional Requirements

### FR-01 — Account Registration
Users shall be able to create an account using the supported authentication mechanism.

### FR-02 — User Login
Registered users shall be able to securely log in and maintain an authenticated session.

### FR-03 — Global Feed
The system shall display a global feed containing posts from users across the platform.

### FR-04 — Create Post
Authenticated users shall be able to create posts containing arbitrary user-generated content.

### FR-05 — Contextual Alias
The system shall assign/display an anonymous alias for a user's participation in a post.

### FR-06 — Alias Isolation
The same alias may appear in different posts, but two different participants in the same post shall not have the same alias.

### FR-07 — Post Detail
Users shall be able to open a post and view its full content and associated responses/comments.

### FR-08 — Interaction
Users shall be able to interact with posts and participate in the supported response/comment flow.

### FR-09 — Profile
Users shall have access to a profile view representing their activity without exposing their real identity to other users.

### FR-10 — Navigation
Users shall be able to navigate between the landing, authentication, feed, post-detail, and profile experiences.

## 6. Non-Functional Requirements

### Security & Privacy
- Real account identity must not be exposed through public post data.
- Authentication and authorization shall be enforced on the server.
- Passwords and secrets shall never be stored or exposed insecurely.
- User input shall be validated and sanitized appropriately.
- Database access shall use Prisma rather than raw, unsafe queries where applicable.
- Sensitive data shall not be unnecessarily returned to the client.

### Performance
- Feed and post-detail queries should be paginated/bounded.
- Database queries should use appropriate indexes.
- The system should avoid unnecessary API calls and frontend re-renders.

### Usability
- The interface should be simple, readable, calm, and approachable.
- Desktop is the initial priority.
- The UI should not resemble a generic AI/SaaS template.

### Maintainability
- Frontend, backend, authentication, and data-access responsibilities should remain separated.
- Code should use reusable components and clear module boundaries.

## 7. Core Use Cases

| Actor | Use Case |
|---|---|
| Visitor | View landing page |
| Visitor | Register / log in |
| Authenticated User | Browse global feed |
| Authenticated User | Create anonymous post |
| Authenticated User | View post details |
| Authenticated User | Respond/comment |
| Authenticated User | View profile |
| System | Generate/manage contextual aliases |
| System | Protect account identity and authorization boundaries |

## 8. Scope

### Current MVP / Assessment Focus
- Landing page
- Login
- Signup
- Global feed
- Post detail
- Profile
- Core navigation and polished desktop UI
- Mock data where backend functionality is not yet connected

### Planned Backend
- Better Auth
- Express REST API
- Prisma ORM
- PostgreSQL
- Persistent posts, users, aliases, and interactions

## 9. Constraints

- React + Vite is the frontend foundation.
- Express is the backend framework.
- PostgreSQL is the persistent database.
- Prisma is the ORM.
- Better Auth is the authentication solution.
- Desktop UI is the immediate assessment priority.
- Landing-page animation is deferred.

## 10. Future Scope

Potential future capabilities include stronger moderation, reporting, rate limiting, content safety systems, notifications, richer interactions, analytics, and scalability improvements.

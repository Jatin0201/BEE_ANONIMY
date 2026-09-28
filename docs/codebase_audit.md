# Anonimy — Codebase Audit

> Analysed on: 2026-09-25  
> Scope: Full codebase scan across `client/`, `server/`, `docs/`, `prisma/`

---

## ✅ Completed Tasks

### 🏗️ Project Infrastructure
- [x] Monorepo structure established (`client/` + `server/` + `docs/`)
- [x] Vite + React + TypeScript setup for the client
- [x] Express + TypeScript setup for the server
- [x] Prisma ORM configured with PostgreSQL (Prisma 7 with pg adapter)
- [x] CORS properly configured with credential support
- [x] Environment variable validation at boot time (throws on missing vars)
- [x] ESLint configured on the client
- [x] `.gitignore` files at root and within each workspace

### 🔐 Authentication (Better Auth)
- [x] Better Auth integrated via `better-auth` library
- [x] Email + Password authentication enabled (`emailAndPassword.enabled: true`)
- [x] Email verification required on sign-up (`requireEmailVerification: true`)
- [x] **Email OTP plugin** integrated for sign-up verification flow
- [x] **Google OAuth** social provider configured (client ID / secret from env)
- [x] Session management: 7-day expiry, 1-day update age, cookie cache
- [x] Secure cookies gated by `NODE_ENV === "production"`
- [x] Prisma adapter wired to Better Auth
- [x] `requireAuth` middleware implemented (validates session server-side)
- [x] Auth middleware exports typed `AuthenticatedRequest` interface
- [x] Protected test route `/api/test/protected` to verify session

### 🔒 Forgot Password / Password Reset (Custom OTP Flow)
- [x] 3-step OTP-based password reset: `forgot-password` → `verify-otp` → `reset-password`
- [x] Cryptographically secure 6-digit OTP generation (`crypto.randomInt`)
- [x] SHA-256 hashing of OTP before DB storage (never stored plain-text)
- [x] Short-lived reset token issued after OTP verification (15-minute TTL)
- [x] OTP TTL: 10 minutes
- [x] Email enumeration prevention (always returns same success message)
- [x] Existing OTP invalidated before issuing a new one
- [x] OTP consumed immediately after successful verification
- [x] All sessions invalidated on password reset (force re-login)
- [x] Uses `@better-auth/utils/password` to hash new passwords (same algo as sign-up)
- [x] Zod schema validation on all 3 reset endpoints

### 📝 Backend — Posts API
- [x] `POST /api/posts` — create a post (auth required via `requireAuth`)
- [x] `GET /api/posts` — list all posts (paginated, reverse-chronological, search support)
- [x] `GET /api/posts/:id` — fetch a single post by UUID
- [x] Server-side validation for post content (1–2000 characters, trimmed, non-empty) via Zod
- [x] Post model in Prisma schema (`Post` table with `authorId` FK, `content`, timestamps)
- [x] Post response sanitization — `authorId` and `userId` are strictly stripped from all public responses
- [x] Atomic creation & author alias assignment inside `prisma.$transaction`
- [x] End-to-end automated test suite (`test_posts.mjs`) with 30/30 passing assertions

### 🎭 Backend — Alias System
- [x] `PostParticipant` model in Prisma schema (`postId`, `userId`, `alias`, unique constraint on `[postId, userId]` and `[postId, alias]`)
- [x] Alias generation service (`alias.service.ts`): auto-assigns an alias when a user first participates in a post
- [x] Curated nature/botanical base alias pool (`Silent Fox`, `Blue Raven`, `Quiet Oak`, etc.)
- [x] Dynamic combination generator: pairs nature descriptors (`Silent`, `Blue`, `Quiet`, `Cedar`, `Wild`) with nouns (`Lynx`, `Oak`, `Raven`, `Willow`, `Meadow`) when base aliases are exhausted
- [x] Alias reuse: preserves the same alias for a user across multiple interactions within that post
- [x] Alias collision prevention: guarantees distinct users in the same post have distinct aliases
- [x] Server-authoritative: client cannot choose or dictate aliases

### 📧 Email System
- [x] Nodemailer transporter configured (Mailtrap host OR Gmail fallback)
- [x] Branded HTML OTP email template (Anonimy styles, monospace OTP display)
- [x] Plain-text fallback in email
- [x] `sendOtpEmail` utility used for sign-up verification, sign-in OTP, and password reset

### 🛡️ Email Validation & Security
- [x] Zod-based email syntax validation
- [x] TLD length check
- [x] Disposable/burner email domain rejection using `disposable-email-domains` package
- [x] Extended supplementary blocklist (40+ known temp-mail providers)
- [x] Subdomain checking (e.g., `test.mailinator.com` → blocked)
- [x] Email normalisation (lowercase + trim) applied at registration and all reset endpoints
- [x] Client-side email validator (`client/src/lib/email-validator.ts`) mirrors server logic

### 🚦 Rate Limiting
- [x] `authLimiter`: 30 req / 15 min on all Better Auth routes (`/api/auth/*`)
- [x] `passwordResetLimiter`: 5 req / 15 min on forgot-password
- [x] `otpVerifyLimiter`: 10 req / 15 min on OTP verification
- [x] `passwordSubmitLimiter`: 5 req / 15 min on password reset submission
- [x] Standard headers returned, legacy headers disabled

### 🗄️ Database / Prisma Schema
- [x] `User` model with UUID PK, email uniqueness, `emailVerified` flag
- [x] `Session` model with cascade delete on user removal
- [x] `Account` model (supports multiple auth providers per user)
- [x] `Verification` model (reused for OTP storage and reset tokens)
- [x] `Post` model with UUID PK, content text, `authorId` FK, indexes on `createdAt` and `authorId`
- [x] `PostParticipant` model with composite unique keys on `[postId, userId]` and `[postId, alias]`
- [x] `Comment` model with parent-reply relation hierarchy
- [x] All models mapped to snake_case table names (`@@map`)
- [x] Synchronized schema with PostgreSQL database

### 🖥️ Frontend Routing (React Router v6)
- [x] All 6 MVP routes defined: `/`, `/login`, `/signup`, `/forgot-password`, `/feed`, `/post/:postId`, `/profile`, `/settings`
- [x] Protected route guards: unauthenticated users redirected to `/login`
- [x] Auth route guards: authenticated users redirected to `/feed`
- [x] Initial session-loading splash screen (prevents flash of wrong page)
- [x] Fallback `*` route redirects to `/`

### 🔑 Auth Client
- [x] `better-auth/react` client configured with `emailOTPClient` plugin
- [x] `useSession`, `signIn`, `signUp`, `signOut` exported
- [x] `sessionOptions.refetchOnWindowFocus: false` set to prevent aggressive refetch

### 🌐 Pages (UI — Mock/Prototype State)
- [x] **LandingPage** — exists and renders
- [x] **LoginPage** — exists with email + password form
- [x] **SignupPage** — exists with email + password form
- [x] **ForgotPasswordPage** — full 3-step OTP UI (request → verify → reset)
- [x] **FeedPage** — full UI with sidebar, composer, search, tab sorting (Latest/Top), post cards, bookmark toggle, 3-dot menu, toast notifications
- [x] **PostDetailPage** — full UI with comment threading, reply system, alias locking per thread, heart reactions, alias shuffle
- [x] **ProfilePage** — account info display, privacy section, security section, logout button
- [x] **SettingsPage** — exists (large file, extensive UI)

### 🎨 Frontend UI System
- [x] Custom Alias SVG Avatars (Fox, Raven, Oak, Wolf, Fern/Birch, Sun/Amber, fallback)
- [x] Toast notification system with auto-dismiss
- [x] Sticky search bar on feed
- [x] Post composer with alias preview, alias shuffle (reroll), disabled image upload placeholder
- [x] Latest / Top tab sorting
- [x] Empty state and search no-results state
- [x] Instagram-style threaded comment UI with collapse/expand
- [x] "Commenting as" alias indicator with lock state
- [x] Replying-to context banner
- [x] Copy post link action
- [x] Report post action (UI stub)

### 📦 State Management
- [x] `usePostsStore` custom hook — localStorage-backed, in-memory fallback
- [x] Thread alias locking (per user per post) persisted to `localStorage`
- [x] Comment count dynamically computed from stored comments
- [x] Store listeners pattern for real-time UI updates across components
- [x] Mock seed data (`mockData.ts`) with curated aliases list

### 📐 Type Definitions
- [x] `Alias`, `Post`, `Comment`, `CurrentUser` interfaces defined in `client/src/types/index.ts`
- [x] `AuthenticatedUser`, `AuthenticatedSession`, `AuthenticatedRequest` types in middleware
- [x] Public-facing types reflect sanitized server shapes (no `authorId` leakage)

### 📚 Documentation
- [x] `MVP_SCOPE.md` — P0 / P1 / P2 task classification
- [x] `PROJECT_CONTEXT.md`
- [x] `DATABASE_DESIGN.md`
- [x] `SYSTEM_ARCHITECTURE.md`
- [x] `SYSTEM_DESIGN.md`
- [x] `TECH_STACK.md`
- [x] `DEVELOPMENT_RULES.md`
- [x] `REQUIREMENT_ANALYSIS.md`
- [x] `AUTHENTICATION_BACKEND_GUIDE.md`
- [x] `auth_review.md` and `email_validation_security_analysis.md` (review artifacts)
- [x] `posts_api_implementation_plan.md`

### 💬 Backend — Comments API
- [x] `POST /api/posts/:id/comments` — add a comment or reply (auth required via `requireAuth`)
- [x] `GET /api/posts/:id/comments` — fetch all comments for a post in chronological order (`createdAt: asc`)
- [x] Support nested comment hierarchy / replies (`parentId`, `replyToAlias`)
- [x] Comment response sanitization — `authorId` and `userId` are strictly stripped from all public responses
- [x] Atomic alias resolution & contextual alias assignment/reuse via `PostParticipant` and `getOrAssignAlias`
- [x] Validation: post existence, parent comment post match, content 1–2000 characters
- [x] Post `commentCount` synchronization across single post fetch and feed listing
- [x] End-to-end automated test suite (`test_comments.mjs`) with 40/40 passing assertions

### 🔄 Frontend → Backend Integration
- [x] Replaced `usePostsStore` (localStorage/mock) with real typed `api` client (`lib/api.ts`)
- [x] Feed fetches from `GET /api/posts` with dynamic sorting (Latest/Top) and debounced search
- [x] Post creation sends `POST /api/posts` with server-authoritative alias assignment
- [x] Post detail fetches single post from `GET /api/posts/:id`
- [x] Comment list fetches from `GET /api/posts/:id/comments` in chronological order
- [x] Comment & reply submission calls `POST /api/posts/:id/comments` with parent hierarchy
- [x] Aliases displayed across all cards and comments are 100% server-authoritative
- [x] Loading skeleton placeholders implemented on FeedPage and PostDetailPage
- [x] Inline error handling with retry mechanisms on FeedPage and PostDetailPage
- [x] Shared `AliasAvatar` component extracted to eliminate avatar duplication

### 👤 Post Ownership, "Your Posts" Hub & Author Tags
- [x] `GET /api/posts/me` — fetch all posts authored by the logged-in user
- [x] `DELETE /api/posts/:id` — delete a post with owner authorization check (403 for non-owner) and DB cascade deletion
- [x] Contextual `isAuthor: boolean` flag included in post responses without leaking any internal `authorId` or `userId`
- [x] Visual `(You)` badge rendered next to author alias on Feed post cards and Post Detail view
- [x] Dedicated **"Your Posts"** hub on `ProfilePage.tsx` with tabs (Your Posts / Account & Privacy)
- [x] Post deletion action with confirmation dialog directly accessible from Feed, Post Detail, and Profile "Your Posts" list
- [x] Direct navigation from "Your Posts" into threads and replies (`/post/:id`)
- [x] End-to-end automated test suite (`test_posts.mjs`) expanded with 38/38 passing assertions covering `/me`, `isAuthor`, and owner deletion

---

## 🔴 HIGH PRIORITY — Remaining / In Progress

> These are blockers for the MVP "Definition of Done" from `MVP_SCOPE.md`.

### 1. Frontend Auth Flow Integration
- [ ] **LoginPage** — wire up `signIn()` from `auth-client.ts` (currently UI-only)
- [ ] **SignupPage** — wire up `signUp()` from `auth-client.ts` (currently UI-only)
- [ ] Form validation using the shared `email-validator.ts` on the client
- [ ] Redirect to `/feed` on successful login/signup
- [ ] Display server-returned error messages (wrong password, account not found, etc.)
- [ ] Email OTP verification step: after signup, prompt user for the OTP sent to their email (Better Auth `emailOTP` plugin requires this)

---

## 🟡 MEDIUM PRIORITY — Post-Core, Pre-Launch Polish

### UI / UX
- [x] Empty state when there are truly zero posts from the server (Feed & Profile)
- [ ] Sidebar navigation component extracted (currently duplicated across Feed, Profile, Settings pages)
- [ ] Active nav state should be driven by the current route

### Auth UX
- [ ] Loading/submitting state on login and signup buttons (prevent double-submit)
- [ ] "Forgot Password" link on the LoginPage properly links to `/forgot-password`
- [ ] After OTP verification and sign-up, seamlessly route to `/feed`

### Settings Page
- [ ] Settings page is currently UI-only — wire up actual change-password functionality via the backend
- [ ] Dark mode toggle is UI-only — implement actual theme switching

### Profile Page
- [ ] Display actual `createdAt` from session/user object (currently has a fallback "August 2026")

---

## 🟢 LOW PRIORITY — P1/P2 from MVP Scope

- [x] Post deletion by owner (`DELETE /api/posts/:id`)
- [ ] Basic reporting system (persist report to DB instead of just toast)
- [ ] Cursor-based feed pagination
- [x] Bookmark persistence (persisted to localStorage)
- [ ] Notification system (currently a stub button)
- [ ] Mobile responsiveness audit and fixes
- [ ] Google OAuth sign-in UI button on Login/Signup pages
- [ ] Production deployment configuration
- [ ] Environment variable documentation for `.env.example` files

---

## 🔎 Key Architectural Progress Summary

```
Completed Full-Stack Architecture:
  Frontend (React + Vite)
    ├── FeedPage ──────────────▶ GET  /api/posts (latest / top / search + (You) badge)
    │                            POST /api/posts
    │                            DELETE /api/posts/:id
    ├── PostDetailPage ────────▶ GET  /api/posts/:id (+ (You) badge)
    │                            GET  /api/posts/:id/comments
    │                            POST /api/posts/:id/comments
    │                            DELETE /api/posts/:id
    ├── ProfilePage ───────────▶ GET  /api/posts/me (Your Posts Hub)
    │                            DELETE /api/posts/:id
    └── Shared Components ─────▶ AliasAvatar (nature icon mapping)
         │
         ▼
  Backend (Express + Better Auth + Prisma + PostgreSQL)
    ├── requireAuth & optionalAuth (Session Validation)
    ├── Posts Service (CRUD, getMyPosts, isAuthor resolution, cascade delete)
    ├── Comments Service (Threaded hierarchy, contextual alias reuse)
    └── Alias Service (Server-authoritative contextual aliases)

Next Step:
  Frontend Auth Flow Integration (Wire LoginPage & SignupPage to Better Auth)
```

# Anonimy — Authentication Backend Technical Guide

This document is the definitive, code-verified technical guide to the authentication architecture and implementation in the **Anonimy** repository. It covers the full lifecycle of authentication, session management, database persistence, and OTP-based password recovery.

---

## 1. ARCHITECTURE OVERVIEW

The Anonimy authentication backend is a modular, decoupled system built with **Express 5**, **Better Auth**, **Prisma ORM (v7)**, **PostgreSQL**, and **Nodemailer (Mailtrap)**, serving a **React 19 + Vite** single-page application.

### Primary Authentication Flow

```text
+-------------------------------------------------------------+
|                     Browser / User Agent                    |
+-------------------------------------------------------------+
                              |
                              | User actions (Form submit,     Navigation)
                              v
+-------------------------------------------------------------+
|                React 19 + Vite Frontend                     |
|  - authClient (better-auth/react) & fetch API               |
|  - ProtectedRoute / PublicAuthRoute hooks (useSession)      |
+-------------------------------------------------------------+
                              |
                              | HTTP/JSON (CORS, credentials: include)
                              v
+-------------------------------------------------------------+
|                  Express 5 Server (app.ts)                  |
|  - CORS middleware (origin matching, credentials enabled)   |
|  - Better Auth Node handler (toNodeHandler) on /api/auth/*  |
|  - Custom Auth Router on /api/password-reset                |
|  - Session validation middleware (requireAuth)              |
+-------------------------------------------------------------+
               |                               |
               | /api/auth/*                   | /api/password-reset/*
               v                               v
+-----------------------------+ +-----------------------------+
|      Better Auth Engine     | |    Custom Auth Controller   |
|  - Credential verification  | |  - OTP generation & hashing |
|  - Password hashing         | |  - Mailtrap email dispatch  |
|  - Session & cookie issuance| |  - Token-based reset auth   |
+-----------------------------+ +-----------------------------+
               \                               /
                \                             /
                 v                           v
+-------------------------------------------------------------+
|              Prisma ORM 7 (@prisma/client)                  |
|  - @prisma/adapter-pg with pg.Pool connection pool          |
|  - Type-safe queries on User, Session, Account, Verification|
+-------------------------------------------------------------+
                              |
                              | SQL over TCP (Port 5432)
                              v
+-------------------------------------------------------------+
|                     PostgreSQL Database                     |
|  Tables: "user", "session", "account", "verification"       |
+-------------------------------------------------------------+
```

### Password Reset & OTP Delivery Flow

```text
+-------------------------------------------------------------+
|                    Browser (React Client)                   |
+-------------------------------------------------------------+
                              |
                              | POST /api/password-reset/forgot-password
                              v
+-------------------------------------------------------------+
|             Express Server (auth.routes.ts)                 |
|  1. Look up user by normalized email in PostgreSQL          |
|  2. Generate 6-digit random OTP (crypto.randomInt)          |
|  3. Compute SHA-256 hash of OTP                             |
|  4. Store hashed OTP in Prisma "verification" table         |
+-------------------------------------------------------------+
                              |
                              | SMTP over TLS (Port 2525)
                              v
+-------------------------------------------------------------+
|              Mailtrap.io (Sandbox SMTP Server)              |
|  Host: sandbox.smtp.mailtrap.io | Port: 2525                |
+-------------------------------------------------------------+
                              |
                              | Captured in development inbox
                              v
+-------------------------------------------------------------+
|              User's Email Inbox / Mailtrap UI               |
|  HTML/Plaintext email containing 6-digit verification code  |
+-------------------------------------------------------------+
```

### Technology Role Matrix

| Technology | Exact Version | Role & Responsibility in Anonimy |
| :--- | :--- | :--- |
| **React + Vite** | `react@^19.2.8`, `vite@^8.2.2` | Renders UI, manages component state (`useState`), controls client routing with `react-router-dom`, executes auth hooks. |
| **Better Auth (Client)** | `better-auth@^1.7.1` | Client SDK (`createAuthClient`), exposes `signIn`, `signUp`, `signOut`, and `useSession` for cookie-based session tracking. |
| **Express** | `express@^5.2.1` | HTTP web server, mounts CORS, parses incoming JSON, routes `/api/auth/*` to Better Auth and `/api/password-reset/*` to custom routes. |
| **Better Auth (Server)** | `better-auth@^1.7.1` | Authentication engine: handles password hashing, credential validation, session record creation, cookie serialization. |
| **Nodemailer** | `nodemailer@^9.0.5` | Transports OTP emails over SMTP using credentials configured for Mailtrap or Gmail. |
| **Mailtrap.io** | Cloud SMTP | Safe email testing environment; intercepts outbound OTP emails without sending messages to real inboxes. |
| **Node Crypto** | Node.js native | Generates cryptographically secure 6-digit OTPs (`randomInt`), SHA-256 hashes (`createHash`), and reset tokens (`randomBytes`). |
| **Prisma ORM** | `@prisma/client@^7.9.1` | Type-safe query engine using `@prisma/adapter-pg` driver adapter with `pg.Pool`. |
| **PostgreSQL** | Relational DB | Persistent storage for user profiles, credentials, active sessions, and verification tokens. |
| **TypeScript** | `typescript@^7.0.2` | Provides static typing across server modules, request interfaces, and schema definitions. |
| **Zod** | `zod@^4.4.3` | Installed dependency utilized internally by Better Auth for input schema enforcement. |

---

## 2. REQUEST/RESPONSE LIFECYCLE

### A. Signup Flow (`POST /api/auth/sign-up/email`)

```text
Browser / React           Express App                Better Auth Core            Prisma / PostgreSQL
     |                         |                            |                             |
     |-- 1. Submit Form ------>|                            |                             |
     |   { email, password,    |-- 2. toNodeHandler ------->|                             |
     |     name }              |                            |-- 3. Check duplicate email->|
     |                         |                            |   (SELECT FROM "user")      |
     |                         |                            |-- 4. Hash password -------->|
     |                         |                            |-- 5. INSERT "user" -------->|
     |                         |                            |-- 6. INSERT "account" ----->|
     |                         |                            |-- 7. INSERT "session" ----->|
     |                         |<-- 8. Set-Cookie Header ---|                             |
     |<-- 9. 200 OK + User ----|   (better-auth.session_token)                            |
     |-- 10. Redirect /feed -->|                            |                             |
```

1. **Browser**: User enters email, password, and confirm password in [`SignupPage.tsx`](file:///c:/Users/Acer/Desktop/BEE_ANONIMY/client/src/pages/SignupPage.tsx).
2. **React Form Handling**: `handleSubmit` validates `password === confirm` and `password.length >= 8`. Sets `isLoading(true)`. Calls `authClient.signUp.email({ email, password, name })`.
3. **HTTP Request**: Sent as `POST http://localhost:5000/api/auth/sign-up/email` with `Content-Type: application/json` and `credentials: "include"`.
4. **Server Endpoint**: Matches `app.all("/api/auth/*splat", toNodeHandler(auth))` in [`app.ts`](file:///c:/Users/Acer/Desktop/BEE_ANONIMY/server/src/app.ts).
5. **Express Dispatch**: `toNodeHandler` passes native Node request/response streams directly to the Better Auth engine.
6. **Better Auth Execution**:
   - Validates input format and enforces `minPasswordLength: 8`, `maxPasswordLength: 64`.
   - Checks if email is already taken.
   - Hashes password using secure key-derivation algorithms.
7. **Prisma & Database Interaction**:
   - Creates a new record in `"user"` table.
   - Creates a credential record in `"account"` table storing the hashed password.
   - Generates a cryptographically random session token and writes to `"session"` table with 7-day expiration (`expiresAt`).
8. **Response Return**: Returns HTTP 200 with JSON payload `{ user: { id, email, name, ... } }` and sets `Set-Cookie: better-auth.session_token=<token>; Path=/; HttpOnly; SameSite=Lax`.
9. **UI Update**: `authClient` updates local session state; React Router navigates user to `/feed`.

---

### B. Login Flow (`POST /api/auth/sign-in/email`)

1. **Browser**: User enters email and password on [`LoginPage.tsx`](file:///c:/Users/Acer/Desktop/BEE_ANONIMY/client/src/pages/LoginPage.tsx).
2. **React Form Handling**: `handleSubmit` prevents default event, verifies non-empty fields, sets `isLoading(true)`, calls `authClient.signIn.email({ email, password })`.
3. **HTTP Request**: `POST http://localhost:5000/api/auth/sign-in/email` with body `{"email": "...", "password": "..."}`.
4. **Server Endpoint**: Intercepted by `toNodeHandler(auth)` in [`app.ts`](file:///c:/Users/Acer/Desktop/BEE_ANONIMY/server/src/app.ts).
5. **Better Auth Execution**:
   - Looks up `"user"` by email via Prisma.
   - Retrieves associated `"account"` record (`providerId = "credential"`).
   - Verifies submitted plaintext password against stored hash.
6. **Prisma & Database Interaction**:
   - On match, generates a new session token.
   - Inserts new record into `"session"` table (`id, userId, token, expiresAt, ipAddress, userAgent`).
7. **Response Return**: HTTP 200 with user data and new `Set-Cookie` header containing `better-auth.session_token`.
8. **UI Update**: `LoginPage.tsx` receives success and triggers `navigate('/feed')`.

---

### C. Forgot Password Form (`POST /api/password-reset/forgot-password`)

1. **Browser**: User enters email on [`ForgotPasswordPage.tsx`](file:///c:/Users/Acer/Desktop/BEE_ANONIMY/client/src/pages/ForgotPasswordPage.tsx) (Step 1).
2. **React Form Handling**: `handleRequestOtp` executes `fetch('${API}/api/password-reset/forgot-password')`.
3. **Server Endpoint**: Handled by `authRouter.post("/forgot-password")` in [`auth.routes.ts`](file:///c:/Users/Acer/Desktop/BEE_ANONIMY/server/src/modules/auth.routes.ts).
4. **Validation & Enumeration Protection**: Trims and lowercases email. Queries `prisma.user.findUnique({ where: { email } })`. If user does not exist, immediately returns HTTP 200 with `"If that email is registered, an OTP has been sent."` to prevent user enumeration attacks.
5. **OTP Generation & Persistence**:
   - Generates 6-digit numeric OTP via `crypto.randomInt(100000, 999999)`.
   - Computes SHA-256 hash: `hashValue(otp)`.
   - Deletes any existing OTP for identifier `otp:reset:<email>`.
   - Inserts record into `"verification"` table with `expiresAt = Date.now() + 10 minutes`.
6. **Nodemailer / Mailtrap**: Creates SMTP transporter and dispatches HTML/text email containing the plain 6-digit OTP.
7. **Response**: HTTP 200 `{ "message": "If that email is registered, an OTP has been sent." }`.
8. **UI Update**: `ForgotPasswordPage` shows success banner and advances to Step 2 (OTP Input).

---

### D. OTP Verification (`POST /api/password-reset/verify-otp`)

1. **Browser**: User enters 6-digit OTP in [`ForgotPasswordPage.tsx`](file:///c:/Users/Acer/Desktop/BEE_ANONIMY/client/src/pages/ForgotPasswordPage.tsx) (Step 2).
2. **React Form Handling**: `handleVerifyOtp` posts `{ email, otp }`.
3. **Server Endpoint**: Handled by `authRouter.post("/verify-otp")` in [`auth.routes.ts`](file:///c:/Users/Acer/Desktop/BEE_ANONIMY/server/src/modules/auth.routes.ts).
4. **Server Verification**:
   - Hashes submitted OTP using SHA-256.
   - Queries `prisma.verification.findFirst` for matching identifier `otp:reset:<email>` and hashed `value`.
   - If not found: returns HTTP 400 `"Invalid OTP. Please check the code and try again."`.
   - If found but `expiresAt < new Date()`: deletes record, returns HTTP 400 `"OTP has expired. Please request a new one."`.
5. **Authorization Grant**:
   - Generates a 32-byte cryptographic token: `crypto.randomBytes(32).toString("hex")`.
   - Deletes consumed OTP record from `"verification"`.
   - Stores new record in `"verification"`: `identifier = "reset-token:<email>"`, `value = resetToken`, `expiresAt = Date.now() + 15 minutes`.
6. **Response**: HTTP 200 `{ "resetToken": "...", "message": "OTP verified successfully." }`.
7. **UI Update**: Stores `resetToken` in React state and advances to Step 3 (New Password).

---

### E. Password Reset (`POST /api/password-reset/reset-password`)

1. **Browser**: User inputs new password and confirmation in [`ForgotPasswordPage.tsx`](file:///c:/Users/Acer/Desktop/BEE_ANONIMY/client/src/pages/ForgotPasswordPage.tsx) (Step 3).
2. **React Form Handling**: Verifies match and length >= 8. Posts `{ email, resetToken, newPassword }`.
3. **Server Endpoint**: Handled by `authRouter.post("/reset-password")` in [`auth.routes.ts`](file:///c:/Users/Acer/Desktop/BEE_ANONIMY/server/src/modules/auth.routes.ts).
4. **Token & Expiry Check**: Validates `reset-token:<email>` in `"verification"` table. Returns HTTP 400 if missing or expired.
5. **Password Update & Session Invalidation**:
   - Hashes `newPassword` using `hashPassword` from `@better-auth/utils/password` (exact algorithm used by Better Auth).
   - Updates `"account"` record (`password = hashed`, `updatedAt = new Date()`).
   - Deletes `resetToken` from `"verification"`.
   - **Revokes all active sessions**: `prisma.session.deleteMany({ where: { userId: user.id } })`.
6. **Response**: HTTP 200 `{ "message": "Password reset successfully. Please log in with your new password." }`.
7. **UI Update**: Displays success alert and redirects user to `/login` after 2 seconds.

---

### F. Logout Flow (`POST /api/auth/sign-out`)

1. **Browser / UI**: Triggered by invoking `authClient.signOut()`.
2. **HTTP Request**: `POST http://localhost:5000/api/auth/sign-out` with credentials cookie attached.
3. **Server Handling**: Better Auth identifies session from cookie, deletes the row from `"session"` table in PostgreSQL, and returns an expired `Set-Cookie` header (`Max-Age=0`).
4. **UI Update**: Client session hook `useSession` becomes `null`, triggering `ProtectedRoute` to redirect to `/login`.

---

## 3. FORM SUBMISSION & CLIENT-SERVER PROTOCOL

### Form Handling in React

All authentication views use controlled form components in React:
- State hooks (`useState`) track input values on every keystroke (`onChange`).
- Form elements use `noValidate` to allow custom, uniform error banner displays rather than default browser tooltips.
- Form submissions are intercepted via synthetic event handler `onSubmit={(e) => handleSubmit(e)}` which calls `e.preventDefault()` to stop native full-page browser reloads.

### Request/Response Payload Specifications

#### 1. Signup Request / Response
- **URL**: `POST http://localhost:5000/api/auth/sign-up/email`
- **Headers**:
  ```http
  Content-Type: application/json
  Origin: http://localhost:5173
  ```
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "Password123!",
    "name": "user"
  }
  ```
- **Response (200 OK)**:
  ```http
  HTTP/1.1 200 OK
  Set-Cookie: better-auth.session_token=s%3A7a1b...; Path=/; HttpOnly; SameSite=Lax
  Content-Type: application/json
  ```
  ```json
  {
    "user": {
      "id": "c7a6e16b-4e6f-4029-a1b7-a3f295b9d3b1",
      "email": "user@example.com",
      "name": "user",
      "emailVerified": false,
      "image": null,
      "createdAt": "2026-08-27T04:15:00.000Z",
      "updatedAt": "2026-08-27T04:15:00.000Z"
    }
  }
  ```

#### 2. OTP Verification Request / Response
- **URL**: `POST http://localhost:5000/api/password-reset/verify-otp`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "otp": "482910"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "resetToken": "a3f58e19c4d92049b18374d9203847fae0192847561029384756102938475610",
    "message": "OTP verified successfully."
  }
  ```

---

## 4. BETTER AUTH DEEP DIVE

### Configuration & Integration

Better Auth is instantiated in [`server/src/config/auth.ts`](file:///c:/Users/Acer/Desktop/BEE_ANONIMY/server/src/config/auth.ts) and mounted in [`server/src/app.ts`](file:///c:/Users/Acer/Desktop/BEE_ANONIMY/server/src/app.ts):

```typescript
// server/src/config/auth.ts
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
    maxPasswordLength: 64,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days in seconds
    updateAge: 60 * 60 * 24,      // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,             // 5 minutes in memory
    },
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
  },
  trustedOrigins: [clientUrl, serverUrl, "http://localhost:5173", "http://localhost:5000"],
});
```

### Server Mount (Express 5 Compatibility)
In Express 5, route wildcards require named splats. [`app.ts`](file:///c:/Users/Acer/Desktop/BEE_ANONIMY/server/src/app.ts) binds:
```typescript
app.all("/api/auth/*splat", toNodeHandler(auth));
app.all("/api/auth", toNodeHandler(auth));
```

### Session Lifecycle Management
1. **Creation**: When sign-up or sign-in completes, Better Auth creates a 32-byte cryptographically secure session string, creates a row in the `"session"` table with `expiresAt = now + 7 days`, and writes the cookie `better-auth.session_token` to the HTTP response.
2. **Maintenance**: With `updateAge: 86400` (1 day), if a request arrives with an active session older than 1 day, Better Auth updates `expiresAt` and `updatedAt` in the database, sliding the expiration window.
3. **Cookie Cache**: With `cookieCache.enabled = true`, session lookups can be cached in-memory for up to 5 minutes (`maxAge: 300`), reducing database read overhead.
4. **Invalidation**: Calling `/api/auth/sign-out` immediately deletes the row from `"session"` and zeros out the client cookie.

---

## 5. EXPRESS ARCHITECTURE & MIDDLEWARE

### Middleware Execution Pipeline

Every HTTP request to the backend flows through the following pipeline:

```text
Incoming HTTP Request
        |
        v
1. CORS Middleware (cors())
   - Validates Origin against CLIENT_URL (http://localhost:5173)
   - Sets Access-Control-Allow-Credentials: true
   - Sets Allowed Headers: Content-Type, Authorization, Cookie
        |
        +---> If URL starts with /api/auth/*:
        |        Direct dispatch to Better Auth toNodeHandler(auth)
        |        (Processes sign-up, sign-in, sign-out, get-session)
        |
        v
2. Body Parser (express.json())
   - Parses raw JSON payloads into req.body
        |
        +---> If URL starts with /api/password-reset/*:
        |        Dispatches to custom authRouter (auth.routes.ts)
        |
        +---> If URL is /api/health:
        |        Returns { status: "ok", service: "anonimy-server" }
        |
        +---> If URL is protected (e.g., /api/test/protected):
                 Dispatches through requireAuth middleware
```

### Session Protection Middleware (`requireAuth`)

Defined in [`server/src/middleware/auth.middleware.ts`](file:///c:/Users/Acer/Desktop/BEE_ANONIMY/server/src/middleware/auth.middleware.ts):

```typescript
export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const sessionData = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!sessionData || !sessionData.session || !sessionData.user) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Active session required to access this resource",
      });
      return;
    }

    req.user = sessionData.user as AuthenticatedUser;
    req.session = sessionData.session as AuthenticatedSession;
    next();
  } catch (error) {
    res.status(500).json({
      error: "AuthenticationError",
      message: "An error occurred while validating the session",
    });
  }
}
```

---

## 6. PRISMA ORM & POSTGRESQL PERSISTENCE

### Database Client Initialization

[`server/src/lib/prisma.ts`](file:///c:/Users/Acer/Desktop/BEE_ANONIMY/server/src/lib/prisma.ts) utilizes the modern Prisma 7 Driver Adapter pattern (`@prisma/adapter-pg`) with a connection pool to manage concurrent PostgreSQL connections efficiently while preventing connection exhaustion during hot-reloads:

```typescript
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });
```

### Database Schema Models

The authentication system operates on four core models in [`schema.prisma`](file:///c:/Users/Acer/Desktop/BEE_ANONIMY/server/prisma/schema.prisma):

```prisma
model User {
  id            String    @id @default(uuid())
  name          String?
  email         String    @unique
  emailVerified Boolean   @default(false)
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  sessions      Session[]
  accounts      Account[]

  @@map("user")
}

model Session {
  id        String   @id @default(uuid())
  expiresAt DateTime
  token     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  ipAddress String?
  userAgent String?
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("session")
}

model Account {
  id                    String    @id @default(uuid())
  accountId             String
  providerId            String
  userId                String
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  accessToken           String?
  refreshToken          String?
  idToken               String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  password              String?
  issuer                String?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  @@map("account")
}

model Verification {
  id         String    @id @default(uuid())
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime? @default(now())
  updatedAt  DateTime? @updatedAt

  @@map("verification")
}
```

### Table Roles & Field Purposes

| Model | Table Name | Purpose | Key Fields |
| :--- | :--- | :--- | :--- |
| **`User`** | `user` | Core user identity record | `id` (UUID PK), `email` (Unique), `name`, `emailVerified`, `createdAt` |
| **`Session`** | `session` | Active authenticated login sessions | `id`, `token` (Unique session lookup hash), `expiresAt`, `userId` (FK -> user.id ON DELETE CASCADE) |
| **`Account`** | `account` | Stores auth credentials | `userId` (FK -> user.id), `providerId` ("credential"), `password` (Hashed password string) |
| **`Verification`** | `verification` | Ephemeral OTPs and password-reset authorization tokens | `identifier` (e.g. `otp:reset:<email>` or `reset-token:<email>`), `value` (Hashed OTP or token string), `expiresAt` |

---

## 7. FORGOT PASSWORD & OTP ENGINE

The password reset architecture is implemented in [`server/src/modules/auth.routes.ts`](file:///c:/Users/Acer/Desktop/BEE_ANONIMY/server/src/modules/auth.routes.ts) and follows a secure, 2-stage verification pattern.

```text
STAGE 1: Request OTP
[User Email] ---> Check User in DB ---> Generate 6-digit OTP ---> SHA-256 Hash ---> Store in "verification"
                                                                         |
                                                                         v
                                                            Send plain OTP via Mailtrap SMTP

STAGE 2: Verify OTP
[User OTP] -----> SHA-256 Hash ---> Compare with "verification" table
                                           |
                    +----------------------+----------------------+
                    | (Valid & Not Expired)                       | (Invalid or Expired)
                    v                                             v
        Delete consumed OTP row                             Return 400 Error
        Generate 32-byte resetToken
        Store "reset-token:<email>" in "verification" (15 min TTL)
        Return resetToken to client

STAGE 3: Apply New Password
[resetToken + newPassword] ---> Verify resetToken in "verification"
                                           |
                                           v
                                Hash password via @better-auth/utils/password
                                Update "account" table with new hash
                                Delete resetToken row
                                Delete all rows in "session" for this user (Revoke all logins)
```

### Key Technical Parameters

- **OTP Generation**: `crypto.randomInt(100000, 999999)` guarantees an integer between 100000 and 999999 (always 6 digits).
- **OTP Storage**: Plain OTPs are **never stored** in the database. The server computes `crypto.createHash("sha256").update(otp).digest("hex")` and stores only the 64-character hex hash.
- **OTP Identifier Prefix**: `otp:reset:<email>` (e.g. `otp:reset:test@example.com`).
- **OTP Time-to-Live (TTL)**: `10 * 60 * 1000` (10 minutes).
- **Reset Token Identifier**: `reset-token:<email>`.
- **Reset Token TTL**: `15 * 60 * 1000` (15 minutes).
- **Attempt / Retry Limit**: Single active OTP per email (requesting a new OTP deletes previous unexpired OTPs via `deleteMany`). *Explicit rate-limiting counter on failed verification attempts: Not implemented (recommended for future production hardening).*
- **Mail Delivery (Nodemailer)**: Configured via `EMAIL_HOST` (`sandbox.smtp.mailtrap.io`), `EMAIL_PORT` (`2525`), `EMAIL_USER`, and `EMAIL_PASS`.

---

## 8. SECURITY ARCHITECTURE

### Implemented vs Recommended Security Measures

| Security Dimension | Status | Implementation Details |
| :--- | :--- | :--- |
| **Password Hashing** | **IMPLEMENTED** | Uses `@better-auth/utils/password` (`hashPassword`) for sign-up and password reset, ensuring algorithm parity across all endpoints. |
| **Plaintext Password Protection** | **IMPLEMENTED** | Passwords are never returned in queries or HTTP JSON responses. Stored exclusively in the isolated `account` table. |
| **OTP Hashing** | **IMPLEMENTED** | OTPs are hashed with SHA-256 before database insertion; database compromises do not expose valid reset codes. |
| **Two-Stage Reset Authorization** | **IMPLEMENTED** | Submitting an OTP does not directly reset the password; it issues an ephemeral, single-use 32-byte hex token valid for 15 minutes. |
| **Session Invalidation on Reset** | **IMPLEMENTED** | `prisma.session.deleteMany({ where: { userId: user.id } })` immediately revokes all existing sessions when a password is changed. |
| **Email Enumeration Mitigation** | **IMPLEMENTED** | `POST /forgot-password` returns the exact same generic 200 message whether the email exists or not. |
| **Session Cookie Security** | **IMPLEMENTED** | Better Auth issues `HttpOnly`, `SameSite=Lax` cookies; `useSecureCookies: true` in production (`NODE_ENV === "production"`). |
| **CORS Access Control** | **IMPLEMENTED** | Express CORS restricts origins to explicit URLs (`http://localhost:5173`), with `credentials: true`. |
| **SQL Injection Prevention** | **IMPLEMENTED** | 100% of database queries execute through Prisma ORM using parameterized SQL queries. |
| **Environment Variable Isolation** | **IMPLEMENTED** | Database connection strings, auth secrets, and SMTP credentials load from `.env` via `dotenv/config`. |
| **Rate Limiting** | *Recommended* | Not implemented in current MVP. Recommend `express-rate-limit` on `/forgot-password` and `/sign-in`. |
| **Failed OTP Attempt Lockout** | *Recommended* | Not implemented in current MVP. Recommend locking OTP after 5 consecutive invalid tries. |

---

## 9. ERROR HANDLING MATRIX

The backend returns standard, structured HTTP error responses:

```text
Client Request ---> Try Block in Express/Better Auth Handler
                          |
                          +---> Validation Error  ---> HTTP 400 Bad Request { error: "..." }
                          +---> Auth Failure      ---> HTTP 401 Unauthorized { error: "..." }
                          +---> Server / DB Error ---> Catch Block ---> HTTP 500 { error: "..." }
```

| Scenario | HTTP Status | Response Payload | Server Action |
| :--- | :--- | :--- | :--- |
| **Invalid login credentials** | `400` / `401` | `{"message": "Invalid email or password"}` | Better Auth rejects password mismatch, no session created |
| **Duplicate email signup** | `400` / `422` | `{"message": "Email already in use"}` | Better Auth rejects duplicate unique constraint |
| **Password < 8 characters** | `400` | `{"error": "Password must be at least 8 characters"}` | Validated before hashing and database persistence |
| **Invalid OTP entered** | `400` | `{"error": "Invalid OTP. Please check the code and try again."}` | SHA-256 hash does not match record in `verification` |
| **Expired OTP submitted** | `400` | `{"error": "OTP has expired. Please request a new one."}` | `expiresAt < new Date()`; deletes stale row from DB |
| **Nonexistent email on reset** | `200` | `{"message": "If that email is registered, an OTP has been sent."}` | Silent success returned to avoid email harvesting |
| **Expired reset token** | `400` | `{"error": "Reset session has expired. Please request a new OTP."}` | Rejects final password change; deletes token |
| **Unauthenticated protected route** | `401` | `{"error": "Unauthorized", "message": "Active session required..."}` | `requireAuth` halts request before calling `next()` |
| **SMTP Delivery Failure** | `500` | `{"error": "Failed to send OTP email..."}` | Catches nodemailer error, rolls back stored OTP, returns 500 |

---

## 10. IMPORTANT CODE LOCATIONS

| Component | File Path | Responsibility |
| :--- | :--- | :--- |
| **Server Entry Point** | [`server/src/server.ts`](file:///c:/Users/Acer/Desktop/BEE_ANONIMY/server/src/server.ts) | Imports `dotenv/config`, starts Express HTTP listener on `PORT`. |
| **Express App Setup** | [`server/src/app.ts`](file:///c:/Users/Acer/Desktop/BEE_ANONIMY/server/src/app.ts) | Configures CORS, mounts `toNodeHandler(auth)`, mounts `authRouter`, applies JSON parser. |
| **Better Auth Config** | [`server/src/config/auth.ts`](file:///c:/Users/Acer/Desktop/BEE_ANONIMY/server/src/config/auth.ts) | Defines `betterAuth` instance, Prisma adapter, password length rules, session TTL. |
| **Prisma Singleton** | [`server/src/lib/prisma.ts`](file:///c:/Users/Acer/Desktop/BEE_ANONIMY/server/src/lib/prisma.ts) | Instantiates `PrismaClient` with `@prisma/adapter-pg` and `pg.Pool`. |
| **Auth Middleware** | [`server/src/middleware/auth.middleware.ts`](file:///c:/Users/Acer/Desktop/BEE_ANONIMY/server/src/middleware/auth.middleware.ts) | `requireAuth` function for inspecting session cookies on protected endpoints. |
| **Password Reset Module** | [`server/src/modules/auth.routes.ts`](file:///c:/Users/Acer/Desktop/BEE_ANONIMY/server/src/modules/auth.routes.ts) | OTP generation, SHA-256 hashing, Mailtrap dispatch, OTP verify, password reset. |
| **Prisma Schema** | [`server/prisma/schema.prisma`](file:///c:/Users/Acer/Desktop/BEE_ANONIMY/server/prisma/schema.prisma) | Schema models for `User`, `Session`, `Account`, `Verification`. |
| **Environment Config** | [`server/.env`](file:///c:/Users/Acer/Desktop/BEE_ANONIMY/server/.env) | `DATABASE_URL`, `BETTER_AUTH_SECRET`, `CLIENT_URL`, `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASS`. |
| **Client Auth SDK** | [`client/src/lib/auth-client.ts`](file:///c:/Users/Acer/Desktop/BEE_ANONIMY/client/src/lib/auth-client.ts) | Exports `authClient`, `signIn`, `signUp`, `signOut`, `useSession`. |
| **Client App Routing** | [`client/src/App.tsx`](file:///c:/Users/Acer/Desktop/BEE_ANONIMY/client/src/App.tsx) | Implements `ProtectedRoute` and `PublicAuthRoute` route guards using `useSession`. |
| **Login Page View** | [`client/src/pages/LoginPage.tsx`](file:///c:/Users/Acer/Desktop/BEE_ANONIMY/client/src/pages/LoginPage.tsx) | Controlled login form calling `authClient.signIn.email`. |
| **Signup Page View** | [`client/src/pages/SignupPage.tsx`](file:///c:/Users/Acer/Desktop/BEE_ANONIMY/client/src/pages/SignupPage.tsx) | Signup form with confirmation validation calling `authClient.signUp.email`. |
| **Forgot Password View** | [`client/src/pages/ForgotPasswordPage.tsx`](file:///c:/Users/Acer/Desktop/BEE_ANONIMY/client/src/pages/ForgotPasswordPage.tsx) | 3-step wizard: Email -> 6-digit OTP Input -> New Password. |

---

## 11. END-TO-END FLOW DIAGRAMS

### 1. Signup Diagram
```text
[User] -> (SignupPage: email, pass) -> [authClient.signUp.email]
           -> POST /api/auth/sign-up/email -> [Better Auth]
           -> INSERT "user", INSERT "account", INSERT "session"
           -> Set-Cookie: better-auth.session_token -> [React /feed]
```

### 2. Login Diagram
```text
[User] -> (LoginPage: email, pass) -> [authClient.signIn.email]
           -> POST /api/auth/sign-in/email -> [Better Auth]
           -> Compare Password Hash with "account" table
           -> INSERT "session" -> Set-Cookie -> [React /feed]
```

### 3. Forgot Password Diagram
```text
[User] -> (ForgotPasswordPage: email) -> POST /api/password-reset/forgot-password
           -> Generate 6-digit OTP -> Store SHA-256 hash in "verification"
           -> Send plain OTP via Mailtrap SMTP -> [Mailtrap Inbox]
```

### 4. OTP Verification Diagram
```text
[User] -> (ForgotPasswordPage: enters 6 digits) -> POST /api/password-reset/verify-otp
           -> Hash input -> Compare with "verification"
           -> Delete OTP row -> Generate 32-byte resetToken -> Save in "verification"
           -> Return { resetToken } to client
```

### 5. Password Reset Diagram
```text
[User] -> (ForgotPasswordPage: newPassword) -> POST /api/password-reset/reset-password
           -> Validate resetToken -> Hash new password
           -> UPDATE "account" SET password -> DELETE "verification"
           -> DELETE FROM "session" WHERE userId = user.id -> [Redirect to /login]
```

### 6. Logout Diagram
```text
[User] -> (Calls authClient.signOut()) -> POST /api/auth/sign-out
           -> DELETE FROM "session" WHERE token = cookie.token
           -> Set-Cookie: better-auth.session_token=; Max-Age=0 -> [Redirect to /login]
```

---

## 12. ASSESSMENT & VIVA QUESTIONS

#### 1. What happens when you click the Login button?
React's `handleSubmit` intercepts the click, prevents default browser reload, validates the form fields, and invokes `authClient.signIn.email()`. This sends an HTTP POST request with the credentials to `/api/auth/sign-in/email`.

#### 2. How does the browser communicate with the server?
Via standard asynchronous HTTP requests using the browser `fetch` API over TCP/IP, transmitting JSON bodies and receiving JSON payloads along with HTTP response headers and cookies.

#### 3. What is an API?
An Application Programming Interface (API) is a set of defined rules, protocols, and endpoints that allow the React frontend to communicate with the Express backend to exchange data and perform operations.

#### 4. What is HTTP?
HyperText Transfer Protocol is the stateless, application-layer communication protocol used for transmitting web requests and responses between the client and server.

#### 5. Why do we use Express?
Express provides a fast, minimalist web server framework for Node.js to manage routing, middleware execution (CORS, JSON parsing), request/response lifecycles, and custom API endpoints.

#### 6. What does Better Auth do?
Better Auth is a comprehensive TypeScript authentication engine that manages user registration, credential hashing, session creation, session renewal, HTTP-only cookie serialization, and session validation.

#### 7. Why not implement authentication completely manually?
Rolling custom authentication from scratch frequently leads to subtle security vulnerabilities (timing attacks, weak hashing algorithms, insecure cookie flags, flawed session invalidation). Better Auth provides hardened, peer-reviewed primitives.

#### 8. What is a session?
A session is a server-side state record representing a continuously authenticated interaction with a specific user, bounded by an expiration timestamp (`expiresAt`) and referenced by a secure token.

#### 9. How does the browser know that the user is logged in?
The browser receives an `HttpOnly` cookie containing the session token upon successful login. On every subsequent request (including `authClient.useSession()`), the cookie is sent to the server, which validates it against the `"session"` table in PostgreSQL.

#### 10. What are cookies?
Cookies are small key-value data headers stored by the browser. By using the `HttpOnly` flag, cookies cannot be accessed or stolen by client-side JavaScript, protecting the session token from Cross-Site Scripting (XSS) attacks.

#### 11. Where are passwords stored?
Passwords are stored in the PostgreSQL `"account"` table in a one-way hashed format generated by key-derivation algorithms (Scrypt/Argon2). Plaintext passwords are never stored.

#### 12. Why do we use Prisma?
Prisma is a type-safe Object-Relational Mapper (ORM) that generates auto-completed TypeScript queries, prevents SQL injection through automated parameterization, and manages database schema migrations.

#### 13. Why PostgreSQL?
PostgreSQL is an enterprise-grade, ACID-compliant relational database that ensures data integrity, strict foreign key cascading relationships, and robust indexing.

#### 14. How does Prisma communicate with PostgreSQL?
In this project, Prisma communicates with PostgreSQL using the `@prisma/adapter-pg` driver adapter over a `pg.Pool` connection pool, executing parameterized SQL over TCP on port 5432.

#### 15. What happens during signup?
The server validates password length constraints, verifies the email is not already registered, creates a `"user"` record, stores the hashed password in an `"account"` record, creates a `"session"` record, and sends back an HTTP-only session cookie.

#### 16. What happens during login?
The server looks up the user by email, compares the submitted password against the stored password hash in `"account"`, creates a new `"session"` row, and returns a session cookie.

#### 17. How does forgot password work?
The user submits their email; the server verifies the user, generates a random 6-digit OTP, stores a SHA-256 hash of the OTP in the `"verification"` table (10-minute expiry), and dispatches the plain OTP to the user's email via Mailtrap.

#### 18. How is the OTP generated?
Using Node.js's built-in cryptographic library: `crypto.randomInt(100000, 999999)`, ensuring an unbiased, cryptographically strong 6-digit number.

#### 19. How does Mailtrap work in this project?
Mailtrap acts as a fake SMTP server (`sandbox.smtp.mailtrap.io:2525`). Nodemailer connects to it using credentials from `.env`, allowing developers to test email delivery and inspect HTML formatting in a safe sandbox without sending real emails.

#### 20. How is the OTP verified?
The server hashes the user-submitted OTP with SHA-256 and searches the `"verification"` table for a row matching `identifier = "otp:reset:<email>"` and `value = <hashed_otp>`.

#### 21. What happens if the OTP expires?
The server checks `if (record.expiresAt < new Date())`. If expired, it deletes the verification record from the database and returns an HTTP 400 error message asking the user to request a new code.

#### 22. What happens if the user enters the wrong password?
Better Auth compares the derived hash and returns an HTTP 400/401 error response. React displays an inline error alert: `"Invalid email or password"`.

#### 23. How are invalid requests handled?
Handlers validate fields at the top of the function. If missing or malformed, execution stops immediately with `return res.status(400).json({ error: "..." })`.

#### 24. What is middleware?
Middleware functions in Express are functions that have access to the request (`req`), response (`res`), and next middleware function (`next`). They execute sequentially to perform tasks like parsing bodies, setting CORS headers, or verifying authentication.

#### 25. What is CORS and why is it needed?
Cross-Origin Resource Sharing (CORS) is a browser security mechanism that blocks web pages from making requests to a different domain/port than the one that served the web page, unless the server explicitly permits it via `Access-Control-Allow-Origin` and `Access-Control-Allow-Credentials`.

#### 26. What is the difference between authentication and authorization?
- **Authentication**: Verifies *who* you are (logging in with email/password, issuing a session).
- **Authorization**: Determines *what* you are allowed to do (checking if your authenticated session has permission to access a protected route).

#### 27. Where are environment variables used?
Loaded via `dotenv/config` in [`server.ts`](file:///c:/Users/Acer/Desktop/BEE_ANONIMY/server/src/server.ts) from [`.env`](file:///c:/Users/Acer/Desktop/BEE_ANONIMY/server/.env), configuring `PORT`, `DATABASE_URL`, `BETTER_AUTH_SECRET`, `CLIENT_URL`, and SMTP credentials (`EMAIL_USER`, `EMAIL_PASS`).

#### 28. What security measures have you implemented?
Password hashing (Scrypt/Argon2), OTP hashing (SHA-256), 2-stage password reset tokenization, session revocation on password change, HTTP-only SameSite cookies, parameterized SQL queries via Prisma, email enumeration protection, and strict CORS configuration.

#### 29. What happens if the database is unavailable?
Prisma queries throw an exception, caught by `try/catch` blocks in Express routes, which return HTTP 500 Internal Server Error without crashing the server process.

#### 30. Why is the backend necessary instead of doing everything in React?
React runs entirely inside the user's browser (client-side). If database queries or password verification occurred in React, database credentials and secret keys would be exposed to the public, and any user could bypass authentication logic.

#### 31. Why is the Better Auth route wildcard written as `/api/auth/*splat`?
Express 5 changed its route matching syntax from legacy regex strings (`*`) to named path-to-regexp wildcards (`*splat`).

#### 32. Why do we delete all sessions when a user resets their password?
To enforce immediate security revocation: if an account was compromised, changing the password terminates any active adversary sessions on all devices, forcing everyone to re-authenticate with the new password.

---

## 13. "EXPLAIN THIS CODE" (VIVA CODE BREAKDOWNS)

### Excerpt 1: Express 5 Route Mounting
**File**: [`server/src/app.ts`](file:///c:/Users/Acer/Desktop/BEE_ANONIMY/server/src/app.ts#L23-L26)
```typescript
app.all("/api/auth/*splat", toNodeHandler(auth));
app.all("/api/auth", toNodeHandler(auth));
```
- **What it does**: Delegates all HTTP methods (`GET`, `POST`, etc.) targeting `/api/auth` and any sub-path to the Better Auth request handler.
- **Why it is needed**: Bridges Better Auth's universal web-standard request handler into Express's Node HTTP request pipeline using Express 5's named wildcard syntax (`*splat`).

---

### Excerpt 2: CORS Configuration with Credentials
**File**: [`server/src/app.ts`](file:///c:/Users/Acer/Desktop/BEE_ANONIMY/server/src/app.ts#L13-L21)
```typescript
app.use(
  cors({
    origin: clientOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
  })
);
```
- **What it does**: Configures Cross-Origin Resource Sharing to allow the React client on port 5173 to communicate with Express on port 5000.
- **Why it is needed**: Setting `credentials: true` and exposing `Set-Cookie` is strictly mandatory for browsers to transmit and receive `HttpOnly` session cookies across different ports on localhost.

---

### Excerpt 3: Secure Session Middleware
**File**: [`server/src/middleware/auth.middleware.ts`](file:///c:/Users/Acer/Desktop/BEE_ANONIMY/server/src/middleware/auth.middleware.ts#L36-L51)
```typescript
const sessionData = await auth.api.getSession({
  headers: fromNodeHeaders(req.headers),
});

if (!sessionData || !sessionData.session || !sessionData.user) {
  res.status(401).json({
    error: "Unauthorized",
    message: "Active session required to access this resource",
  });
  return;
}

req.user = sessionData.user as AuthenticatedUser;
req.session = sessionData.session as AuthenticatedSession;
next();
```
- **What it does**: Extracts incoming headers, checks if the session cookie is valid in the database, attaches `user` and `session` objects to `req`, and calls `next()`.
- **Why it is needed**: Protects private API endpoints. If the user is unauthenticated, it blocks access with HTTP 401.

---

### Excerpt 4: OTP Generation & SHA-256 Hashing
**File**: [`server/src/modules/auth.routes.ts`](file:///c:/Users/Acer/Desktop/BEE_ANONIMY/server/src/modules/auth.routes.ts#L56-L64)
```typescript
function generateOtp(): string {
  return String(crypto.randomInt(100000, 999999));
}

function hashValue(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}
```
- **What it does**: `generateOtp` generates a 6-digit random number using the OS cryptographic random source. `hashValue` creates a one-way SHA-256 hex digest.
- **Why it is needed**: Guarantees OTPs are unpredictable and ensures plain OTPs are never stored in the database.

---

### Excerpt 5: Two-Stage Reset Token Grant & OTP Invalidation
**File**: [`server/src/modules/auth.routes.ts`](file:///c:/Users/Acer/Desktop/BEE_ANONIMY/server/src/modules/auth.routes.ts#L169-L182)
```typescript
const resetToken = crypto.randomBytes(32).toString("hex");
const resetIdentifier = `${RESET_IDENTIFIER_PREFIX}${normalised}`;
const resetExpiry = new Date(Date.now() + RESET_TTL_MS);

await prisma.verification.deleteMany({ where: { identifier: resetIdentifier } });
await prisma.verification.create({
  data: { identifier: resetIdentifier, value: resetToken, expiresAt: resetExpiry },
});

await prisma.verification.delete({ where: { id: record.id } }).catch(() => null);

res.status(200).json({ resetToken, message: "OTP verified successfully." });
```
- **What it does**: When the OTP matches, the server consumes (deletes) the OTP, creates a single-use 32-byte `resetToken` with a 15-minute expiration, and returns it to the client.
- **Why it is needed**: Prevents OTP replay attacks and decouples OTP verification from password updating.

---

### Excerpt 6: Password Update & Forced Session Revocation
**File**: [`server/src/modules/auth.routes.ts`](file:///c:/Users/Acer/Desktop/BEE_ANONIMY/server/src/modules/auth.routes.ts#L234-L246)
```typescript
const hashed = await hashPassword(newPassword);

await prisma.account.updateMany({
  where: { userId: user.id, providerId: "credential" },
  data: { password: hashed, updatedAt: new Date() },
});

await prisma.verification.delete({ where: { id: record.id } }).catch(() => null);
await prisma.session.deleteMany({ where: { userId: user.id } }).catch(() => null);
```
- **What it does**: Hashes the new password with Better Auth's algorithm, updates the `account` table, removes the reset token, and deletes all existing active sessions for that user.
- **Why it is needed**: Applies the new password and logs out any active sessions across all devices for security.

---

### Excerpt 7: React Protected Route Component
**File**: [`client/src/App.tsx`](file:///c:/Users/Acer/Desktop/BEE_ANONIMY/client/src/App.tsx#L11-L32)
```typescript
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading Anonimy...</div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
```
- **What it does**: Uses Better Auth's `useSession()` hook to check client login state. Shows a loading state while fetching, redirects to `/login` if unauthenticated, or renders child components if authenticated.
- **Why it is needed**: Prevents unauthenticated users from seeing protected pages like `/feed` and `/profile`.

---

## 14. IMPLEMENTATION STATUS

| Feature / Component | Implementation Status | Verified Code Reference |
| :--- | :--- | :--- |
| **Email & Password Signup** | **Implemented** | [`SignupPage.tsx`](file:///c:/Users/Acer/Desktop/BEE_ANONIMY/client/src/pages/SignupPage.tsx), [`auth.ts`](file:///c:/Users/Acer/Desktop/BEE_ANONIMY/server/src/config/auth.ts) |
| **Email & Password Login** | **Implemented** | [`LoginPage.tsx`](file:///c:/Users/Acer/Desktop/BEE_ANONIMY/client/src/pages/LoginPage.tsx), [`auth.ts`](file:///c:/Users/Acer/Desktop/BEE_ANONIMY/server/src/config/auth.ts) |
| **Logout & Session Invalidation** | **Implemented** | [`auth-client.ts`](file:///c:/Users/Acer/Desktop/BEE_ANONIMY/client/src/lib/auth-client.ts), Better Auth core |
| **Cookie Session Management** | **Implemented** | `HttpOnly`, 7-day TTL, sliding updateAge, memory cache in [`auth.ts`](file:///c:/Users/Acer/Desktop/BEE_ANONIMY/server/src/config/auth.ts) |
| **Forgot Password Request** | **Implemented** | [`ForgotPasswordPage.tsx`](file:///c:/Users/Acer/Desktop/BEE_ANONIMY/client/src/pages/ForgotPasswordPage.tsx#L302), [`auth.routes.ts`](file:///c:/Users/Acer/Desktop/BEE_ANONIMY/server/src/modules/auth.routes.ts#L73) |
| **Cryptographic OTP Generation** | **Implemented** | `crypto.randomInt(100000, 999999)` in [`auth.routes.ts`](file:///c:/Users/Acer/Desktop/BEE_ANONIMY/server/src/modules/auth.routes.ts#L57) |
| **OTP Hashing (SHA-256)** | **Implemented** | `hashValue` in [`auth.routes.ts`](file:///c:/Users/Acer/Desktop/BEE_ANONIMY/server/src/modules/auth.routes.ts#L62) |
| **OTP Email Delivery via Mailtrap** | **Implemented** | `createTransporter` (Nodemailer SMTP) in [`auth.routes.ts`](file:///c:/Users/Acer/Desktop/BEE_ANONIMY/server/src/modules/auth.routes.ts#L26) |
| **OTP Verification & Expiration** | **Implemented** | `POST /verify-otp` (10-min TTL) in [`auth.routes.ts`](file:///c:/Users/Acer/Desktop/BEE_ANONIMY/server/src/modules/auth.routes.ts#L142) |
| **Reset Token Issuance** | **Implemented** | 32-byte hex token (15-min TTL) in [`auth.routes.ts`](file:///c:/Users/Acer/Desktop/BEE_ANONIMY/server/src/modules/auth.routes.ts#L170) |
| **Password Reset & Re-hashing** | **Implemented** | `POST /reset-password` using `@better-auth/utils/password` in [`auth.routes.ts`](file:///c:/Users/Acer/Desktop/BEE_ANONIMY/server/src/modules/auth.routes.ts#L187) |
| **Revoke Sessions on Password Reset** | **Implemented** | `prisma.session.deleteMany` in [`auth.routes.ts`](file:///c:/Users/Acer/Desktop/BEE_ANONIMY/server/src/modules/auth.routes.ts#L245) |
| **PostgreSQL Persistence** | **Implemented** | Tables: `user`, `session`, `account`, `verification` in [`schema.prisma`](file:///c:/Users/Acer/Desktop/BEE_ANONIMY/server/prisma/schema.prisma) |
| **Prisma Driver Adapter Pool** | **Implemented** | `@prisma/adapter-pg` with `pg.Pool` in [`prisma.ts`](file:///c:/Users/Acer/Desktop/BEE_ANONIMY/server/src/lib/prisma.ts) |
| **Route Protection Guards** | **Implemented** | `<ProtectedRoute>` and `<PublicAuthRoute>` in [`App.tsx`](file:///c:/Users/Acer/Desktop/BEE_ANONIMY/client/src/App.tsx) |
| **Protected Backend Middleware** | **Implemented** | `requireAuth` in [`auth.middleware.ts`](file:///c:/Users/Acer/Desktop/BEE_ANONIMY/server/src/middleware/auth.middleware.ts) |

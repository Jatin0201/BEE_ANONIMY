# Anonimy

A privacy-first anonymous social platform built around contextual, per-post anonymity. Express thoughts, confessions, advice, and experiences freely without attaching your permanent identity to conversations.

---

## 🌟 Key Features

- **Contextual Anonymity**: Users receive unique, deterministic aliases per post thread (e.g., `Silent Fox` on Post A, `Hidden Oak` on Post B).
- **Secure Authentication**: Email-based authentication powered by Better-Auth with verification codes.
- **Safe & Calm Community**: Designed for open, human, and supportive interactions without social clout chasing.

---

## 🛠️ Tech Stack

- **Frontend (`/client`)**: React 19, TypeScript, Vite, Tailwind CSS, React Router, Lucide React
- **Backend (`/server`)**: Node.js, Express 5, TypeScript, Prisma ORM, PostgreSQL, Better-Auth
- **Database**: PostgreSQL (via Prisma)

---

## 📁 Repository Structure

```text
.
├── client/          # Frontend React SPA
├── server/          # Backend Express API & Better-Auth
└── docs/            # Architecture, Database, & API Documentation
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL database

### 1. Backend Setup
```bash
cd server
npm install

# Configure environment variables (.env)
# DATABASE_URL, BETTER_AUTH_SECRET, etc.

npm run db:generate
npm run db:migrate
npm run dev
```

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```

The client will start at `http://localhost:5173` and communicate with the backend at `http://localhost:5000`.

---

## 📚 Documentation

Detailed documentation is available in the [`docs/`](./docs) directory:
- [Project Context](./docs/PROJECT_CONTEXT.md)
- [System Architecture](./docs/SYSTEM_ARCHITECTURE.md)
- [Database Design](./docs/DATABASE_DESIGN.md)
- [Authentication Backend Guide](./docs/AUTHENTICATION_BACKEND_GUIDE.md)
- [MVP Scope](./docs/MVP_SCOPE.md)

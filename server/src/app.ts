import "dotenv/config";
import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./config/auth.js";
import { requireAuth } from "./middleware/auth.middleware.js";
import type { AuthenticatedRequest } from "./middleware/auth.middleware.js";
import { authRouter } from "./modules/auth.routes.js";
import { authLimiter } from "./middleware/rate-limiter.js";

export const app = express();

const clientOrigin = process.env.CLIENT_URL;
if (!clientOrigin) {
  throw new Error("Missing required environment variable: CLIENT_URL in server/.env");
}

app.use(
  cors({
    origin: clientOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
  })
);

// Mount Better Auth handler with authLimiter rate protection
app.all("/api/auth/*splat", authLimiter, toNodeHandler(auth));
app.all("/api/auth", authLimiter, toNodeHandler(auth));

app.use(express.json());

// Custom OTP-based password reset routes — mounted at /api/password-reset
// to avoid conflict with Better Auth's /api/auth/* wildcard handler above.
app.use("/api/password-reset", authRouter);

// Basic health check
app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: "anonimy-server" });
});

// Minimum test route to verify authenticated session without exposing domain resources
app.get("/api/test/protected", requireAuth, (req: AuthenticatedRequest, res) => {
  res.status(200).json({
    authenticated: true,
    user: {
      id: req.user?.id,
      email: req.user?.email,
      name: req.user?.name,
    },
  });
});

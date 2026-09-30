/**
 * auth.routes.ts
 *
 * Custom OTP-based forgot-password flow with strict Zod schema validation,
 * disposable email rejection, and endpoint-specific rate limiting.
 *
 * Endpoints:
 *   POST /api/password-reset/forgot-password  — validate email, rate-limit, generate & email 6-digit OTP
 *   POST /api/password-reset/verify-otp       — rate-limit attempts, verify OTP is valid & not expired
 *   POST /api/password-reset/reset-password   — validate token & new password, update hash, invalidate sessions
 */
export declare const authRouter: import("express-serve-static-core").Router;
//# sourceMappingURL=auth.routes.d.ts.map
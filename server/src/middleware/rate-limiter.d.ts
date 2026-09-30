/**
 * General rate limiter for Better Auth endpoints (/api/auth/*)
 * Max 30 requests per 15 minutes per IP.
 */
export declare const authLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Strict rate limiter for requesting password reset OTP emails.
 * Max 5 requests per 15 minutes per IP.
 */
export declare const passwordResetLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Rate limiter for OTP verification attempts to prevent brute-forcing the 6-digit code.
 * Max 10 attempts per 15 minutes per IP.
 */
export declare const otpVerifyLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Rate limiter for submitting the final password change.
 * Max 5 attempts per 15 minutes per IP.
 */
export declare const passwordSubmitLimiter: import("express-rate-limit").RateLimitRequestHandler;
//# sourceMappingURL=rate-limiter.d.ts.map
import rateLimit from "express-rate-limit";

/**
 * General rate limiter for Better Auth endpoints (/api/auth/*)
 * Max 30 requests per 15 minutes per IP.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "TooManyRequests",
    message: "Too many authentication requests from this IP, please try again after 15 minutes.",
  },
});

/**
 * Strict rate limiter for requesting password reset OTP emails.
 * Max 5 requests per 15 minutes per IP.
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "TooManyRequests",
    message: "Too many password reset requests. Please wait 15 minutes before requesting another code.",
  },
});

/**
 * Rate limiter for OTP verification attempts to prevent brute-forcing the 6-digit code.
 * Max 10 attempts per 15 minutes per IP.
 */
export const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "TooManyRequests",
    message: "Too many verification attempts. Please wait 15 minutes or request a new code.",
  },
});

/**
 * Rate limiter for submitting the final password change.
 * Max 5 attempts per 15 minutes per IP.
 */
export const passwordSubmitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "TooManyRequests",
    message: "Too many password change attempts. Please try again after 15 minutes.",
  },
});

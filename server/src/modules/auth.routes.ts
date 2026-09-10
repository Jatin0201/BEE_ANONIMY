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

import { Router, type Request, type Response } from "express";
import crypto from "crypto";
import { z } from "zod";
import { hashPassword } from "@better-auth/utils/password";
import { prisma } from "../lib/prisma.js";
import { validateEmail } from "../lib/email-validator.js";
import { sendOtpEmail } from "../lib/mailer.js";
import {
  passwordResetLimiter,
  otpVerifyLimiter,
  passwordSubmitLimiter,
} from "../middleware/rate-limiter.js";

export const authRouter = Router();

// ─── Zod Request Schemas ─────────────────────────────────────────────────────

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email cannot be empty"),
});

const verifyOtpSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email cannot be empty"),
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "OTP must be a 6-digit number"),
});

const resetPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email cannot be empty"),
  resetToken: z
    .string()
    .trim()
    .min(32, "Invalid reset token format"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(64, "Password must be at most 64 characters long"),
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Generate a cryptographically random 6-digit OTP */
function generateOtp(): string {
  return String(crypto.randomInt(100000, 999999));
}

/** SHA-256 hash so we never store plain-text OTPs in the DB */
function hashValue(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

const OTP_TTL_MS   = 10 * 60 * 1000; // 10 minutes
const RESET_TTL_MS = 15 * 60 * 1000; // 15 minutes to complete reset after OTP verified
const OTP_IDENTIFIER_PREFIX   = "otp:reset:";
const RESET_IDENTIFIER_PREFIX = "reset-token:";

// ─── POST /api/password-reset/forgot-password ────────────────────────────────

authRouter.post(
  "/forgot-password",
  passwordResetLimiter,
  async (req: Request, res: Response) => {
    const parseResult = forgotPasswordSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: parseResult.error.issues[0]?.message || "Invalid input data",
      });
      return;
    }

    const { email } = parseResult.data;
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid || !emailValidation.normalizedEmail) {
      res.status(400).json({
        error: emailValidation.error || "Invalid or disposable email address.",
      });
      return;
    }

    const normalised = emailValidation.normalizedEmail;

    // Always return the same message to prevent email enumeration
    const user = await prisma.user.findUnique({ where: { email: normalised } }).catch(() => null);

    if (!user) {
      res.status(200).json({ message: "If that email is registered, an OTP has been sent." });
      return;
    }

    const otp = generateOtp();
    const hashedOtp = hashValue(otp);
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);
    const identifier = `${OTP_IDENTIFIER_PREFIX}${normalised}`;

    // Replace any existing OTP for this email
    await prisma.verification.deleteMany({ where: { identifier } });
    await prisma.verification.create({
      data: { identifier, value: hashedOtp, expiresAt },
    });

    // Send OTP email
    try {
      await sendOtpEmail({
        to: normalised,
        otp,
        subject: "Your Anonimy password reset code",
        title: "Reset your password",
        description: "Enter this code in the app to reset your password. It expires in 10 minutes.",
      });
    } catch (err) {
      console.error("[auth.routes] Failed to send OTP email:", err);
      // Roll back: remove the OTP we just stored so the user can retry cleanly
      await prisma.verification.deleteMany({ where: { identifier } }).catch(() => null);
      res.status(500).json({
        error: "Failed to send OTP email. Check server EMAIL_USER / EMAIL_PASS configuration.",
      });
      return;
    }

    res.status(200).json({ message: "If that email is registered, an OTP has been sent." });
  }
);

// ─── POST /api/password-reset/verify-otp ─────────────────────────────────────

authRouter.post(
  "/verify-otp",
  otpVerifyLimiter,
  async (req: Request, res: Response) => {
    const parseResult = verifyOtpSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: parseResult.error.issues[0]?.message || "Invalid input data",
      });
      return;
    }

    const { email, otp } = parseResult.data;
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid || !emailValidation.normalizedEmail) {
      res.status(400).json({
        error: emailValidation.error || "Invalid or disposable email address.",
      });
      return;
    }

    const normalised = emailValidation.normalizedEmail;
    const identifier = `${OTP_IDENTIFIER_PREFIX}${normalised}`;
    const hashedOtp = hashValue(otp.trim());

    const record = await prisma.verification.findFirst({
      where: { identifier, value: hashedOtp },
    });

    if (!record) {
      res.status(400).json({ error: "Invalid OTP. Please check the code and try again." });
      return;
    }

    if (record.expiresAt < new Date()) {
      await prisma.verification.delete({ where: { id: record.id } }).catch(() => null);
      res.status(400).json({ error: "OTP has expired. Please request a new one." });
      return;
    }

    // Issue a short-lived reset token for the final password reset step
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetIdentifier = `${RESET_IDENTIFIER_PREFIX}${normalised}`;
    const resetExpiry = new Date(Date.now() + RESET_TTL_MS);

    await prisma.verification.deleteMany({ where: { identifier: resetIdentifier } });
    await prisma.verification.create({
      data: { identifier: resetIdentifier, value: resetToken, expiresAt: resetExpiry },
    });

    // Consume the OTP
    await prisma.verification.delete({ where: { id: record.id } }).catch(() => null);

    res.status(200).json({ resetToken, message: "OTP verified successfully." });
  }
);

// ─── POST /api/password-reset/reset-password ─────────────────────────────────

authRouter.post(
  "/reset-password",
  passwordSubmitLimiter,
  async (req: Request, res: Response) => {
    const parseResult = resetPasswordSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: parseResult.error.issues[0]?.message || "Invalid input data",
      });
      return;
    }

    const { email, resetToken, newPassword } = parseResult.data;
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid || !emailValidation.normalizedEmail) {
      res.status(400).json({
        error: emailValidation.error || "Invalid or disposable email address.",
      });
      return;
    }

    const normalised = emailValidation.normalizedEmail;
    const resetIdentifier = `${RESET_IDENTIFIER_PREFIX}${normalised}`;

    const record = await prisma.verification.findFirst({
      where: { identifier: resetIdentifier, value: resetToken },
    });

    if (!record) {
      res.status(400).json({ error: "Invalid or expired reset session. Please start over." });
      return;
    }

    if (record.expiresAt < new Date()) {
      await prisma.verification.delete({ where: { id: record.id } }).catch(() => null);
      res.status(400).json({ error: "Reset session has expired. Please request a new OTP." });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email: normalised } });
    if (!user) {
      res.status(400).json({ error: "User not found." });
      return;
    }

    // Hash using @better-auth/utils/password — same algorithm Better Auth uses on sign-up
    const hashed = await hashPassword(newPassword);

    await prisma.account.updateMany({
      where: { userId: user.id, providerId: "credential" },
      data: { password: hashed, updatedAt: new Date() },
    });

    // Clean up the reset token
    await prisma.verification.delete({ where: { id: record.id } }).catch(() => null);

    // Invalidate all existing sessions (force re-login with new password)
    await prisma.session.deleteMany({ where: { userId: user.id } }).catch(() => null);

    res.status(200).json({ message: "Password reset successfully. Please log in with your new password." });
  }
);

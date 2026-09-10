import "dotenv/config";
import { betterAuth, APIError } from "better-auth";
import { emailOTP } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "../lib/prisma.js";
import { validateEmail } from "../lib/email-validator.js";
import { sendOtpEmail } from "../lib/mailer.js";

const clientUrl = process.env.CLIENT_URL;
const serverUrl = process.env.BETTER_AUTH_URL;

if (!clientUrl) {
  throw new Error("Missing required environment variable: CLIENT_URL in server/.env");
}

if (!serverUrl) {
  throw new Error("Missing required environment variable: BETTER_AUTH_URL in server/.env");
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const validation = validateEmail(user.email);
          if (!validation.isValid) {
            throw new APIError("BAD_REQUEST", {
              message: validation.error || "Invalid or disposable email address.",
            });
          }
          return {
            data: {
              ...user,
              email: validation.normalizedEmail ?? user.email.toLowerCase().trim(),
            },
          };
        },
      },
    },
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: serverUrl,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    maxPasswordLength: 64,
  },
  emailVerification: {
    autoSignInAfterVerification: true,
  },
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        try {
          if (type === "email-verification") {
            await sendOtpEmail({
              to: email,
              otp,
              subject: "Your Anonimy Sign-up Verification Code",
              title: "Verify your email",
              description: "Enter this 6-digit code in the app to complete your registration.",
            });
          } else if (type === "sign-in") {
            await sendOtpEmail({
              to: email,
              otp,
              subject: "Your Anonimy Login Code",
              title: "Sign in to Anonimy",
              description: "Enter this 6-digit code to log in to your account.",
            });
          } else if (type === "forget-password") {
            await sendOtpEmail({
              to: email,
              otp,
              subject: "Your Anonimy Password Reset Code",
              title: "Reset your password",
              description: "Enter this 6-digit code to reset your password.",
            });
          }
        } catch (error) {
          console.error("[auth] Failed to send OTP email:", error);
          throw new APIError("INTERNAL_SERVER_ERROR", {
            message: "Failed to send verification email. Please check server email configuration.",
          });
        }
      },
      sendVerificationOnSignUp: true,
      expiresIn: 600, // 10 minutes
      otpLength: 6,
    }),
  ],
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,      // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,             // 5 minutes
    },
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
  },
  trustedOrigins: [clientUrl, serverUrl],
});


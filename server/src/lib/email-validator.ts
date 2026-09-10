import { z } from "zod";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

// Load the comprehensive disposable email domains list
let disposableDomainSet: Set<string>;
try {
  const domainsList = require("disposable-email-domains") as string[];
  disposableDomainSet = new Set(domainsList.map((d) => d.toLowerCase()));
} catch {
  disposableDomainSet = new Set();
}

// Supplementary blocklist for popular temporary and disposable email providers
const EXTRA_DISPOSABLE_DOMAINS = [
  "mailinator.com",
  "10minutemail.com",
  "10minutemail.net",
  "guerrillamail.com",
  "guerrillamail.net",
  "guerrillamail.org",
  "guerrillamailblock.com",
  "sharklasers.com",
  "grr.la",
  "tempmail.com",
  "tempmail.net",
  "temp-mail.org",
  "throwawaymail.com",
  "yopmail.com",
  "yopmail.fr",
  "yopmail.net",
  "trashmail.com",
  "trashmail.net",
  "trashmail.me",
  "dispostable.com",
  "getairmail.com",
  "maildrop.cc",
  "inboxkitten.com",
  "burnermail.io",
  "fakeinbox.com",
  "mytemp.email",
  "mohmal.com",
  "crazymailing.com",
  "emailondeck.com",
  "nada.ltd",
  "getnada.com",
  "dropmail.me",
  "tempail.com",
  "fakemailgenerator.com",
  "armyspy.com",
  "cuvox.de",
  "dayrep.com",
  "fleckens.hu",
  "gustr.com",
  "jourrapide.com",
  "rhyta.com",
  "superrito.com",
  "teleworm.us",
  "einrot.com",
];

for (const domain of EXTRA_DISPOSABLE_DOMAINS) {
  disposableDomainSet.add(domain.toLowerCase());
}

/**
 * Standard Zod email schema with length constraints and lowercased output.
 */
export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email cannot be empty")
  .max(254, "Email must be at most 254 characters")
  .email("Please provide a valid email address (e.g. user@example.com)")
  .transform((val) => val.toLowerCase());

/**
 * Checks if a domain or its parent domain belongs to known disposable/temporary services.
 */
export function isDisposableDomain(domain: string): boolean {
  if (!domain) return false;
  const lower = domain.toLowerCase().trim();

  if (disposableDomainSet.has(lower)) {
    return true;
  }

  // Check subdomains (e.g., test.mailinator.com -> mailinator.com)
  const parts = lower.split(".");
  for (let i = 1; i < parts.length - 1; i++) {
    const parentDomain = parts.slice(i).join(".");
    if (disposableDomainSet.has(parentDomain)) {
      return true;
    }
  }

  return false;
}

/**
 * Extracts domain part from an email address and checks if it's disposable.
 */
export function isDisposableEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  const domain = email.split("@")[1];
  if (!domain) return false;
  return isDisposableDomain(domain);
}

export interface EmailValidationResult {
  isValid: boolean;
  error?: string;
  normalizedEmail?: string;
}

/**
 * Comprehensive email validation:
 * 1. Syntax check via Zod RFC-compliant validation
 * 2. Structure check (ensures domain contains a valid TLD)
 * 3. Disposable/burner email domain check
 */
export function validateEmail(input: unknown): EmailValidationResult {
  const parseResult = emailSchema.safeParse(input);
  if (!parseResult.success) {
    const issue = parseResult.error.issues[0];
    return {
      isValid: false,
      error: issue?.message || "Invalid email address format.",
    };
  }

  const normalized = parseResult.data;
  const domain = normalized.split("@")[1];

  if (!domain || !domain.includes(".")) {
    return {
      isValid: false,
      error: "Email domain must contain a valid top-level domain.",
    };
  }

  const tld = domain.split(".").pop();
  if (!tld || tld.length < 2) {
    return {
      isValid: false,
      error: "Email top-level domain is invalid.",
    };
  }

  if (isDisposableDomain(domain)) {
    return {
      isValid: false,
      error: "Disposable or temporary email addresses are not permitted. Please use a permanent email.",
    };
  }

  return {
    isValid: true,
    normalizedEmail: normalized,
  };
}

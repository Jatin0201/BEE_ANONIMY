/**
 * Client-side email validation and disposable domain checking.
 */

// Popular disposable and burner email domains to provide immediate UI feedback
const DISPOSABLE_DOMAINS = new Set([
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
]);

export interface EmailValidationResult {
  isValid: boolean;
  error?: string;
  normalizedEmail?: string;
}

/**
 * Validates email format and detects disposable domains on the client.
 */
export function validateEmail(input: string): EmailValidationResult {
  if (!input || typeof input !== "string") {
    return { isValid: false, error: "Please enter your email address." };
  }

  const trimmed = input.trim().toLowerCase();

  if (trimmed.length > 254) {
    return { isValid: false, error: "Email address is too long." };
  }

  // RFC 5322 standard compliant email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: "Please enter a valid email address (e.g. name@example.com)." };
  }

  const parts = trimmed.split("@");
  const domain = parts[1];
  if (!domain) {
    return { isValid: false, error: "Invalid email format." };
  }

  const tld = domain.split(".").pop();
  if (!tld || tld.length < 2) {
    return { isValid: false, error: "Email domain must have a valid extension (e.g. .com, .org)." };
  }

  // Check exact domain
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return {
      isValid: false,
      error: "Disposable and temporary email addresses are not permitted.",
    };
  }

  // Check subdomain matching
  const domainParts = domain.split(".");
  for (let i = 1; i < domainParts.length - 1; i++) {
    const parent = domainParts.slice(i).join(".");
    if (DISPOSABLE_DOMAINS.has(parent)) {
      return {
        isValid: false,
        error: "Disposable and temporary email addresses are not permitted.",
      };
    }
  }

  return { isValid: true, normalizedEmail: trimmed };
}

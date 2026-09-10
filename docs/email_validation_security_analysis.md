# Email Validation & Fake Email Threat Analysis

**Target Project:** Anonimy Authentication & Server  
**Date:** August 2026  
**Status:** Completed Review / Proposal (No code changes applied)

---

## 1. Executive Summary

In authentication systems, allowing unvalidated or "fake" email addresses exposes the application to significant security, reputational, and operational risks. 

In the current codebase:
1. **Email verification is disabled (`requireEmailVerification: false`)** in [`server/src/config/auth.ts`](file:///c:/Users/Acer/Desktop/BEE_ANONIMY/server/src/config/auth.ts#L25). Users are registered and granted immediate active sessions without proving mailbox ownership.
2. **Server-side validation is minimal** in custom endpoints ([`auth.routes.ts`](file:///c:/Users/Acer/Desktop/BEE_ANONIMY/server/src/modules/auth.routes.ts#L76)), only asserting `typeof email === "string"`.
3. **No disposable/burner domain filters or DNS MX checks** exist to block fake or temporary inboxes.
4. **No rate-limiting middleware** protects email dispatch endpoints from email bombing or enumeration.

---

## 2. Threat Analysis: What Happens With Fake / Unverified Emails?

### A. Account Pre-Creation & Identity Hijacking
* **Vulnerability:** An attacker registers an account using a victim's legitimate email (e.g., `ceo@company.com` or `friend@gmail.com`) because verification isn't required upfront.
* **Impact:** The legitimate owner is blocked from signing up normally. If the attacker leaves the account active, the victim's identity on the platform is compromised.

### B. SMTP Sender Reputation Destruction & High Bounce Rates
* **Vulnerability:** If users or bots register with non-existent addresses (e.g., `asdf@fakesite1234.com`), any automated transactional emails (welcome messages, notifications, password reset OTPs) trigger SMTP **hard bounces**.
* **Impact:** Email service providers (Gmail, Resend, SendGrid, Mailtrap, AWS SES) monitor bounce rates. If bounce rates exceed **2% – 5%**, your domain/IP will be blacklisted, causing real user emails to land in Spam or fail delivery completely.

### C. Sybil Attacks & Bot Account Flooding
* **Vulnerability:** Bots can programmatically generate thousands of random credentials with disposable emails (`user1@10minutemail.com`, `user2@tempmail.ninja`).
* **Impact:** Database pollution in `User`, `Account`, and `Session` tables, skewed analytics, and potential spamming in community feeds/chat.

### D. Email Bombing & Resource Exhaustion
* **Vulnerability:** Without rate-limiting on [`POST /api/password-reset/forgot-password`](file:///c:/Users/Acer/Desktop/BEE_ANONIMY/server/src/modules/auth.routes.ts#L73), an attacker can trigger thousands of OTP email requests to a single victim inbox (denial of service / harassment) or exhaust your email sending quota.

### E. Timing Attacks / Account Enumeration
* **Vulnerability:** In `forgot-password`, if the email does not exist in the database, the server returns immediately (~5ms). If the email exists, the server connects to the SMTP server to send mail (~300–800ms).
* **Impact:** Attackers can measure the response latency to determine if a specific email is registered on Anonimy.

---

## 3. Defense-in-Depth Solution Architecture

To completely eliminate fake email threats, we recommend implementing a **5-Layer Defense Strategy**:

```
[ Incoming Request ]
        │
        ▼
┌────────────────────────────────────────────────────────┐
│ Layer 1: Rate Limiting & Bot Protection                │
│ (express-rate-limit / Turnstile on signup & OTP)       │
└───────────────────────┬────────────────────────────────┘
                        │
                        ▼
┌────────────────────────────────────────────────────────┐
│ Layer 2: Strict Syntax & Schema Validation             │
│ (Zod RFC 5322 email schema + lowercasing/trimming)     │
└───────────────────────┬────────────────────────────────┘
                        │
                        ▼
┌────────────────────────────────────────────────────────┐
│ Layer 3: Disposable / Burner Domain Blocklist          │
│ (Block mailinator, tempmail, guerrilla, etc.)          │
└───────────────────────┬────────────────────────────────┘
                        │
                        ▼
┌────────────────────────────────────────────────────────┐
│ Layer 4: DNS MX Record Verification (Optional/Advanced)│
│ (dns.promises.resolveMx(domain) to confirm mail server)│
└───────────────────────┬────────────────────────────────┘
                        │
                        ▼
┌────────────────────────────────────────────────────────┐
│ Layer 5: Mandatory Email Verification (Better Auth)   │
│ (requireEmailVerification: true / Signup OTP flow)     │
└────────────────────────────────────────────────────────┘
```

---

## 4. Specific Technical Recommendations

### 1. Enable Mandatory Email Verification on Sign-up
* **Configuration:** Update [`server/src/config/auth.ts`](file:///c:/Users/Acer/Desktop/BEE_ANONIMY/server/src/config/auth.ts) to enable email verification or require OTP confirmation before granting full session access.
* **Mechanism:** When a user registers:
  1. An email verification code/link is dispatched via Nodemailer.
  2. The account `emailVerified` flag remains `false` until verified.
  3. Middleware (`requireAuth` or a custom `requireVerifiedEmail` guard) prevents unverified users from performing privileged actions (posting, messaging).

### 2. Add Disposable Email Domain Filtering
* Use a lightweight blocklist (such as the open-source `disposable-email-domains` list) to immediately reject registrations from temporary inboxes:
  ```typescript
  import disposableDomains from "disposable-email-domains";

  export function isDisposableEmail(email: string): boolean {
    const domain = email.split("@")[1]?.toLowerCase();
    return domain ? disposableDomains.includes(domain) : false;
  }
  ```

### 3. Server-Side DNS MX Record Lookup
* Before sending OTPs or creating accounts on custom domains, verify that the domain has active Mail Exchange (MX) records:
  ```typescript
  import dns from "dns/promises";

  export async function hasValidMxRecords(domain: string): Promise<boolean> {
    try {
      const records = await dns.resolveMx(domain);
      return records && records.length > 0;
    } catch {
      return false;
    }
  }
  ```

### 4. Implement Server Rate Limiting
* Protect [`/api/password-reset/forgot-password`](file:///c:/Users/Acer/Desktop/BEE_ANONIMY/server/src/modules/auth.routes.ts#L73) and `/api/auth/sign-up/email` with `express-rate-limit`:
  * Max 5 password reset requests per 15 minutes per IP.
  * Max 3 OTP requests per email per 15 minutes.

### 5. Standardize Schema Validation with Zod
* Validate all request bodies in [`server/src/modules/auth.routes.ts`](file:///c:/Users/Acer/Desktop/BEE_ANONIMY/server/src/modules/auth.routes.ts) with strict schemas:
  ```typescript
  import { z } from "zod";

  const emailSchema = z
    .string()
    .trim()
    .toLowerCase()
    .email({ message: "Invalid email format" })
    .max(255);
  ```

---

## 5. Summary Matrix of Solutions

| Threat | Prevention Layer | Implementation Complexity | Impact |
| :--- | :--- | :--- | :--- |
| **Fake / Typo Inboxes** | DNS MX Check & Mandatory Email Verification | Medium | High (Zero bounce rate) |
| **Disposable / Burner Inboxes** | Disposable Domain Blocklist | Low | High (Stops throwaway abuse) |
| **Email Hijacking / Pre-creation** | Mandatory Email Verification (`requireEmailVerification: true`) | Medium | Critical (Protects real owners) |
| **Email Bombing / Spam** | `express-rate-limit` on signup & OTP routes | Low | High (Protects infrastructure & users) |
| **Malformed Strings** | Zod / RFC 5322 Schema Validation | Low | Medium (Prevents invalid DB rows) |

---
*Note: This analysis has been saved for review. No code changes have been executed in the codebase.*

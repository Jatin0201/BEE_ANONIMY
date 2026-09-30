import { z } from "zod";
/**
 * Standard Zod email schema with length constraints and lowercased output.
 */
export declare const emailSchema: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
/**
 * Checks if a domain or its parent domain belongs to known disposable/temporary services.
 */
export declare function isDisposableDomain(domain: string): boolean;
/**
 * Extracts domain part from an email address and checks if it's disposable.
 */
export declare function isDisposableEmail(email: string): boolean;
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
export declare function validateEmail(input: unknown): EmailValidationResult;
//# sourceMappingURL=email-validator.d.ts.map
import type { Prisma, PrismaClient } from "@prisma/client";
export declare const BASE_ALIASES: string[];
export declare const DESCRIPTORS: string[];
export declare const NOUNS: string[];
type DbClient = PrismaClient | Prisma.TransactionClient;
/**
 * Generates an alias candidate that is not currently in the usedAliases set.
 * Prefers base curated aliases first, then falls back to randomized descriptor + noun combinations.
 */
export declare function generateCandidateAlias(usedAliases: Set<string>): string;
/**
 * Gets the existing alias for a user in a post or assigns a new unique contextual alias.
 * If preferredAlias is provided and not already taken by another participant in this post, it is used.
 * Enforces UNIQUE(postId, userId) and UNIQUE(postId, alias).
 */
export declare function getOrAssignAlias(db: DbClient, postId: string, userId: string, preferredAlias?: string, maxRetries?: number): Promise<string>;
export {};
//# sourceMappingURL=alias.service.d.ts.map
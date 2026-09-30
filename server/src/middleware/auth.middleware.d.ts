import type { Request, Response, NextFunction } from "express";
export interface AuthenticatedUser {
    id: string;
    email: string;
    name?: string | null;
    emailVerified: boolean;
    image?: string | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface AuthenticatedSession {
    id: string;
    userId: string;
    expiresAt: Date;
    token: string;
    createdAt: Date;
    updatedAt: Date;
    ipAddress?: string | null;
    userAgent?: string | null;
}
export interface AuthenticatedRequest extends Request {
    user?: AuthenticatedUser;
    session?: AuthenticatedSession;
}
export declare function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
/**
 * Attaches user session to request if present without failing unauthenticated requests.
 */
export declare function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=auth.middleware.d.ts.map
import type { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../config/auth.js";

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

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const sessionData = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!sessionData || !sessionData.session || !sessionData.user) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Active session required to access this resource",
      });
      return;
    }

    req.user = sessionData.user as AuthenticatedUser;
    req.session = sessionData.session as AuthenticatedSession;
    next();
  } catch (error) {
    res.status(500).json({
      error: "AuthenticationError",
      message: "An error occurred while validating the session",
    });
  }
}

/**
 * Attaches user session to request if present without failing unauthenticated requests.
 */
export async function optionalAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) {
  try {
    const sessionData = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (sessionData?.user && sessionData?.session) {
      req.user = sessionData.user as AuthenticatedUser;
      req.session = sessionData.session as AuthenticatedSession;
    }
  } catch {
    // Ignore error for optional authentication
  }
  next();
}


import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../config/auth.js";
export async function requireAuth(req, res, next) {
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
        req.user = sessionData.user;
        req.session = sessionData.session;
        next();
    }
    catch (error) {
        res.status(500).json({
            error: "AuthenticationError",
            message: "An error occurred while validating the session",
        });
    }
}
/**
 * Attaches user session to request if present without failing unauthenticated requests.
 */
export async function optionalAuth(req, _res, next) {
    try {
        const sessionData = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });
        if (sessionData?.user && sessionData?.session) {
            req.user = sessionData.user;
            req.session = sessionData.session;
        }
    }
    catch {
        // Ignore error for optional authentication
    }
    next();
}
//# sourceMappingURL=auth.middleware.js.map
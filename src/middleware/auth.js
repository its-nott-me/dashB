import jwt from "jsonwebtoken";
import { env } from "../config/loadenv.js";
import ApiError from "../utils/ApiError.js";

/*
    verify jwt token and attach user to req
    params: req, res, next
    returns: void
    throws: ApiError
*/
export const authenticate = (req, res, next) => {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
        throw new ApiError(401, "Access denied. no token provided");
    }

    const token = header.split(" ")[1];
    
    try {
        const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);

        if (decoded.type !== "access") {
            throw new ApiError(401, "Invalid token type");
        }

        req.user = {
            userId: decoded.userId,
            role: decoded.role,
        };

        next();
    } catch (err) {
        if (err instanceof ApiError) {
            throw err;
        }
        throw new ApiError(401, "Invalid or expired token");
    }
}


/*
    check if user is authorized to perform the action
    params: allowedRoles
    returns: void
    throws : ApiError
*/
export const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            throw new ApiError(401, "Authentication requried")
        }

        if (!allowedRoles.includes(req.user.role)) {
            throw new ApiError(403, "You are not allowed to perform this action");
        }

        next();
    }
}
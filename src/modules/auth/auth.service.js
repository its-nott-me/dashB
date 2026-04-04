import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/loadenv.js";
import prisma from "../../config/prisma.js";
import ApiError from "../../utils/ApiError.js";

/*
    following functions do not take req and res objects
    It takes in data, processes it, returns result or throws ApiError
    hence they can be tested without HTTP
*/


/*
    generate short lived access token
    params: user
    returns: access token
*/
const generateAccessToken = (user) => {
    return jwt.sign(
        { userId: user.id, role: user.role, type: "access" },
        env.JWT_ACCESS_SECRET,
        { expiresIn: env.JWT_ACCESS_EXPIRY }
    );
}

/*
    generate a refresh token to fetch new access tokens
    params: user
    returns: refresh token
*/
const generateRefreshToken = (user) => {
    return jwt.sign(
        { userId: user.id, role: user.role, type: "refresh" },
        env.JWT_REFRESH_SECRET,
        { expiresIn: env.JWT_REFRESH_EXPIRY }
    );
}

// strip away sensitive info before returning user
const sanitizeUser = (user) => {
    const { passwordHash, ...safe } = user;
    return safe;
}

/*
    Login user
    params: email, password
    returns: {user, accessToken, refreshToken} (user object is sanitized)
    throws: ApiError
*/
export const login = async (email, pwd) => {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        throw new ApiError(401, "Invalid email or password")
    }

    if (user.status === "INACTIVE") {
        throw new ApiError(403, "Your account is inactive. Please contact administartor");
    }

    const pwdMatched = await bcrypt.compare(pwd, user.passwordHash);
    if (!pwdMatched) {
        throw new ApiError(401, "Invalid email or password");
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    return {
        user: sanitizeUser(user),
        accessToken,
        refreshToken
    }
}

/*
    Refreshes access token
    Params: refreshToken
    returns: {accessToken}
    throws: ApiError
*/
export const refreshAccessToken = async (refreshToken) => {
    try {

        const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
        if (decoded.type !== "refresh") {
            throw new ApiError(401, "Invalid or expired refresh token");
        }

        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

        if (!user) {
            throw new ApiError(401, "User not found");
        }

        if (user.status === "INACTIVE") {
            throw new ApiError(403, "Your account is inactive. Please contact administartor");
        }

        const newAccessToken = generateAccessToken(user);
        return { accessToken: newAccessToken };
    } catch (err) {
        if (err instanceof ApiError) throw err;

        throw new ApiError(401, "invalid or expired refresh token");
    }
}
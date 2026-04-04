import rateLimit from "express-rate-limit";

export const rateLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,       // 10 mins
    max: 100,                       // maximum of 100 requests allowed per 10 mins
    message: {
        succeess: false,
        message: "Too many requests, please try again later"
    },
    legacyHeaders: false,
    standardHeaders: true
})
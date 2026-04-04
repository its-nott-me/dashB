import ApiError from "../utils/ApiError.js";
import { env } from "../config/loadenv.js";

/*
    global error handler
    params: err, req, res, next
*/
const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;                     // default status code
    let message = err.message || "Internal server error";       // default error message
    let errors = err.errors || [];                              // default error array

    // P2002 --> Unique constraint violated
    if (err.code === "P2002") {
        statusCode = 409;
        message = `${err.meta?.target?.[0] || "Field"} already exists`
    }

    // P2025 --> Record not found
    if (err.code === "P2025") {
        statusCode = 404;
        message = "Resource not found";
    }

    if (env.NODE_ENV === "development") {
        console.error(err);
    }

    res.status(statusCode).json({
        success: false,
        message,
        errors,
        ...(env.NODE_ENV === "development" && { stack: err.stack }),
    });
}

export default errorHandler;
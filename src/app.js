import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/users/user.routes.js";
import recordRoutes from "./modules/records/record.routes.js";
import dashBoardRoutes from "./modules/dashboard/dashboard.routes.js";
import errorHandler from "./middleware/errorHandler.js";
import ApiError from "./utils/ApiError.js";
import { rateLimiter } from "./middleware/rateLimiter.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js"

const app = express();

// parse json
app.use(express.json());

// protection against CSRF and XSS attacks
app.use(cors());

// logging for dev env
app.use(morgan("dev"));

// rate limiter
app.use(rateLimiter);

app.get("/api/v1/health", (req, res) => {
    res.json({ success: true, message: "Server is running " });
});

// Swagger UI route
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/records", recordRoutes);
app.use("/api/v1/dashboard", dashBoardRoutes);

// ------------ Error handlers -------------

// route not found error handler
app.use((req, res) => {
    res.status(404).json(new ApiError(404, "Route not found"));
})

// global error handler
app.use(errorHandler);

export default app;
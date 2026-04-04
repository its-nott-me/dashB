import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth.js";
import validate from "../../middleware/validate.js";
import { categoryBreakdownSchema, recentQuerySchema, summaryQuerySchema, trendsQuerySchema, } from "./dashboard.validation.js";
import * as dashboardController from "./dashboard.controller.js";

const router = Router();

// ---------------- public routes ---------------
router.get("/summary", authenticate, validate(summaryQuerySchema, "query"), dashboardController.getSummary);
router.get("/recent", authenticate, validate(recentQuerySchema, "query"), dashboardController.getRecent);

// ---------------- protected routes ----------------
router.get("/trends", authenticate, authorize("ADMIN", "ANALYST"), validate(trendsQuerySchema, "query"), dashboardController.getTrends);
router.get("/category-breakdown", authenticate, authorize("ADMIN", "ANALYST"), validate(categoryBreakdownSchema, "query"), dashboardController.getCategoryBreakdown);


export default router;
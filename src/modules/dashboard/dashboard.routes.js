import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth.js";
import validate from "../../middleware/validate.js";
import { categoryBreakdownSchema, recentQuerySchema, summaryQuerySchema, trendsQuerySchema, } from "./dashboard.validation.js";
import * as dashboardController from "./dashboard.controller.js";

const router = Router();

// ---------------- public routes ---------------
/**
 * @openapi
 * /api/v1/dashboard/summary:
 *   get:
 *     tags:
 *       - Dashboard
 *     summary: Get dashboard summary
 *     description: Returns total income, total expense, net balance, and record count.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *     responses:
 *       200:
 *         description: Summary fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: number
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalIncome:
 *                       type: number
 *                     totalExpense:
 *                       type: number
 *                     netBalance:
 *                       type: number
 *                     recordCount:
 *                       type: number
 */
router.get("/summary", authenticate, validate(summaryQuerySchema, "query"), dashboardController.getSummary);

/**
 * @openapi
 * /api/v1/dashboard/recent:
 *   get:
 *     tags:
 *       - Dashboard
 *     summary: Get recent financial records
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         required: false
 *     responses:
 *       200:
 *         description: Recent records fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: number
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       amount:
 *                         type: number
 *                       type:
 *                         type: string
 *                       category:
 *                         type: string
 *                       date:
 *                         type: string
 *                       creator:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 */
router.get("/recent", authenticate, validate(recentQuerySchema, "query"), dashboardController.getRecent);

// ---------------- protected routes ----------------
/**
 * @openapi
 * /api/v1/dashboard/trends:
 *   get:
 *     tags:
 *       - Dashboard
 *     summary: Get monthly income and expense trends
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: months
 *         required: true
 *         schema:
 *           type: integer
 *           example: 6
 *         description: Number of past months to include
 *     responses:
 *       200:
 *         description: Trends fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   month:
 *                     type: string
 *                     example: "2026-06"
 *                   income:
 *                     type: number
 *                   expense:
 *                     type: number
 *                   net:
 *                     type: number
 */
router.get("/trends", authenticate, authorize("ADMIN", "ANALYST"), validate(trendsQuerySchema, "query"), dashboardController.getTrends);

/**
 * @openapi
 * /api/v1/dashboard/category-breakdown:
 *   get:
 *     tags:
 *       - Dashboard
 *     summary: Get category-wise financial breakdown
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [INCOME, EXPENSE]
 *         required: false
 *     responses:
 *       200:
 *         description: Category breakdown fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   category:
 *                     type: string
 *                   total:
 *                     type: number
 *                   count:
 *                     type: number
 *                   percentage:
 *                     type: number
 */
router.get("/category-breakdown", authenticate, authorize("ADMIN", "ANALYST"), validate(categoryBreakdownSchema, "query"), dashboardController.getCategoryBreakdown);


export default router;
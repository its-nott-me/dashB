import { Router } from "express";
import * as recordController from "./record.controller.js";
import { authenticate, authorize } from "../../middleware/auth.js";
import validate from "../../middleware/validate.js";
import { createRecordSchema, updateRecordSchema, queryRecordsSchema } from "./record.valdiation.js";

const router = Router();

// ----------------- public routes ---------------
/**
 * @openapi
 * /api/v1/records:
 *   get:
 *     tags:
 *       - Records
 *     summary: List financial records
 *     description: Returns paginated list of financial records with filters and sorting.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [INCOME, EXPENSE]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           example: createdAt
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, deleted]
 *     responses:
 *       200:
 *         description: Records fetched successfully
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
 *                       description:
 *                         type: string
 *                       creator:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                 meta:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: number
 *                     limit:
 *                       type: number
 *                     total:
 *                       type: number
 *                     totalPages:
 *                       type: number
 */
router.get("/", authenticate, validate(queryRecordsSchema, "query"), recordController.list);

/**
 * @openapi
 * /api/v1/records/{id}:
 *   get:
 *     tags:
 *       - Records
 *     summary: Get record by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Record fetched successfully
 *       404:
 *         description: Record not found
 */
router.get("/:id", authenticate, recordController.getById);

// ---------------- protected routes --------------
/**
 * @openapi
 * /api/v1/records:
 *   post:
 *     tags:
 *       - Records
 *     summary: Create financial record
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - type
 *               - category
 *               - date
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 5000
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE]
 *               category:
 *                 type: string
 *                 example: Salary
 *               date:
 *                 type: string
 *                 format: date
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Record created successfully
 */
router.post("/", authenticate, authorize("ADMIN"), validate(createRecordSchema), recordController.create);

/**
 * @openapi
 * /api/v1/records/{id}:
 *   patch:
 *     tags:
 *       - Records
 *     summary: Update financial record
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Record updated successfully
 *       404:
 *         description: Record not found
 */
router.patch("/:id", authenticate, authorize("ADMIN"), validate(updateRecordSchema), recordController.update);

/**
 * @openapi
 * /api/v1/records/{id}:
 *   delete:
 *     tags:
 *       - Records
 *     summary: Soft delete record
 *     description: Marks a record as deleted (not permanently removed)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Record deleted successfully
 *       404:
 *         description: Record not found
 */
router.delete("/:id", authenticate, authorize("ADMIN"), recordController.remove);

export default router;
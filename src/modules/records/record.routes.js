import { Router } from "express";
import * as recordController from "./record.controller.js";
import { authenticate, authorize } from "../../middleware/auth.js";
import validate from "../../middleware/validate.js";
import { createRecordSchema, updateRecordSchema, queryRecordsSchema } from "./record.valdiation.js";

const router = Router();

// ----------------- public routes ---------------
router.get("/", authenticate, validate(queryRecordsSchema, "query"), recordController.list);
router.get("/:id", authenticate, recordController.getById);

// ---------------- protected routes --------------
router.post("/", authenticate, authorize("ADMIN"), validate(createRecordSchema), recordController.create);
router.patch("/:id", authenticate, authorize("ADMIN"), validate(updateRecordSchema), recordController.update);
router.delete("/:id", authenticate, authorize("ADMIN"), recordController.remove);

export default router;
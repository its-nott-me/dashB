import { Router } from "express";
import * as userController from "./user.controller.js";
import { authenticate, authorize } from "../../middleware/auth.js";
import validate from "../../middleware/validate.js";
import { queryUsersSchema, createUserSchema, updateUserSchema } from "./user.validation.js";

const router = Router();


// ------------------ public routes ---------------
router.get("/me", authenticate, userController.getMe);

// ----------------- protected routes ---------------
router.get("/", authenticate, authorize("ADMIN"), validate(queryUsersSchema, "query"), userController.listUsers);
router.get("/:id", authenticate, authorize("ADMIN"), userController.getUserById);
router.post("/", authenticate, authorize("ADMIN"), validate(createUserSchema), userController.createUser);
router.patch("/:id", authenticate, authorize("ADMIN"), validate(updateUserSchema), userController.updateUser);

export default router;

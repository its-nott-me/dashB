import { Router } from "express";
import * as authController from "./auth.controller.js";
import validate from "../../middleware/validate.js";
import { loginSchema, refreshTokenSchema } from "./auth.validation.js"

const router = Router();

// ------------------ public routes --------------
router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh", validate(refreshTokenSchema), authController.refreshToken);

export default router;
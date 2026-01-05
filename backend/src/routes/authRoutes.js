import { Router } from "express";
import { body } from "express-validator";
import { authenticate } from "../middleware/auth.js";
import { login, me, register } from "../controllers/authController.js";

const router = Router();

router.post(
  "/register",
  [
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
    body("fullName").notEmpty().withMessage("Full name is required"),
  ],
  register
);

router.post(
  "/login",
  [body("email").isEmail(), body("password").isLength({ min: 6 })],
  login
);

router.get("/me", authenticate, me);

export default router;


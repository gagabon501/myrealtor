import { Router } from "express";
import { body } from "express-validator";
import {
  listMessagesBuyer,
  createMessageBuyer,
  listMessagesAdmin,
  createMessageAdmin,
} from "../controllers/applicationMessageController.js";
import { authenticate, authorizeRoles } from "../middleware/auth.js";

const router = Router();

// Buyer routes (ownership enforced in controller)
router.get("/:id/messages", authenticate, authorizeRoles("user"), listMessagesBuyer);
router.post(
  "/:id/messages",
  authenticate,
  authorizeRoles("user"),
  [body("body").notEmpty()],
  createMessageBuyer
);

// Admin/staff routes
router.get(
  "/admin/:id/messages",
  authenticate,
  authorizeRoles("staff", "admin"),
  listMessagesAdmin
);
router.post(
  "/admin/:id/messages",
  authenticate,
  authorizeRoles("staff", "admin"),
  [body("body").notEmpty()],
  createMessageAdmin
);

export default router;



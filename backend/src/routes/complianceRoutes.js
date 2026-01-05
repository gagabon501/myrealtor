import { Router } from "express";
import { body } from "express-validator";
import { createTask, listTasks, updateTask } from "../controllers/complianceController.js";
import { authenticate, authorizeRoles } from "../middleware/auth.js";

const router = Router();

router.get("/:applicationId", authenticate, listTasks);

router.post(
  "/",
  authenticate,
  authorizeRoles("staff", "admin"),
  [
    body("applicationId").isMongoId(),
    body("agency").optional().isString(),
    body("title").notEmpty(),
    body("dueDate").optional().isISO8601(),
  ],
  createTask
);

router.put(
  "/:id",
  authenticate,
  authorizeRoles("staff", "admin"),
  [body("status").isString(), body("notes").optional().isString()],
  updateTask
);

export default router;


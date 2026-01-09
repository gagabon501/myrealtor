import { Router } from "express";
import { body } from "express-validator";
import {
  createApplication,
  getApplication,
  listApplications,
  myApplications,
  updateWorkflow,
} from "../controllers/applicationController.js";
import { authenticate, authorizeRoles } from "../middleware/auth.js";

const router = Router();

router.post(
  "/",
  authenticate,
  authorizeRoles("user"),
  [body("propertyId").notEmpty().isMongoId()],
  createApplication
);

router.get("/mine", authenticate, authorizeRoles("user"), myApplications);
router.get("/", authenticate, authorizeRoles("staff", "admin"), listApplications);
router.get("/:id", authenticate, getApplication);

router.patch(
  "/:id/status",
  authenticate,
  authorizeRoles("staff", "admin"),
  [body("status").notEmpty().isString()],
  updateWorkflow
);

export default router;


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
  [body("propertyId").notEmpty().isMongoId()],
  createApplication
);

router.get("/me", authenticate, myApplications);
router.get("/", authenticate, authorizeRoles("staff", "admin"), listApplications);
router.get("/:id", authenticate, getApplication);

router.put(
  "/:id/stage",
  authenticate,
  authorizeRoles("staff", "admin"),
  [
    body("stage").optional().isString(),
    body("status").optional().isString(),
    body("regulatoryStatus").optional().isString(),
    body("assignedTo").optional().isMongoId(),
  ],
  updateWorkflow
);

export default router;


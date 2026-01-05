import { Router } from "express";
import { body } from "express-validator";
import {
  createApplication,
  listApplications,
  myApplications,
  updateStage,
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

router.put(
  "/:id/stage",
  authenticate,
  authorizeRoles("staff", "admin"),
  [body("stage").notEmpty()],
  updateStage
);

export default router;


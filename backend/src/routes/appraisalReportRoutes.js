import { Router } from "express";
import { body } from "express-validator";
import {
  createAppraisalReport,
  getAppraisalReport,
  getAppraisalReportByRequest,
  listAppraisalReports,
  updateAppraisalReport,
  finalizeAppraisalReport,
  releaseAppraisalReport,
} from "../controllers/appraisalReportController.js";
import { authenticate, authorizeRoles } from "../middleware/auth.js";

const router = Router();

// All routes require staff/admin
router.use(authenticate, authorizeRoles("staff", "admin"));

router.post(
  "/",
  [
    body("appraisalRequestId").notEmpty().withMessage("Appraisal request ID is required"),
  ],
  createAppraisalReport
);

router.get("/", listAppraisalReports);
router.get("/by-request/:requestId", getAppraisalReportByRequest);
router.get("/:id", getAppraisalReport);
router.patch("/:id", updateAppraisalReport);
router.post("/:id/finalize", finalizeAppraisalReport);
router.post("/:id/release", releaseAppraisalReport);

export default router;

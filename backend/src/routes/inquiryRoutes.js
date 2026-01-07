import { Router } from "express";
import { body, param } from "express-validator";
import {
  createInquiry,
  listInquiries,
  updateInquiryStatus,
} from "../controllers/inquiryController.js";
import { authenticate, authorizeRoles } from "../middleware/auth.js";

const router = Router();

router.post(
  "/",
  [
    body("propertyId").isMongoId(),
    body("name").notEmpty(),
    body("email").isEmail(),
    body("phone").optional().isString(),
    body("address").optional().isString(),
    body("notes").optional().isString(),
  ],
  createInquiry
);

router.get("/", authenticate, authorizeRoles("staff", "admin"), listInquiries);

router.patch(
  "/:id/status",
  authenticate,
  authorizeRoles("staff", "admin"),
  [param("id").isMongoId(), body("status").isIn(["NEW", "CONTACTED", "CLOSED"])],
  updateInquiryStatus
);

export default router;


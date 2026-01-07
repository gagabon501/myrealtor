import { Router } from "express";
import { body, param } from "express-validator";
import {
  createInquiry,
  listInquiries,
  updateInquiryStatus,
} from "../controllers/inquiryController.js";
import { authenticate, authorizeRoles } from "../middleware/auth.js";
import { getRole, canInquiryAccess } from "../policies/accessPolicies.js";

const router = Router();

router.post(
  "/",
  (req, res, next) => {
    const role = getRole(req);
    if (!canInquiryAccess({ action: "CREATE", role })) {
      return res.status(403).json({ message: "Forbidden" });
    }
    return next();
  },
  [
    body("propertyId").notEmpty(),
    body("buyer.name").notEmpty(),
    body("buyer.address").notEmpty(),
    body("buyer.phone").notEmpty(),
    body("buyer.email").isEmail(),
    body("notes").optional().isString(),
  ],
  createInquiry
);

router.get("/", authenticate, authorizeRoles("staff", "admin"), listInquiries);

router.patch(
  "/:id/status",
  authenticate,
  authorizeRoles("staff", "admin"),
  [param("id").isMongoId(), body("status").notEmpty().isIn(["NEW", "CONTACTED", "CLOSED"])],
  updateInquiryStatus
);

export default router;


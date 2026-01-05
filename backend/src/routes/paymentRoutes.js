import { Router } from "express";
import { body } from "express-validator";
import { authenticate, authorizeRoles } from "../middleware/auth.js";
import { createPayment, listPayments, updatePaymentStatus } from "../controllers/paymentController.js";

const router = Router();

router.post(
  "/",
  authenticate,
  [body("applicationId").isMongoId(), body("amount").isNumeric()],
  createPayment
);

router.get("/:applicationId", authenticate, listPayments);

router.put(
  "/:id/status",
  authenticate,
  authorizeRoles("staff", "admin"),
  [body("status").isIn(["PENDING", "SUCCESS", "FAILED"])],
  updatePaymentStatus
);

export default router;


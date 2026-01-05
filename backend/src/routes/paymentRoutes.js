import { Router } from "express";
import { body } from "express-validator";
import { authenticate } from "../middleware/auth.js";
import { createPayment, listPayments } from "../controllers/paymentController.js";

const router = Router();

router.post(
  "/",
  authenticate,
  [body("applicationId").isMongoId(), body("amount").isNumeric()],
  createPayment
);

router.get("/:applicationId", authenticate, listPayments);

export default router;


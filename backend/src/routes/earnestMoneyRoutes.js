import { Router } from "express";
import { body } from "express-validator";
import {
  createEarnestMoneyAgreement,
  getEarnestMoneyAgreement,
  listEarnestMoneyAgreements,
  updateEarnestMoneyAgreement,
  finalizeEarnestMoneyAgreement,
  previewEarnestMoneyAgreement,
  voidEarnestMoneyAgreement,
  getEarnestMoneyByProperty,
} from "../controllers/earnestMoneyController.js";
import { authenticate, authorizeRoles } from "../middleware/auth.js";

const router = Router();

// All routes require staff/admin
router.use(authenticate, authorizeRoles("staff", "admin"));

router.post(
  "/",
  [
    body("propertyId").notEmpty().withMessage("Property ID is required"),
    body("executionDate").isISO8601().withMessage("Execution date is required"),
    body("executionLocation").notEmpty().withMessage("Execution location is required"),
    body("seller.name").notEmpty().withMessage("Seller name is required"),
    body("seller.address").notEmpty().withMessage("Seller address is required"),
    body("buyer.name").notEmpty().withMessage("Buyer name is required"),
    body("buyer.address").notEmpty().withMessage("Buyer address is required"),
    body("buyer.email").isEmail().withMessage("Valid buyer email is required"),
    body("titleNo").notEmpty().withMessage("Title number is required"),
    body("areaSqm").isNumeric().withMessage("Area in sqm is required"),
    body("earnestMoneyAmount").isNumeric().withMessage("Earnest money amount is required"),
    body("totalPurchasePrice").isNumeric().withMessage("Total purchase price is required"),
    body("deedExecutionDeadline").isISO8601().withMessage("Deed execution deadline is required"),
  ],
  createEarnestMoneyAgreement
);

router.get("/", listEarnestMoneyAgreements);
router.get("/property/:propertyId", getEarnestMoneyByProperty);
router.get("/:id", getEarnestMoneyAgreement);
router.patch("/:id", updateEarnestMoneyAgreement);
router.post("/:id/preview", previewEarnestMoneyAgreement);
router.post("/:id/finalize", finalizeEarnestMoneyAgreement);
router.post("/:id/void", voidEarnestMoneyAgreement);

export default router;

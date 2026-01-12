import { Router } from "express";
import { body } from "express-validator";
import {
  createListingRequest,
  listMyListingRequests,
  listAllListingRequests,
  getListingRequest,
  approveListingRequest,
  rejectListingRequest,
  setEarnestMoneyRequired,
  publishListingRequest,
  updateSellerDetails,
  finalizeAts,
} from "../controllers/listingRequestController.js";
import { authenticate, authorizeRoles } from "../middleware/auth.js";

const router = Router();

router.post(
  "/",
  authenticate,
  [
    body("propertyDraft.title").notEmpty(),
    body("propertyDraft.location").notEmpty(),
    body("propertyDraft.price").isNumeric(),
  ],
  createListingRequest
);

router.get("/mine", authenticate, listMyListingRequests);
router.get("/", authenticate, authorizeRoles("staff", "admin"), listAllListingRequests);
router.get("/:id", authenticate, getListingRequest);
router.post(
  "/:id/approve",
  authenticate,
  authorizeRoles("staff", "admin"),
  approveListingRequest
);
router.post(
  "/:id/reject",
  authenticate,
  authorizeRoles("staff", "admin"),
  rejectListingRequest
);
router.post(
  "/:id/publish",
  authenticate,
  authorizeRoles("staff", "admin"),
  publishListingRequest
);
router.patch(
  "/:id/earnest",
  authenticate,
  authorizeRoles("staff", "admin"),
  setEarnestMoneyRequired
);

// Update seller details (owner or staff/admin)
router.patch(
  "/:id/seller",
  authenticate,
  updateSellerDetails
);

// Finalize ATS and generate PDF (staff/admin only)
router.post(
  "/:id/finalize",
  authenticate,
  authorizeRoles("staff", "admin"),
  finalizeAts
);

export default router;


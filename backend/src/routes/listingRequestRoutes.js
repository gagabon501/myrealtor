import { Router } from "express";
import { body, param } from "express-validator";
import {
  createListingRequest,
  listMyRequests,
  getListingRequest,
  reviewListingRequest,
  generateAts,
  signAts,
  publishListing,
} from "../controllers/listingRequestController.js";
import { authenticate, authorizeRoles } from "../middleware/auth.js";

const router = Router();

router.post(
  "/",
  authenticate,
  [body("propertyDraft.title").notEmpty(), body("propertyDraft.location").notEmpty()],
  createListingRequest
);

router.get("/mine", authenticate, listMyRequests);

router.get("/:id", authenticate, getListingRequest);

router.patch(
  "/:id/review",
  authenticate,
  authorizeRoles("staff", "admin"),
  [param("id").isMongoId(), body("status").notEmpty()],
  reviewListingRequest
);

router.post(
  "/:id/generate-ats",
  authenticate,
  authorizeRoles("staff", "admin"),
  [param("id").isMongoId()],
  generateAts
);

router.post(
  "/:id/sign-ats",
  authenticate,
  [param("id").isMongoId(), body("signerName").notEmpty(), body("signerEmail").isEmail()],
  signAts
);

router.post(
  "/:id/publish",
  authenticate,
  authorizeRoles("staff", "admin"),
  [param("id").isMongoId()],
  publishListing
);

export default router;


import { Router } from "express";
import { body } from "express-validator";
import {
  createListingRequest,
  listMyListingRequests,
  listAllListingRequests,
  getListingRequest,
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

export default router;


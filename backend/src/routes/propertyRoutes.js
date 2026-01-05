import { Router } from "express";
import { body } from "express-validator";
import {
  createProperty,
  getProperty,
  listProperties,
  updateProperty,
} from "../controllers/propertyController.js";
import { authenticate, authorizeRoles } from "../middleware/auth.js";

const router = Router();

router.get("/", listProperties);
router.get("/:id", getProperty);

router.post(
  "/",
  authenticate,
  authorizeRoles("staff", "admin"),
  [body("title").notEmpty(), body("location").notEmpty(), body("price").isNumeric()],
  createProperty
);

router.put(
  "/:id",
  authenticate,
  authorizeRoles("staff", "admin"),
  [body("title").optional(), body("location").optional(), body("price").optional().isNumeric()],
  updateProperty
);

export default router;


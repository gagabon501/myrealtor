import { Router } from "express";
import { body } from "express-validator";
import multer from "multer";
import fs from "fs";
import path from "path";
import {
  createProperty,
  getProperty,
  listProperties,
  updateProperty,
  deleteProperty,
  publishProperty,
  unpublishProperty,
  markPropertySold,
  markPropertyReserved,
  withdrawProperty,
} from "../controllers/propertyController.js";
import { authenticate, authorizeRoles } from "../middleware/auth.js";

const router = Router();

const uploadsDir = process.env.UPLOADS_ROOT
  ? path.join(process.env.UPLOADS_ROOT, "properties")
  : path.resolve("uploads/properties");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { files: 4 } });

router.get("/", listProperties);
router.get(
  "/admin",
  authenticate,
  authorizeRoles("staff", "admin"),
  listProperties
);
router.get("/:id", getProperty);

router.post(
  "/",
  authenticate,
  authorizeRoles("staff", "admin"),
  upload.array("images", 4),
  [body("title").notEmpty(), body("location").notEmpty(), body("price").isNumeric()],
  createProperty
);

router.put(
  "/:id",
  authenticate,
  authorizeRoles("staff", "admin"),
  upload.array("images", 4),
  [body("title").optional(), body("location").optional(), body("price").optional().isNumeric()],
  updateProperty
);

router.delete("/:id", authenticate, authorizeRoles("staff", "admin"), deleteProperty);

router.post(
  "/:id/publish",
  authenticate,
  authorizeRoles("staff", "admin"),
  publishProperty
);
router.post(
  "/:id/unpublish",
  authenticate,
  authorizeRoles("staff", "admin"),
  unpublishProperty
);
router.post(
  "/:id/mark-sold",
  authenticate,
  authorizeRoles("staff", "admin"),
  markPropertySold
);
router.post(
  "/:id/mark-reserved",
  authenticate,
  authorizeRoles("staff", "admin"),
  markPropertyReserved
);
router.post(
  "/:id/withdraw",
  authenticate,
  authorizeRoles("staff", "admin"),
  withdrawProperty
);

export default router;


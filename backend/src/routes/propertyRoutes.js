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
} from "../controllers/propertyController.js";
import { authenticate, authorizeRoles } from "../middleware/auth.js";

const router = Router();

const uploadsDir = path.resolve("src/uploads/properties");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

router.get("/", listProperties);
router.get("/:id", getProperty);

router.post(
  "/",
  authenticate,
  authorizeRoles("staff", "admin"),
  upload.single("image"),
  [body("title").notEmpty(), body("location").notEmpty(), body("price").isNumeric()],
  createProperty
);

router.put(
  "/:id",
  authenticate,
  authorizeRoles("staff", "admin"),
  upload.single("image"),
  [body("title").optional(), body("location").optional(), body("price").optional().isNumeric()],
  updateProperty
);

router.delete("/:id", authenticate, authorizeRoles("staff", "admin"), deleteProperty);

export default router;


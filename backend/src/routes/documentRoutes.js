import { Router } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { body } from "express-validator";
import { uploadDocument, listDocuments } from "../controllers/documentController.js";
import { authenticate } from "../middleware/auth.js";

const uploadsDir = path.resolve("src/uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage });

const router = Router();

router.post(
  "/",
  authenticate,
  upload.single("file"),
  [body("applicationId").isMongoId(), body("type").notEmpty()],
  uploadDocument
);

router.get("/:applicationId", authenticate, listDocuments);

export default router;


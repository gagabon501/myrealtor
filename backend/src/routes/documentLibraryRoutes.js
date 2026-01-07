import { Router } from "express";
import multer from "multer";
import {
  uploadDocuments,
  listDocuments,
  deleteDocument,
} from "../controllers/documentLibraryController.js";
import { authenticate, authorizeRoles } from "../middleware/auth.js";
import { createDiskStorage } from "../utils/upload.js";

const router = Router();

const storage = createDiskStorage("documents");
const upload = multer({ storage, limits: { files: 20 } });

// Optional auth: only authenticate if Authorization header is present with Bearer
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader && typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    return authenticate(req, res, next);
  }
  return next();
};

router.post("/", optionalAuth, upload.array("files", 20), uploadDocuments);

router.get("/", listDocuments);

router.delete(
  "/:id",
  authenticate,
  authorizeRoles("staff", "admin"),
  deleteDocument
);

export default router;


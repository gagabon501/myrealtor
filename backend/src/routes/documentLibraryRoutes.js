import { Router } from "express";
import multer from "multer";
import {
  uploadDocuments,
  listDocuments,
  deleteDocument,
  documentLibraryMeta,
} from "../controllers/documentLibraryController.js";
import { authenticate, authorizeRoles } from "../middleware/auth.js";
import { createDiskStorage } from "../utils/upload.js";
import { getRole, canDocumentAccess } from "../policies/accessPolicies.js";

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

router.post("/", optionalAuth, upload.array("files", 20), (req, res, next) => {
  const role = getRole(req);
  if (!canDocumentAccess({ action: "UPLOAD", role })) {
    return res.status(403).json({ message: "Forbidden" });
  }
  return uploadDocuments(req, res, next);
});

router.get("/", (req, res, next) => {
  const role = getRole(req);
  if (!canDocumentAccess({ action: "LIST", role })) {
    return res.status(403).json({ message: "Forbidden" });
  }
  return listDocuments(req, res, next);
});
router.get("/meta", documentLibraryMeta);

router.delete(
  "/:id",
  authenticate,
  authorizeRoles("staff", "admin"),
  deleteDocument
);

export default router;


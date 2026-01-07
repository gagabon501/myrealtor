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
import {
  getRole,
  canDocumentAccess,
  ownsServiceRequest,
  isServiceModule,
} from "../policies/accessPolicies.js";
import { MODULES } from "../constants/documentLibrary.js";

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

router.post("/", upload.array("files", 20), async (req, res, next) => {
  const role = getRole(req);
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  const { module, ownerId } = req.body || {};
  if (!module) {
    return res.status(400).json({ message: "module is required" });
  }
  if (!canDocumentAccess({ action: "UPLOAD", role, module })) {
    return res.status(403).json({ message: "Forbidden" });
  }
  if (isServiceModule(module) && !isStaff(role)) {
    if (!ownerId) return res.status(400).json({ message: "ownerId is required" });
    const { found, owned } = await ownsServiceRequest({
      module,
      ownerId,
      userId: req.user.id,
    });
    if (!found) return res.status(404).json({ message: "Service request not found" });
    if (!owned) return res.status(403).json({ message: "Forbidden" });
  }
  return uploadDocuments(req, res, next);
});

router.get("/", (req, res, next) => {
  const role = getRole(req);
  const { module, ownerId } = req.query || {};
  if (!module) {
    return res.status(400).json({ message: "module is required" });
  }
  if (!canDocumentAccess({ action: "LIST", role, module })) {
    return res.status(403).json({ message: "Forbidden" });
  }
  if (isServiceModule(module) && !isStaff(role)) {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (!ownerId) return res.status(400).json({ message: "ownerId is required" });
    return ownsServiceRequest({ module, ownerId, userId: req.user.id })
      .then(({ found, owned }) => {
        if (!found) return res.status(404).json({ message: "Service request not found" });
        if (!owned) return res.status(403).json({ message: "Forbidden" });
        return listDocuments(req, res, next);
      })
      .catch(next);
  }
  return listDocuments(req, res, next);
});
router.get("/meta", documentLibraryMeta);

router.delete(
  "/:id",
  authenticate,
  deleteDocument
);

export default router;


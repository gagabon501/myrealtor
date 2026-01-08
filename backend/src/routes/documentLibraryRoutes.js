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
  USER_OWNED_MODULES,
  isStaff,
} from "../policies/accessPolicies.js";
import { MODULES } from "../constants/documentLibrary.js";
import PropertyListingRequest from "../models/PropertyListingRequest.js";
import Document from "../models/Document.js";

const router = Router();

const storage = createDiskStorage("documents");
const upload = multer({ storage, limits: { files: 20 } });

// Optional auth: only authenticate if Authorization header is present with Bearer
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (
    authHeader &&
    typeof authHeader === "string" &&
    authHeader.startsWith("Bearer ")
  ) {
    return authenticate(req, res, next);
  }
  return next();
};

router.post(
  "/",
  authenticate,
  upload.array("files", 20),
  async (req, res, next) => {
    const role = getRole(req);
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const { module, ownerId } = req.body || {};
    if (!module) {
      return res.status(400).json({ message: "module is required" });
    }
    if (!canDocumentAccess({ action: "UPLOAD", role, module })) {
      return res.status(403).json({ message: "Forbidden" });
    }
    if (USER_OWNED_MODULES.includes(module) && !isStaff(role)) {
      if (!ownerId)
        return res.status(400).json({ message: "ownerId is required" });
      if (module === MODULES.PROPERTY_REQUEST) {
        if (req.body.category && req.body.category !== "ATTACHMENT") {
          return res
            .status(400)
            .json({ message: "ATS must be uploaded as ATTACHMENT" });
        }
        req.body.category = "ATTACHMENT";
      }
      if (module === MODULES.PROPERTY_REQUEST) {
        const reqDoc = await PropertyListingRequest.findById(ownerId).select(
          "createdBy"
        );
        if (!reqDoc)
          return res.status(404).json({ message: "Service request not found" });
        if (String(reqDoc.createdBy) !== String(req.user.id)) {
          return res.status(403).json({ message: "Forbidden" });
        }
      } else if (isServiceModule(module)) {
        const { found, owned } = await ownsServiceRequest({
          module,
          ownerId,
          userId: req.user.id,
        });
        if (!found)
          return res.status(404).json({ message: "Service request not found" });
        if (!owned) return res.status(403).json({ message: "Forbidden" });
      }
    }
    return uploadDocuments(req, res, next);
  }
);

router.get("/", optionalAuth, (req, res, next) => {
  const role = getRole(req);
  const { module, ownerId } = req.query || {};
  if (!module) {
    return res.status(400).json({ message: "module is required" });
  }
  if (!canDocumentAccess({ action: "LIST", role, module })) {
    return res.status(403).json({ message: "Forbidden" });
  }
  if (USER_OWNED_MODULES.includes(module) && !isStaff(role)) {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (!ownerId)
      return res.status(400).json({ message: "ownerId is required" });
    if (module === MODULES.PROPERTY_REQUEST) {
      return PropertyListingRequest.findById(ownerId)
        .select("createdBy")
        .then((rec) => {
          if (!rec)
            return res
              .status(404)
              .json({ message: "Service request not found" });
          if (String(rec.createdBy) !== String(req.user.id)) {
            return res.status(403).json({ message: "Forbidden" });
          }
          return listDocuments(req, res, next);
        })
        .catch(next);
    }
    return ownsServiceRequest({ module, ownerId, userId: req.user.id })
      .then(({ found, owned }) => {
        if (!found)
          return res.status(404).json({ message: "Service request not found" });
        if (!owned) return res.status(403).json({ message: "Forbidden" });
        return listDocuments(req, res, next);
      })
      .catch(next);
  }
  return listDocuments(req, res, next);
});
router.get("/meta", optionalAuth, documentLibraryMeta);

router.delete("/:id", authenticate, async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.id).select(
      "module uploadedBy"
    );
    if (!doc) return res.status(404).json({ message: "Document not found" });
    const role = getRole(req);
    if (isStaff(role)) {
      return deleteDocument(req, res, next);
    }
    if (
      USER_OWNED_MODULES.includes(doc.module) &&
      String(doc.uploadedBy) === String(req.user.id)
    ) {
      return deleteDocument(req, res, next);
    }
    return res.status(403).json({ message: "Forbidden" });
  } catch (err) {
    return next(err);
  }
});

export default router;

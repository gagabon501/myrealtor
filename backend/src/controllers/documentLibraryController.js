import fs from "fs";
import path from "path";
import Document from "../models/Document.js";
import { validationResult } from "express-validator";
import { buildDocumentRecords } from "../utils/upload.js";
import { recordAudit } from "../utils/audit.js";
import { getUploadsRoot } from "../utils/upload.js";
import { MODULE_LIST, REGISTRY } from "../constants/documentLibrary.js";

export const uploadDocuments = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { module, ownerType, ownerId, category } = req.body;
    const files = req.files || [];
    if (!files.length) {
      return res.status(400).json({ message: "No files uploaded" });
    }
    if (!module || !ownerType || !ownerId) {
      return res.status(400).json({
        message: "module, ownerType, ownerId, and category are required",
      });
    }
    if (!MODULE_LIST.includes(module)) {
      return res.status(400).json({
        message: `Invalid module. Allowed: ${MODULE_LIST.join(", ")}`,
      });
    }
    const registry = REGISTRY[module];
    if (!registry?.ownerTypes.includes(ownerType)) {
      return res.status(400).json({
        message: `Invalid ownerType for module ${module}. Allowed: ${registry.ownerTypes.join(
          ", "
        )}`,
      });
    }
    if (category && !registry.categories.includes(category)) {
      return res.status(400).json({
        message: `Invalid category for module ${module}. Allowed: ${registry.categories.join(
          ", "
        )}`,
      });
    }

    // Normalize descriptions to array matching files length
    const descRaw = req.body.descriptions ?? req.body.description;
    const descArray = Array.isArray(descRaw)
      ? descRaw
      : descRaw !== undefined
      ? [descRaw]
      : [];
    if (!descArray.length) {
      return res
        .status(400)
        .json({ message: "Document description is required for each file" });
    }
    if (descArray.length !== files.length) {
      return res
        .status(400)
        .json({ message: "Descriptions count must match uploaded files" });
    }
    if (descArray.some((d) => !d || !String(d).trim())) {
      return res
        .status(400)
        .json({ message: "Document description is required for each file" });
    }

    const labels = req.body.labels;
    const docsToCreate = buildDocumentRecords({
      files,
      module,
      ownerType,
      ownerId,
      category,
      descriptions: descArray,
      labels,
      uploadedBy: req.user?.id,
      subDir: "documents",
    });
    const created = await Document.insertMany(docsToCreate);
    await recordAudit({
      actor: req.user?.id || "SYSTEM",
      action: "DOCUMENT_UPLOADED",
      context: { module, ownerType, ownerId, count: created.length },
    });
    res.status(201).json(created);
  } catch (err) {
    if (err?.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }
    if (err?.message?.includes("Descriptions count")) {
      return res
        .status(400)
        .json({ message: "Descriptions count must match uploaded files" });
    }
    if (err?.message?.includes("Document description")) {
      return res
        .status(400)
        .json({ message: "Document description is required for each file" });
    }
    next(err);
  }
};

export const listDocuments = async (req, res, next) => {
  try {
    const { module, ownerType, ownerId, category } = req.query;
    const query = {};
    if (module) {
      if (!MODULE_LIST.includes(module)) {
        return res.status(400).json({
          message: `Invalid module. Allowed: ${MODULE_LIST.join(", ")}`,
        });
      }
      query.module = module;
    }
    if (ownerType) query.ownerType = ownerType;
    if (ownerId) query.ownerId = ownerId;
    if (category) query.category = category;
    const docs = await Document.find(query).sort({ createdAt: -1 });
    res.json(docs);
  } catch (err) {
    next(err);
  }
};

export const deleteDocument = async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    if (doc.filePath) {
      const uploadsRoot = getUploadsRoot();
      const relative = doc.filePath.replace("/uploads/", "uploads/");
      const absolute = path.resolve(
        uploadsRoot,
        relative.replace(/^uploads\//, "")
      );
      fs.unlink(absolute, () => {});
    }

    await Document.findByIdAndDelete(doc._id);
    await recordAudit({
      actor: req.user?.id || "SYSTEM",
      action: "DOCUMENT_DELETED",
      context: {
        documentId: doc._id.toString(),
        module: doc.module,
        ownerId: doc.ownerId?.toString(),
      },
    });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

export const documentLibraryMeta = (_req, res) => {
  res.json({
    modules: MODULE_LIST,
    registry: REGISTRY,
  });
};

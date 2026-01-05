import { validationResult } from "express-validator";
import Document from "../models/Document.js";
import { recordAudit } from "../utils/audit.js";

export const uploadDocument = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  if (!req.file) {
    return res.status(400).json({ message: "File is required" });
  }

  try {
    const { applicationId, type } = req.body;
    const doc = await Document.create({
      applicationId,
      type,
      fileName: req.file.filename,
      path: `/uploads/${req.file.filename}`,
      uploadedBy: req.user.id,
    });

    await recordAudit({
      actor: req.user.id,
      action: "DOCUMENT_UPLOADED",
      context: { documentId: doc._id.toString(), applicationId },
    });
    res.status(201).json(doc);
  } catch (err) {
    next(err);
  }
};

export const listDocuments = async (req, res, next) => {
  try {
    const docs = await Document.find({ applicationId: req.params.applicationId }).sort({
      createdAt: -1,
    });
    res.json(docs);
  } catch (err) {
    next(err);
  }
};

export const updateDocumentStatus = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { status, notes } = req.body;
    const doc = await Document.findByIdAndUpdate(
      req.params.id,
      { status, notes },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: "Document not found" });

    await recordAudit({
      actor: req.user.id,
      action: "DOCUMENT_STATUS_UPDATED",
      context: { documentId: doc._id.toString(), status },
    });
    res.json(doc);
  } catch (err) {
    next(err);
  }
};


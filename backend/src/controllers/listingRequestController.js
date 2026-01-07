import { validationResult } from "express-validator";
import PropertyListingRequest from "../models/PropertyListingRequest.js";
import Document from "../models/Document.js";
import { recordAudit } from "../utils/audit.js";

const auditWrap = async ({ actor, action, context }) =>
  recordAudit({ actor, action, context });

const ensureAtsDocumentExists = async (requestId) => {
  const count = await Document.countDocuments({
    module: "PROPERTY_REQUEST",
    ownerId: requestId,
    category: "ATTACHMENT",
  });
  return count > 0;
};

export const createListingRequest = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const draft = req.body.propertyDraft || {};
    const payload = {
      createdBy: req.user.id,
      propertyDraft: {
        title: draft.title,
        location: draft.location,
        price: draft.price,
        description: draft.description,
        tags: draft.tags,
        earnestMoneyRequired: draft.earnestMoneyRequired ?? false,
      },
      status: "ATS_PENDING",
    };
    const doc = await PropertyListingRequest.create(payload);
    await auditWrap({
      actor: req.user.id,
      action: "LISTING_REQUEST_SUBMITTED",
      context: { requestId: doc._id.toString() },
    });
    return res.status(201).json(doc);
  } catch (err) {
    return next(err);
  }
};

export const approveListingRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const exists = await ensureAtsDocumentExists(id);
    if (!exists) {
      return res.status(400).json({ message: "ATS document is required before approval" });
    }
    const doc = await PropertyListingRequest.findByIdAndUpdate(
      id,
      {
        status: "ATS_APPROVED",
        atsApprovedBy: req.user.id,
        atsApprovedAt: new Date(),
        atsRejectedReason: undefined,
      },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: "Listing request not found" });
    await auditWrap({
      actor: req.user.id,
      action: "ATS_APPROVED",
      context: { requestId: doc._id.toString() },
    });
    return res.json(doc);
  } catch (err) {
    return next(err);
  }
};

export const rejectListingRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body || {};
    const doc = await PropertyListingRequest.findByIdAndUpdate(
      id,
      {
        status: "ATS_REJECTED",
        atsApprovedBy: undefined,
        atsApprovedAt: undefined,
        atsRejectedReason: reason,
      },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: "Listing request not found" });
    await auditWrap({
      actor: req.user.id,
      action: "ATS_REJECTED",
      context: { requestId: doc._id.toString(), reason },
    });
    return res.json(doc);
  } catch (err) {
    return next(err);
  }
};

export const listMyListingRequests = async (req, res, next) => {
  try {
    const docs = await PropertyListingRequest.find({ createdBy: req.user.id }).sort({
      createdAt: -1,
    });
    return res.json(docs);
  } catch (err) {
    return next(err);
  }
};

export const listAllListingRequests = async (_req, res, next) => {
  try {
    const docs = await PropertyListingRequest.find().sort({ createdAt: -1 });
    return res.json(docs);
  } catch (err) {
    return next(err);
  }
};

export const getListingRequest = async (req, res, next) => {
  try {
    const doc = await PropertyListingRequest.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Listing request not found" });
    const role = req.user?.role || "public";
    const isStaff = role === "staff" || role === "admin";
    if (!isStaff && String(doc.createdBy) !== String(req.user.id)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    await auditWrap({
      actor: req.user?.id || "SYSTEM",
      action: "LISTING_REQUEST_VIEWED",
      context: { requestId: doc._id.toString() },
    });
    return res.json(doc);
  } catch (err) {
    return next(err);
  }
};


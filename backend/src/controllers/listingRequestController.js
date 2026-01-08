import { validationResult } from "express-validator";
import PropertyListingRequest from "../models/PropertyListingRequest.js";
import Document from "../models/Document.js";
import Property from "../models/Property.js";
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
        earnestMoneyRequired: false,
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
    const listing = await PropertyListingRequest.findById(id);
    if (!listing) return res.status(404).json({ message: "Listing request not found" });
    const exists = await ensureAtsDocumentExists(id);
    if (!exists) {
      return res.status(400).json({ message: "ATS document is required before approval" });
    }
    listing.status = "ATS_APPROVED";
    listing.atsApprovedBy = req.user.id;
    listing.atsApprovedAt = new Date();
    listing.atsRejectedReason = undefined;
    await listing.save();
    await auditWrap({
      actor: req.user.id,
      action: "ATS_APPROVED",
      context: { requestId: listing._id.toString() },
    });
    return res.json(listing);
  } catch (err) {
    return next(err);
  }
};

export const rejectListingRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body || {};
    const trimmed = String(reason || "").trim();
    if (!trimmed) {
      return res.status(400).json({ message: "Rejection reason is required" });
    }
    const listing = await PropertyListingRequest.findById(id);
    if (!listing) return res.status(404).json({ message: "Listing request not found" });
    listing.status = "ATS_REJECTED";
    listing.atsApprovedBy = undefined;
    listing.atsApprovedAt = undefined;
    listing.atsRejectedReason = trimmed;
    await listing.save();
    await auditWrap({
      actor: req.user.id,
      action: "ATS_REJECTED",
      context: { requestId: listing._id.toString(), reason: trimmed },
    });
    return res.json(listing);
  } catch (err) {
    return next(err);
  }
};

export const setEarnestMoneyRequired = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { earnestMoneyRequired } = req.body || {};
    const doc = await PropertyListingRequest.findByIdAndUpdate(
      id,
      { "propertyDraft.earnestMoneyRequired": Boolean(earnestMoneyRequired) },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: "Listing request not found" });
    await auditWrap({
      actor: req.user.id,
      action: "EARNEST_FLAG_UPDATED",
      context: { requestId: doc._id.toString(), earnestMoneyRequired: Boolean(earnestMoneyRequired) },
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

export const publishListingRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = await PropertyListingRequest.findById(id);
    if (!listing) return res.status(404).json({ message: "Listing request not found" });
    if (listing.status !== "ATS_APPROVED") {
      return res.status(400).json({ message: "ATS approval required before publishing" });
    }
    if (listing.publishedPropertyId) {
      return res.status(409).json({ message: "Listing already published" });
    }
    const payload = {
      title: listing.propertyDraft?.title,
      location: listing.propertyDraft?.location,
      price: listing.propertyDraft?.price,
      description: listing.propertyDraft?.description,
      tags: listing.propertyDraft?.tags,
      earnestMoneyRequired: listing.propertyDraft?.earnestMoneyRequired,
      status: "AVAILABLE",
      metadata: {
        source: "PROPERTY_REQUEST",
        requestId: listing._id,
      },
    };
    const property = await Property.create(payload);
    listing.publishedPropertyId = property._id;
    listing.publishedAt = new Date();
    await listing.save();
    await auditWrap({
      actor: req.user.id,
      action: "PROPERTY_PUBLISHED",
      context: { listingRequestId: listing._id.toString(), propertyId: property._id.toString() },
    });
    return res.status(201).json(property);
  } catch (err) {
    return next(err);
  }
};


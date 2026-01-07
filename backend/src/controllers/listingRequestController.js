import PropertyListingRequest from "../models/PropertyListingRequest.js";
import Property from "../models/Property.js";
import { recordAudit } from "../utils/audit.js";

const auditWrap = async ({ actor, action, context }) =>
  recordAudit({ actor, action, context });

export const createListingRequest = async (req, res, next) => {
  try {
    const payload = {
      createdBy: req.user.id,
      propertyDraft: req.body.propertyDraft || {},
      status: "SUBMITTED",
    };
    const doc = await PropertyListingRequest.create(payload);
    await auditWrap({
      actor: req.user.id,
      action: "PROPERTY_REQUEST_SUBMITTED",
      context: { requestId: doc._id.toString() },
    });
    res.status(201).json(doc);
  } catch (err) {
    next(err);
  }
};

export const listMyRequests = async (req, res, next) => {
  try {
    const docs = await PropertyListingRequest.find({ createdBy: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(docs);
  } catch (err) {
    next(err);
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
    res.json(doc);
  } catch (err) {
    next(err);
  }
};

export const reviewListingRequest = async (req, res, next) => {
  try {
    const { status, reviewerNotes } = req.body;
    const allowed = ["UNDER_REVIEW", "APPROVED", "REJECTED"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const doc = await PropertyListingRequest.findByIdAndUpdate(
      req.params.id,
      { status, reviewerNotes },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: "Listing request not found" });
    await auditWrap({
      actor: req.user.id,
      action:
        status === "APPROVED"
          ? "PROPERTY_REQUEST_APPROVED"
          : status === "REJECTED"
          ? "PROPERTY_REQUEST_REJECTED"
          : "PROPERTY_REQUEST_UNDER_REVIEW",
      context: { requestId: doc._id.toString(), status },
    });
    res.json(doc);
  } catch (err) {
    next(err);
  }
};

export const generateAts = async (req, res, next) => {
  try {
    const doc = await PropertyListingRequest.findByIdAndUpdate(
      req.params.id,
      {
        status: "ATS_PENDING",
        "ats.generatedAt": new Date(),
      },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: "Listing request not found" });
    await auditWrap({
      actor: req.user.id,
      action: "ATS_GENERATED",
      context: { requestId: doc._id.toString() },
    });
    res.json(doc);
  } catch (err) {
    next(err);
  }
};

export const signAts = async (req, res, next) => {
  try {
    const { signerName, signerEmail } = req.body;
    const doc = await PropertyListingRequest.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Listing request not found" });
    if (String(doc.createdBy) !== String(req.user.id)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    doc.ats = {
      ...(doc.ats || {}),
      signedAt: new Date(),
      signerName,
      signerEmail,
      signerUserId: req.user.id,
      signerIp: req.ip,
      accepted: true,
    };
    doc.status = "ATS_SIGNED";
    await doc.save();
    await auditWrap({
      actor: req.user.id,
      action: "ATS_SIGNED",
      context: { requestId: doc._id.toString() },
    });
    res.json(doc);
  } catch (err) {
    next(err);
  }
};

export const publishListing = async (req, res, next) => {
  try {
    const doc = await PropertyListingRequest.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Listing request not found" });
    if (doc.status !== "ATS_SIGNED") {
      return res.status(400).json({ message: "ATS must be signed before publishing" });
    }
    const created = await Property.create({
      ...doc.propertyDraft,
      status: "AVAILABLE",
    });
    doc.linkedPropertyId = created._id;
    doc.status = "PUBLISHED";
    await doc.save();
    await auditWrap({
      actor: req.user.id,
      action: "LISTING_PUBLISHED",
      context: { requestId: doc._id.toString(), propertyId: created._id.toString() },
    });
    res.json(doc);
  } catch (err) {
    next(err);
  }
};


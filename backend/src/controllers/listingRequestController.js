import { validationResult } from "express-validator";
import crypto from "crypto";
import PropertyListingRequest from "../models/PropertyListingRequest.js";
import Document from "../models/Document.js";
import Property from "../models/Property.js";
import { recordAudit } from "../utils/audit.js";
import { generateAtsPdf } from "../utils/pdfGenerator.js";

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
    console.log("[LR-CREATE] HIT", {
      ts: new Date().toISOString(),
      user: req.user?.id,
      ip: req.ip,
      idem:
        req.get("Idempotency-Key") ||
        req.body?.clientRequestId ||
        req.body?.idempotencyKey,
    });
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const draft = req.body.propertyDraft || {};
    const clientRequestIdHeader =
      req.get("Idempotency-Key") ||
      req.body?.clientRequestId ||
      req.body?.idempotencyKey;
    const fallbackKey = crypto
      .createHash("sha256")
      .update(
        `${req.user.id || ""}|${draft.title || ""}|${draft.location || ""}|${
          draft.price || ""
        }`
      )
      .digest("hex");
    const clientRequestId = clientRequestIdHeader || fallbackKey;

    if (clientRequestId) {
      const existing = await PropertyListingRequest.findOne({
        createdBy: req.user.id,
        $or: [{ idempotencyKey: clientRequestId }, { clientRequestId }],
      });
      if (existing) {
        return res.status(200).json(existing);
      }
    }

    if (!clientRequestIdHeader) {
      const recent = await PropertyListingRequest.findOne({
        createdBy: req.user.id,
        "propertyDraft.title": draft.title,
        "propertyDraft.location": draft.location,
        "propertyDraft.price": draft.price,
      })
        .sort({ createdAt: -1 })
        .lean();
      if (recent && Date.now() - new Date(recent.createdAt).getTime() < 10000) {
        return res.status(200).json(recent);
      }
    }
    const payload = {
      createdBy: req.user.id,
      propertyDraft: {
        title: draft.title,
        location: draft.location,
        price: draft.price,
        description: draft.description,
        tags: draft.tags,
        earnestMoneyRequired: Boolean(draft.earnestMoneyRequired),
        ...(draft.earnestMoneyRequired && draft.earnestMoneyAmount && {
          earnestMoneyAmount: Number(draft.earnestMoneyAmount),
        }),
      },
      status: "ATS_PENDING",
      idempotencyKey: clientRequestId,
      clientRequestId,
      // Include seller and signature if provided
      ...(req.body.seller && { seller: req.body.seller }),
      ...(req.body.signature && { signature: req.body.signature }),
    };
    const doc = await PropertyListingRequest.findOneAndUpdate(
      { createdBy: req.user.id, clientRequestId },
      { $setOnInsert: payload },
      { upsert: true, new: true }
    );
    await auditWrap({
      actor: req.user.id,
      action: "LISTING_REQUEST_SUBMITTED",
      context: { requestId: doc._id.toString() },
    });
    return res.status(201).json(doc);
  } catch (err) {
    if (err?.code === 11000) {
      const clientRequestId =
        req.get("Idempotency-Key") ||
        req.body?.clientRequestId ||
        req.body?.idempotencyKey;
      if (clientRequestId) {
        const existing = await PropertyListingRequest.findOne({
          createdBy: req.user.id,
          $or: [{ idempotencyKey: clientRequestId }, { clientRequestId }],
        });
        if (existing) return res.status(200).json(existing);
      }
    }
    return next(err);
  }
};

export const approveListingRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = await PropertyListingRequest.findById(id);
    if (!listing)
      return res.status(404).json({ message: "Listing request not found" });
    const exists = await ensureAtsDocumentExists(id);
    if (!exists) {
      return res
        .status(400)
        .json({ message: "ATS document is required before approval" });
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
    if (!listing)
      return res.status(404).json({ message: "Listing request not found" });
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
    if (!doc)
      return res.status(404).json({ message: "Listing request not found" });
    await auditWrap({
      actor: req.user.id,
      action: "EARNEST_FLAG_UPDATED",
      context: {
        requestId: doc._id.toString(),
        earnestMoneyRequired: Boolean(earnestMoneyRequired),
      },
    });
    return res.json(doc);
  } catch (err) {
    return next(err);
  }
};

export const listMyListingRequests = async (req, res, next) => {
  try {
    const docs = await PropertyListingRequest.find({
      createdBy: req.user.id,
    })
      .populate("publishedPropertyId", "status title location price")
      .sort({
        createdAt: -1,
      });
    return res.json(docs);
  } catch (err) {
    return next(err);
  }
};

export const listAllListingRequests = async (_req, res, next) => {
  try {
    const docs = await PropertyListingRequest.find()
      .populate("createdBy", "firstName lastName email")
      .populate("publishedPropertyId", "status title location price")
      .sort({ createdAt: -1 });
    return res.json(docs);
  } catch (err) {
    return next(err);
  }
};

export const getListingRequest = async (req, res, next) => {
  try {
    const doc = await PropertyListingRequest.findById(req.params.id);
    if (!doc)
      return res.status(404).json({ message: "Listing request not found" });
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
    if (!listing)
      return res.status(404).json({ message: "Listing request not found" });
    if (listing.status !== "ATS_APPROVED") {
      return res
        .status(400)
        .json({ message: "ATS approval required before publishing" });
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
      earnestMoneyAmount: listing.propertyDraft?.earnestMoneyAmount,
      status: "PUBLISHED",
      published: true,
      publishedAt: new Date(),
      metadata: {
        source: "PROPERTY_REQUEST",
        requestId: listing._id,
      },
    };
    const property = await Property.create(payload);
    listing.publishedPropertyId = property._id;
    listing.publishedAt = new Date();
    // Copy request photos to property
    const photos = await Document.find({
      module: "PROPERTY_REQUEST",
      ownerId: listing._id,
      category: "PHOTO",
    }).lean();
    if (photos?.length) {
      const topPhotos = photos.slice(0, 4);
      const propertyPhotos = topPhotos.map((p) => ({
        module: "PROPERTY",
        ownerType: "Property",
        ownerId: property._id,
        category: "PHOTO",
        label: p.label,
        description: p.description || "Photo",
        filePath: p.filePath,
        mimeType: p.mimeType,
        originalName: p.originalName,
        size: p.size,
        uploadedBy: p.uploadedBy || listing.createdBy || req.user.id,
      }));
      await Document.insertMany(propertyPhotos);
      property.images = topPhotos.map((p) => p.filePath).filter(Boolean);
    }
    await property.save();
    await listing.save();
    await auditWrap({
      actor: req.user.id,
      action: "PROPERTY_PUBLISHED",
      context: {
        listingRequestId: listing._id.toString(),
        propertyId: property._id.toString(),
      },
    });
    return res.status(201).json(property);
  } catch (err) {
    return next(err);
  }
};

export const updateSellerDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { seller, atsDetails, signature } = req.body;

    const listing = await PropertyListingRequest.findById(id);
    if (!listing) {
      return res.status(404).json({ message: "Listing request not found" });
    }

    // Only owner or staff can update
    const role = req.user?.role || "public";
    const isStaff = role === "staff" || role === "admin";
    if (!isStaff && String(listing.createdBy) !== String(req.user.id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Prevent updates after finalization
    if (listing.status === "ATS_FINALIZED") {
      return res.status(400).json({ message: "Cannot update finalized ATS" });
    }

    // Update fields
    if (seller) {
      listing.seller = {
        ...listing.seller,
        ...seller,
      };
    }

    if (atsDetails) {
      listing.atsDetails = {
        ...listing.atsDetails,
        ...atsDetails,
      };
    }

    if (signature) {
      listing.signature = {
        ...listing.signature,
        ...signature,
        signedAt: signature.consentChecked ? new Date() : listing.signature?.signedAt,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      };
    }

    await listing.save();

    await auditWrap({
      actor: req.user.id,
      action: "SELLER_DETAILS_UPDATED",
      context: { requestId: listing._id.toString() },
    });

    return res.json(listing);
  } catch (err) {
    return next(err);
  }
};

export const finalizeAts = async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = await PropertyListingRequest.findById(id);

    if (!listing) {
      return res.status(404).json({ message: "Listing request not found" });
    }

    if (listing.status !== "ATS_APPROVED") {
      return res.status(400).json({ message: "ATS must be approved before finalization" });
    }

    // Ensure seller details exist
    if (!listing.seller?.fullName) {
      return res.status(400).json({ message: "Seller details are required for finalization" });
    }

    // Ensure signature consent
    if (!listing.signature?.consentChecked) {
      return res.status(400).json({ message: "Seller signature consent is required" });
    }

    // Generate PDF
    const version = (listing.finalPdf?.version || 0) + 1;
    const pdfResult = await generateAtsPdf({
      requestId: listing._id.toString(),
      seller: listing.seller,
      propertyDraft: listing.propertyDraft,
      atsDetails: listing.atsDetails,
      signature: listing.signature,
      version,
    });

    listing.status = "ATS_FINALIZED";
    listing.finalPdf = {
      storageKey: pdfResult.storageKey,
      url: pdfResult.url,
      version,
      finalizedAt: new Date(),
      finalizedBy: req.user.id,
    };

    await listing.save();

    await auditWrap({
      actor: req.user.id,
      action: "ATS_FINALIZED",
      context: {
        requestId: listing._id.toString(),
        pdfVersion: version,
      },
    });

    return res.json(listing);
  } catch (err) {
    return next(err);
  }
};

export const getSellerByPropertyId = async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const listing = await PropertyListingRequest.findOne({
      publishedPropertyId: propertyId,
    }).select("seller atsDetails propertyDraft");

    if (!listing) {
      return res.status(404).json({ message: "Listing request not found for this property" });
    }

    return res.json({
      seller: listing.seller || {},
      atsDetails: listing.atsDetails || {},
      propertyDraft: listing.propertyDraft || {},
    });
  } catch (err) {
    return next(err);
  }
};

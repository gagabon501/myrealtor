import { validationResult } from "express-validator";
import EarnestMoneyAgreement from "../models/EarnestMoneyAgreement.js";
import Property from "../models/Property.js";
import { recordAudit } from "../utils/audit.js";
import { generateEmaPdf } from "../utils/pdfGenerator.js";

const auditWrap = async ({ actor, action, context }) =>
  recordAudit({ actor, action, context });

export const createEarnestMoneyAgreement = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { propertyId, executionDate, executionLocation, seller, buyer, titleNo, areaSqm, earnestMoneyAmount, totalPurchasePrice, deedExecutionDeadline, inquiryId, applicationId, notes } = req.body;

    // Verify property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    const ema = await EarnestMoneyAgreement.create({
      propertyId,
      inquiryId,
      applicationId,
      executionDate,
      executionLocation,
      seller,
      buyer,
      titleNo,
      areaSqm,
      earnestMoneyAmount,
      totalPurchasePrice,
      deedExecutionDeadline,
      status: "DRAFT",
      createdBy: req.user.id,
      notes,
    });

    await auditWrap({
      actor: req.user.id,
      action: "EARNEST_MONEY_CREATED",
      context: { emaId: ema._id.toString(), propertyId },
    });

    res.status(201).json(ema);
  } catch (err) {
    next(err);
  }
};

export const getEarnestMoneyAgreement = async (req, res, next) => {
  try {
    const ema = await EarnestMoneyAgreement.findById(req.params.id)
      .populate("propertyId", "title location price")
      .populate("createdBy", "email profile.fullName");

    if (!ema) {
      return res.status(404).json({ message: "Earnest Money Agreement not found" });
    }

    res.json(ema);
  } catch (err) {
    next(err);
  }
};

export const listEarnestMoneyAgreements = async (req, res, next) => {
  try {
    const { propertyId, status } = req.query;
    const filter = {};
    if (propertyId) filter.propertyId = propertyId;
    if (status) filter.status = status;

    const emas = await EarnestMoneyAgreement.find(filter)
      .populate("propertyId", "title location price")
      .sort({ createdAt: -1 });

    res.json(emas);
  } catch (err) {
    next(err);
  }
};

export const updateEarnestMoneyAgreement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ema = await EarnestMoneyAgreement.findById(id);

    if (!ema) {
      return res.status(404).json({ message: "Earnest Money Agreement not found" });
    }

    if (ema.status === "FINAL") {
      return res.status(400).json({ message: "Cannot edit finalized agreement" });
    }

    const allowedFields = ["executionDate", "executionLocation", "seller", "buyer", "titleNo", "areaSqm", "earnestMoneyAmount", "totalPurchasePrice", "deedExecutionDeadline", "notes"];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        ema[field] = req.body[field];
      }
    }

    await ema.save();

    await auditWrap({
      actor: req.user.id,
      action: "EARNEST_MONEY_UPDATED",
      context: { emaId: ema._id.toString() },
    });

    res.json(ema);
  } catch (err) {
    next(err);
  }
};

export const finalizeEarnestMoneyAgreement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ema = await EarnestMoneyAgreement.findById(id)
      .populate("propertyId", "title location");

    if (!ema) {
      return res.status(404).json({ message: "Earnest Money Agreement not found" });
    }

    if (ema.status === "FINAL") {
      return res.status(400).json({ message: "Agreement already finalized" });
    }

    // Generate PDF
    const version = (ema.finalPdf?.version || 0) + 1;
    const pdfResult = await generateEmaPdf({
      emaId: ema._id.toString(),
      executionDate: ema.executionDate,
      executionLocation: ema.executionLocation,
      propertyTitle: ema.propertyId?.title,
      propertyLocation: ema.propertyId?.location,
      seller: ema.seller,
      buyer: ema.buyer,
      titleNo: ema.titleNo,
      areaSqm: ema.areaSqm,
      earnestMoneyAmount: ema.earnestMoneyAmount,
      totalPurchasePrice: ema.totalPurchasePrice,
      deedExecutionDeadline: ema.deedExecutionDeadline,
      version,
    });

    ema.status = "FINAL";
    ema.finalPdf = {
      storageKey: pdfResult.storageKey,
      url: pdfResult.url,
      version,
      finalizedAt: new Date(),
      finalizedBy: req.user.id,
    };

    await ema.save();

    await auditWrap({
      actor: req.user.id,
      action: "EARNEST_MONEY_FINALIZED",
      context: { emaId: ema._id.toString(), version },
    });

    res.json(ema);
  } catch (err) {
    next(err);
  }
};

export const previewEarnestMoneyAgreement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ema = await EarnestMoneyAgreement.findById(id)
      .populate("propertyId", "title location");

    if (!ema) {
      return res.status(404).json({ message: "Earnest Money Agreement not found" });
    }

    if (ema.status === "FINAL") {
      return res.status(400).json({ message: "Agreement already finalized, use download instead" });
    }

    // Generate preview PDF (version 0 = preview)
    const pdfResult = await generateEmaPdf({
      emaId: ema._id.toString(),
      executionDate: ema.executionDate,
      executionLocation: ema.executionLocation,
      propertyTitle: ema.propertyId?.title,
      propertyLocation: ema.propertyId?.location,
      seller: ema.seller,
      buyer: ema.buyer,
      titleNo: ema.titleNo,
      areaSqm: ema.areaSqm,
      earnestMoneyAmount: ema.earnestMoneyAmount,
      totalPurchasePrice: ema.totalPurchasePrice,
      deedExecutionDeadline: ema.deedExecutionDeadline,
      version: 0,
      isPreview: true,
    });

    res.json({ previewUrl: pdfResult.url });
  } catch (err) {
    next(err);
  }
};

export const voidEarnestMoneyAgreement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const ema = await EarnestMoneyAgreement.findById(id);

    if (!ema) {
      return res.status(404).json({ message: "Earnest Money Agreement not found" });
    }

    ema.status = "VOID";
    ema.notes = reason ? `${ema.notes || ""}\nVOIDED: ${reason}`.trim() : ema.notes;
    await ema.save();

    await auditWrap({
      actor: req.user.id,
      action: "EARNEST_MONEY_VOIDED",
      context: { emaId: ema._id.toString(), reason },
    });

    res.json(ema);
  } catch (err) {
    next(err);
  }
};

export const getEarnestMoneyByProperty = async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const emas = await EarnestMoneyAgreement.find({ propertyId })
      .populate("propertyId", "title location price")
      .sort({ createdAt: -1 });

    res.json(emas);
  } catch (err) {
    next(err);
  }
};

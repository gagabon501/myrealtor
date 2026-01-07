import { validationResult } from "express-validator";
import BuyerInquiry from "../models/BuyerInquiry.js";
import { recordAudit } from "../utils/audit.js";

export const createInquiry = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const inquiry = await BuyerInquiry.create({
      propertyId: req.body.propertyId,
      name: req.body.name,
      address: req.body.address,
      phone: req.body.phone,
      email: req.body.email,
      notes: req.body.notes,
    });
    await recordAudit({
      actor: req.body.email || "public",
      action: "INQUIRY_CREATED",
      context: { inquiryId: inquiry._id.toString(), propertyId: inquiry.propertyId?.toString() },
    });
    res.status(201).json(inquiry);
  } catch (err) {
    next(err);
  }
};

export const listInquiries = async (_req, res, next) => {
  try {
    const inquiries = await BuyerInquiry.find().sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (err) {
    next(err);
  }
};

export const updateInquiryStatus = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const updated = await BuyerInquiry.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Inquiry not found" });

    await recordAudit({
      actor: req.user?.id || "system",
      action: "INQUIRY_STATUS_UPDATED",
      context: { inquiryId: updated._id.toString(), status: updated.status },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};


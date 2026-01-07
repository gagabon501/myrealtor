import { validationResult } from "express-validator";
import BuyerInquiry from "../models/BuyerInquiry.js";
import { recordAudit } from "../utils/audit.js";

export const createInquiry = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { propertyId, buyer, notes } = req.body;
    const inquiry = await BuyerInquiry.create({
      propertyId,
      buyer,
      notes,
    });
    await recordAudit({
      actor: req.user?.id || "SYSTEM",
      action: "INQUIRY_CREATED",
      context: {
        inquiryId: inquiry._id.toString(),
        propertyId: inquiry.propertyId?.toString(),
      },
    });
    res.status(201).json(inquiry);
  } catch (err) {
    next(err);
  }
};

export const listInquiries = async (req, res, next) => {
  try {
    const { status, propertyId, search } = req.query;
    const query = {};
    if (status) query.status = status.toUpperCase();
    if (propertyId) query.propertyId = propertyId;
    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [
        { "buyer.name": regex },
        { "buyer.email": regex },
        { "buyer.phone": regex },
      ];
    }
    const inquiries = await BuyerInquiry.find(query)
      .populate("propertyId", "title location price status")
      .sort({ createdAt: -1 });
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
      actor: req.user?.id || "SYSTEM",
      action: "INQUIRY_STATUS_UPDATED",
      context: { inquiryId: updated._id.toString(), status: updated.status },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};


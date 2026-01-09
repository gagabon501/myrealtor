import { validationResult } from "express-validator";
import Application from "../models/Application.js";
import Property from "../models/Property.js";
import { recordAudit } from "../utils/audit.js";

export const createApplication = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { propertyId, notes } = req.body;
    const property = await Property.findById(propertyId);
    if (!property)
      return res.status(404).json({ message: "Property not found" });

    const existing = await Application.findOne({
      propertyId,
      userId: req.user.id,
    });
    if (existing) {
      return res.status(409).json({ message: "Application already exists" });
    }

    const application = await Application.create({
      userId: req.user.id,
      propertyId,
      notes,
      status: "SUBMITTED",
    });

    await recordAudit({
      actor: req.user.id,
      action: "APPLICATION_CREATED",
      context: { applicationId: application._id.toString() },
    });

    res.status(201).json(application);
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: "Application already exists" });
    }
    next(err);
  }
};

export const myApplications = async (req, res, next) => {
  try {
    const apps = await Application.find({ userId: req.user.id })
      .populate("propertyId")
      .populate("assignedTo")
      .sort({ createdAt: -1 });
    res.json(apps);
  } catch (err) {
    next(err);
  }
};

export const listApplications = async (_req, res, next) => {
  try {
    const apps = await Application.find()
      .populate("userId")
      .populate("propertyId")
      .populate("assignedTo")
      .sort({ createdAt: -1 });
    res.json(apps);
  } catch (err) {
    next(err);
  }
};

export const getApplication = async (req, res, next) => {
  try {
    const app = await Application.findById(req.params.id)
      .populate("userId")
      .populate("propertyId")
      .populate("assignedTo");
    if (!app) return res.status(404).json({ message: "Application not found" });

    const isOwner = req.user?.id === app.userId?.toString();
    const isStaff = ["staff", "admin"].includes(req.user?.role);
    if (!isOwner && !isStaff) {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.json(app);
  } catch (err) {
    next(err);
  }
};

export const updateWorkflow = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { status } = req.body;
    const allowed = ["SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED", "WITHDRAWN"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const application = await Application.findById(req.params.id);
    if (!application)
      return res.status(404).json({ message: "Application not found" });

    const fromStatus = application.status;
    application.status = status;
    await application.save();

    await recordAudit({
      actor: req.user.id,
      action: "APPLICATION_STATUS_UPDATED",
      context: {
        applicationId: application._id.toString(),
        from: fromStatus,
        to: status,
      },
    });
    res.json(application);
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: "Application already exists" });
    }
    next(err);
  }
};

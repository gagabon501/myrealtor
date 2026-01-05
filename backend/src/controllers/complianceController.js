import { validationResult } from "express-validator";
import ComplianceTask from "../models/ComplianceTask.js";
import Application from "../models/Application.js";
import { recordAudit } from "../utils/audit.js";

const ensureAccess = async (applicationId, user) => {
  const app = await Application.findById(applicationId).select("userId");
  if (!app) {
    const err = new Error("Application not found");
    err.statusCode = 404;
    throw err;
  }
  const isStaff = ["staff", "admin"].includes(user?.role);
  const isOwner = app.userId?.toString() === user?.id;
  if (!isStaff && !isOwner) {
    const err = new Error("Forbidden");
    err.statusCode = 403;
    throw err;
  }
  return app;
};

export const createTask = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { applicationId, agency, title, dueDate, notes } = req.body;
    const task = await ComplianceTask.create({
      applicationId,
      agency,
      title,
      dueDate,
      notes,
    });

    await recordAudit({
      actor: req.user.id,
      action: "COMPLIANCE_TASK_CREATED",
      context: { taskId: task._id.toString(), applicationId },
    });

    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

export const listTasks = async (req, res, next) => {
  try {
    await ensureAccess(req.params.applicationId, req.user);
    const tasks = await ComplianceTask.find({ applicationId: req.params.applicationId }).sort({
      createdAt: -1,
    });
    res.json(tasks);
  } catch (err) {
    next(err);
  }
};

export const updateTask = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { status, notes } = req.body;
    const update = { status, notes };
    if (status === "COMPLETED") {
      update.completedAt = new Date();
    }

    const task = await ComplianceTask.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!task) return res.status(404).json({ message: "Task not found" });

    await recordAudit({
      actor: req.user.id,
      action: "COMPLIANCE_TASK_UPDATED",
      context: { taskId: task._id.toString(), status },
    });

    res.json(task);
  } catch (err) {
    next(err);
  }
};


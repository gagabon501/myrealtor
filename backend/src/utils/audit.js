import AuditLog from "../models/AuditLog.js";

export const recordAudit = async ({ actor, action, context = {} }) => {
  try {
    await AuditLog.create({
      actor,
      action,
      context,
      timestamp: new Date(),
    });
  } catch (err) {
    console.error("Failed to record audit", err);
  }
};

